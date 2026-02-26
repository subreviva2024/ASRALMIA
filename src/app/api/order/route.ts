import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

interface OrderItem {
  pid: string;
  vid: string;
  name: string;
  image: string;
  priceEur: number;
  qty: number;
  shippingLabel: string;
}

interface OrderPayload {
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
    notes: string;
  };
  items: OrderItem[];
  total: number;
}

/** Validate PT postal code: ####-### or #### ### or ####### */
function isValidPTZip(zip: string): boolean {
  return /^\d{4}[\s-]?\d{3}$/.test(zip.trim());
}

/** Basic email validation */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Persist order to JSON file as backup (production: replace with DB) */
function persistOrder(order: Record<string, unknown>) {
  try {
    const ordersDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(ordersDir)) fs.mkdirSync(ordersDir, { recursive: true });
    const filePath = path.join(ordersDir, "orders.json");
    const existing = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf-8")) : [];
    existing.push(order);
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.error("[Order] Failed to persist order:", err);
  }
}

/**
 * POST /api/order
 * Receives an order from the cart checkout.
 * Validates all fields, persists to JSON file, logs for processing.
 */
export async function POST(req: NextRequest) {
  try {
    const payload: OrderPayload = await req.json();
    const { customer, items, total } = payload;

    // Validate required fields
    if (!customer?.name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }
    if (!customer?.email || !isValidEmail(customer.email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    if (!customer?.address?.trim()) {
      return NextResponse.json({ error: "Morada é obrigatória" }, { status: 400 });
    }
    if (!customer?.city?.trim()) {
      return NextResponse.json({ error: "Cidade é obrigatória" }, { status: 400 });
    }
    if (!customer?.zip || !isValidPTZip(customer.zip)) {
      return NextResponse.json({ error: "Código postal inválido (formato: ####-###)" }, { status: 400 });
    }
    if (!items?.length) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    // Recalculate total server-side (don't trust client total)
    const calculatedTotal = items.reduce((sum, item) => sum + item.priceEur * item.qty, 0);
    const serverTotal = Math.round(calculatedTotal * 100) / 100;

    const orderRef = `AST-${Date.now().toString(36).toUpperCase()}`;
    const orderDate = new Date().toISOString();

    const order = {
      orderRef,
      orderDate,
      status: "PENDING",
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone?.trim() || "",
        address: customer.address.trim(),
        city: customer.city.trim(),
        zip: customer.zip.trim(),
        country: "PT",
        notes: customer.notes?.trim() || "",
      },
      items: items.map((item) => ({
        pid: item.pid,
        vid: item.vid,
        name: item.name,
        image: item.image,
        priceEur: item.priceEur,
        qty: item.qty,
        subtotal: Math.round(item.priceEur * item.qty * 100) / 100,
        shippingLabel: item.shippingLabel,
      })),
      total: serverTotal,
    };

    // Persist to file (backup)
    persistOrder(order);

    // Console log for monitoring
    console.log("=== NOVA ENCOMENDA ===");
    console.log(`Ref: ${orderRef}`);
    console.log(`Data: ${orderDate}`);
    console.log(`Cliente: ${customer.name} <${customer.email}>`);
    console.log(`Morada: ${customer.address}, ${customer.zip} ${customer.city}`);
    if (customer.phone) console.log(`Tel: ${customer.phone}`);
    if (customer.notes) console.log(`Notas: ${customer.notes}`);
    console.log(`Artigos:`);
    items.forEach((item) => {
      console.log(`  - ${item.name} × ${item.qty} = €${(item.priceEur * item.qty).toFixed(2)} | ${item.shippingLabel}`);
    });
    console.log(`Total: €${serverTotal.toFixed(2)}`);
    console.log("====================");

    return NextResponse.json({
      success: true,
      orderRef,
      total: serverTotal,
      message: "Encomenda registada com sucesso. Entraremos em contacto em breve.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
