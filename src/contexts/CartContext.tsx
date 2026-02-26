"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CartItem {
  pid: string;
  vid: string;
  name: string;
  image: string;
  priceEur: number;       // display / sell price in EUR
  costEur: number;        // our cost (cjPrice + shipping) for reference
  shippingLabel: string;  // e.g. "ePacket · 5-12 dias"
  qty: number;
}

interface CartContextType {
  items: CartItem[];
  count: number;        // total units
  total: number;        // sum of priceEur * qty
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (pid: string, vid: string) => void;
  updateQty: (pid: string, vid: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "astralmia_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on first render (client only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // corrupted storage — ignore
    }
    setHydrated(true);
  }, []);

  // Persist every change after hydration
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // ignore quota errors
      }
    }
  }, [items, hydrated]);

  const addItem = useCallback((newItem: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.pid === newItem.pid && i.vid === newItem.vid);
      if (idx >= 0) {
        // already in cart — increment
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 };
        return updated;
      }
      return [...prev, { ...newItem, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((pid: string, vid: string) => {
    setItems((prev) => prev.filter((i) => !(i.pid === pid && i.vid === vid)));
  }, []);

  const updateQty = useCallback((pid: string, vid: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => !(i.pid === pid && i.vid === vid)));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.pid === pid && i.vid === vid ? { ...i, qty } : i))
      );
    }
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const total = items.reduce((sum, i) => sum + i.priceEur * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
