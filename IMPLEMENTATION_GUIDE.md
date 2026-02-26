# ASTRALMIA — Guia de Implementação Completo

> **Documento de referência para replicar o sistema ASTRALMIA com outras lojas.**
> Versão: 4.0 | Data: 2026-02-26 | Integração: OpenClaw + CJ Dropshipping API v2.0

---

## Índice

1. [Visão Geral da Arquitectura](#1-visão-geral-da-arquitectura)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estrutura do Projecto](#3-estrutura-do-projecto)
4. [CJ Dropshipping API — Cobertura Total](#4-cj-dropshipping-api--cobertura-total)
5. [Subsistemas Autónomos](#5-subsistemas-autónomos)
6. [Configuração do Servidor](#6-configuração-do-servidor)
7. [Isolamento Multi-Projecto (Ultra Rigor)](#7-isolamento-multi-projecto-ultra-rigor)
8. [Deploy Passo a Passo](#8-deploy-passo-a-passo)
9. [API HTTP — Todos os Endpoints](#9-api-http--todos-os-endpoints)
10. [Integração OpenClaw](#10-integração-openclaw)
11. [Replicar para Nova Loja](#11-replicar-para-nova-loja)
12. [Manutenção e Monitorização](#12-manutenção-e-monitorização)

---

## 1. Visão Geral da Arquitectura

```
┌──────────────────────────────────────────────────────────────────┐
│                    ASTRALMIA SYSTEM v4.0                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Next.js    │  │   OpenClaw   │  │   CJ API v2.0        │   │
│  │   Frontend   │──│   Engine     │──│   42 Methods          │   │
│  │   (Vercel)   │  │   (Port X)   │  │   100% Coverage       │   │
│  └──────────────┘  └──────┬───────┘  └──────────────────────┘   │
│                           │                                      │
│           ┌───────────────┼───────────────┐                      │
│           │               │               │                      │
│  ┌────────▼──────┐ ┌──────▼───────┐ ┌─────▼──────────┐         │
│  │   Catalog     │ │   Order      │ │   Inventory    │         │
│  │   Scanner     │ │   Manager    │ │   Monitor      │         │
│  │   (4h ciclos) │ │   (5m ciclos)│ │   (2h ciclos)  │         │
│  └───────────────┘ └──────────────┘ └────────────────┘         │
│                                                                  │
│  ┌───────────────┐                                              │
│  │   Dispute     │                                              │
│  │   Manager     │    Tudo gerido por PM2 (namespace isolado)   │
│  │   (30m ciclos)│                                              │
│  └───────────────┘                                              │
└──────────────────────────────────────────────────────────────────┘
```

O sistema funciona como uma **máquina autónoma de vendas 24/7**:

- **Frontend (Next.js)** — Hospedado no Vercel, apresenta produtos ao cliente
- **Engine (Node.js)** — Servidor HTTP no Lightsail, processa TODA a lógica
- **CJ API** — Comunicação directa com fornecedor para fulfilment automático
- **4 Subsistemas** — Daemons autónomos que correm em ciclos independentes

---

## 2. Stack Tecnológico

| Componente | Tecnologia | Versão |
|---|---|---|
| Frontend | Next.js + React + TailwindCSS | 15.x |
| Engine/Backend | Node.js (ESM puro, zero deps) | 22.x |
| Process Manager | PM2 | 6.0.14 |
| Servidor | AWS Lightsail (Ubuntu) | 24.04 LTS |
| API Fornecedor | CJ Dropshipping v2.0 | 42 métodos |
| Runtime | OpenClaw | 2026.2.22-2 |
| Hosting Frontend | Vercel | - |
| Reverse Proxy | Nginx | - |

**Princípio fundamental**: Zero dependências npm no engine. Tudo feito com Node.js core (`http`, `fs`, `crypto`).

---

## 3. Estrutura do Projecto

```
projeto-loja/
├── openclaw/
│   ├── .env                          # Credenciais (NUNCA no git)
│   ├── ecosystem.config.cjs          # PM2 config (isolado por namespace)
│   └── engine/
│       ├── main.js                   # Servidor HTTP v4.0 + orquestrador
│       ├── cj-client.js              # Cliente CJ API (42 métodos)
│       ├── catalog-scanner.js        # Scanner autónomo (4h ciclos)
│       ├── product-engine.js         # Pipeline de tradução/preços
│       ├── order-manager.js          # Lifecycle de encomendas (5m)
│       ├── inventory-monitor.js      # Monitor de stock (2h)
│       ├── dispute-manager.js        # Gestão de disputas (30m)
│       ├── test-all.js               # 33 testes
│       └── data/
│           ├── catalog.json          # Catálogo processado
│           ├── orders.json           # Estado das encomendas
│           ├── inventory.json        # Dados de stock
│           └── disputes.json         # Histórico de disputas
├── bot/                              # Chatbot (se aplicável)
│   └── server.js
├── src/                              # Next.js frontend
│   ├── app/
│   │   ├── api/                      # API routes (proxy para engine)
│   │   ├── loja/                     # Páginas de produto
│   │   └── carrinho/                 # Checkout
│   └── components/
└── public/
```

---

## 4. CJ Dropshipping API — Cobertura Total

O `cj-client.js` implementa **TODOS os 42 endpoints** da CJ API v2.0:

### Autenticação (3 métodos)
| Método | Endpoint | Função |
|---|---|---|
| `getAccessToken()` | `POST /authentication/getAccessToken` | Obter token (15 dias) |
| `refreshAccessToken()` | `POST /authentication/refreshAccessToken` | Renovar token |
| `_ensureToken()` | Auto | Gestão automática do ciclo de vida |

### Produtos (9 métodos)
| Método | Endpoint | Função |
|---|---|---|
| `listProducts(params)` | `GET /product/list` | Listar com filtros/paginação |
| `getProductDetails(pid)` | `GET /product/query` | Detalhes completos |
| `searchProducts(query)` | `GET /product/list` | Busca por palavras-chave |
| `getProductVariants(pid)` | `GET /product/variant/query` | Variantes de produto |
| `getCategories()` | `GET /product/getCategory` | Árvore de categorias |
| `confirmProductList(pids)` | `POST /product/stock/confirmProductList` | Confirmar lista |
| `getComments(pid)` | `GET /product/comments` | Comentários/reviews |
| `getProductSupplier(pid)` | `GET /product/supplier` | Info do fornecedor |
| `getProductFreight(params)` | `POST /product/freight` | Calcular frete |

### Stock (4 métodos)
| Método | Endpoint | Função |
|---|---|---|
| `getStockInfo(vid)` | `GET /product/stock/queryByVid` | Stock por variante |
| `getStockByVids(vids)` | `POST /product/stock/queryByVids` | Stock em batch |
| `getStockBySku(sku)` | `GET /product/stock/queryBySku` | Stock por SKU |
| `getStockBySkus(skus)` | `POST /product/stock/queryBySkus` | Stock SKUs em batch |

### Armazéns (2 métodos)
| Método | Endpoint | Função |
|---|---|---|
| `listWarehouses()` | `GET /warehouse/list` | Listar armazéns |
| `getWarehouseInventory(whId)` | `GET /warehouse/inventory` | Inventário por armazém |

### Sourcing (2 métodos)
| Método | Endpoint | Função |
|---|---|---|
| `createSourcing(params)` | `POST /product/sourcing/create` | Criar pedido sourcing |
| `listSourcing(params)` | `GET /product/sourcing/list` | Listar pedidos |

### Logística (4 métodos)
| Método | Endpoint | Função |
|---|---|---|
| `getLogisticsChannels(params)` | `POST /logistic/freightCalculate` | Canais disponíveis |
| `getTrackingInfo(trackNum)` | `GET /logistic/getTrackInfo` | Tracking |
| `getLogisticList()` | `GET /logistic/list` | Lista de transportadoras |
| `calculateFreight(params)` | `POST /logistic/freightCalculate` | Calcular frete |

### Carrinho (2 métodos)
| Método | Endpoint | Função |
|---|---|---|
| `addToCart(items)` | `POST /shopping/cart/add` | Adicionar ao carrinho |
| `getCartList()` | `GET /shopping/cart/list` | Listar carrinho |

### Encomendas (8 métodos)
| Método | Endpoint | Função |
|---|---|---|
| `createOrder(params)` | `POST /shopping/order/createOrder` | Criar encomenda |
| `listOrders(params)` | `GET /shopping/order/list` | Listar encomendas |
| `getOrderDetail(orderId)` | `GET /shopping/order/getOrderDetail` | Detalhes |
| `confirmOrder(orderId)` | `PATCH /shopping/order/confirmOrder` | Confirmar |
| `deleteOrder(orderId)` | `DELETE /shopping/order/deleteOrder` | Apagar |
| `getOrderProducts(orderId)` | `GET /shopping/order/getOrderProduct` | Produtos da encomenda |
| `getOrderShipping(orderId)` | `GET /shopping/order/getOrderShipping` | Info envio |
| `getOrderPayment(orderId)` | `GET /shopping/order/getOrderPayment` | Info pagamento |

### Envio (3 métodos)
| Método | Endpoint | Função |
|---|---|---|
| `getShippingMethods(params)` | `POST /shipping/method` | Métodos disponíveis |
| `getShippingLabel(orderId)` | `GET /shipping/label` | Label de envio |
| `getShippingTracking(orderId)` | `GET /shipping/tracking` | Tracking de envio |

### Pagamento (3 métodos)
| Método | Endpoint | Função |
|---|---|---|
| `getBalance()` | `GET /shopping/pay/getBalance` | Saldo CJ |
| `payOrder(orderId)` | `POST /shopping/pay/payOrder` | Pagar encomenda |
| `getPaymentHistory(params)` | `GET /shopping/pay/payHistory` | Histórico |

### Disputas (5 métodos)
| Método | Endpoint | Função |
|---|---|---|
| `createDispute(params)` | `POST /shopping/dispute/create` | Criar disputa |
| `listDisputes(params)` | `GET /shopping/dispute/list` | Listar |
| `getDisputeDetail(disputeId)` | `GET /shopping/dispute/detail` | Detalhes |
| `respondDispute(params)` | `POST /shopping/dispute/respond` | Responder |
| `cancelDispute(disputeId)` | `POST /shopping/dispute/cancel` | Cancelar |

### Definições (1 método)
| Método | Endpoint | Função |
|---|---|---|
| `getSettings()` | `GET /setting/info` | Info da conta |

### Funcionalidades Internas
- **Rate Limiting**: 350ms entre chamadas (respeita limites CJ)
- **Retry com Backoff Exponencial**: 3 tentativas com delays crescentes
- **Token Lifecycle**: Renovação automática a cada 15 dias, refresh a 180 dias
- **Zero Dependências**: Usa apenas `https` e `crypto` do Node.js

---

## 5. Subsistemas Autónomos

### 5.1 Catalog Scanner (`catalog-scanner.js`)

```
Ciclo: 4 horas
Queries: 35+ termos de busca (esotérico, astrologia, cristais, etc.)
Pipeline: CJ Search → Product Details → Translate → Price → Catalog
Output: data/catalog.json
```

**Pipeline de produto (7 gates)**:
1. **Search** — Busca por keyword na CJ API
2. **Details** — Obtém detalhes completos (imagens, variantes)
3. **Analyse** — Filtro de qualidade (rating, vendas, preço)
4. **Translate** — Tradução EN→PT com 38+ regras
5. **Price** — Markup calculado (margem mín. 40%)
6. **Enrich** — Metadados SEO, categorias, descrições
7. **Store** — Guarda no catálogo com deduplicação

### 5.2 Order Manager (`order-manager.js`)

```
Ciclo: 5 minutos
Estados: PENDING → CONFIRMED → PAID → SHIPPED → DELIVERED
Auto: Confirma, paga, e envia automaticamente
Output: data/orders.json
```

**Fluxo automático**:
1. Frontend cria ordem via API → estado `PENDING`
2. Order Manager detecta → verifica stock CJ → `CONFIRMED`
3. Verifica saldo CJ → se OK → `PAID`
4. CJ processa envio → tracking atualizado → `SHIPPED`
5. Tracking mostra entrega → `DELIVERED`

**Funcionalidades**:
- Retry queue para ordens falhadas
- Verificação de saldo antes de pagar
- Sync com estado CJ em cada ciclo
- Alertas para problemas de stock/envio

### 5.3 Inventory Monitor (`inventory-monitor.js`)

```
Ciclo: 2 horas
Threshold: LOW_STOCK < 5 unidades
Alerta: Mudança de preço > 15%
Output: data/inventory.json
```

**Funcionalidades**:
- Verifica stock de TODOS os produtos do catálogo
- Desactiva automaticamente produtos sem stock
- Reactiva quando stock volta
- Detecta mudanças de preço significativas
- Histórico de preços para análise

### 5.4 Dispute Manager (`dispute-manager.js`)

```
Ciclo: 30 minutos
Auto-detecta: Sem envio (7d), tracking parado (15d), timeout entrega (45d)
Output: data/disputes.json
```

**Detecção automática de problemas**:
- Encomenda não expedida após 7 dias → abre disputa
- Tracking sem actualização após 15 dias → abre disputa
- Entrega não confirmada após 45 dias → abre disputa
- Verifica resposta do CJ e actualiza estado

---

## 6. Configuração do Servidor

### 6.1 Servidor Base

```bash
# AWS Lightsail — Ubuntu 24.04 LTS
# Mínimo: 1 vCPU, 2GB RAM, 60GB SSD

# Instalar Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 global
sudo npm install -g pm2

# Instalar OpenClaw
curl -sSL https://openclaw.dev/install.sh | bash
```

### 6.2 Ficheiro .env

```env
# ── CJ Dropshipping API ──
CJ_API_KEY=CHAVE_API_CJ_AQUI
CJ_BASE_URL=https://developers.cjdropshipping.com/api2.0/v1
# Nota: A chave obtém-se em developers.cjdropshipping.com

# ── Engine ──
ASTRALMIA_PORT=4002
SCAN_INTERVAL_HOURS=4

# ── Webhook (opcional) ──
WEBHOOK_SECRET=segredo-aleatorio
```

### 6.3 PM2 Ecosystem Config

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "NOME-engine",
      namespace: "NOME",          // ← OBRIGATÓRIO: namespace único
      script: "engine/main.js",
      cwd: __dirname,
      node_args: "--experimental-vm-modules",
      instances: 1,
      autorestart: true,
      max_restarts: 50,
      restart_delay: 5000,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        NOME_PORT: "PORTA_UNICA",
        SCAN_INTERVAL_HOURS: "4",
      },
      error_file: "/var/log/NOME/engine-error.log",
      out_file: "/var/log/NOME/engine-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
```

### 6.4 PM2 Systemd (Auto-start no reboot)

```bash
# Gerar e activar serviço systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# IMPORTANTE: Se falhar com "PID file not found", usar Type=oneshot:
sudo bash -c 'cat > /etc/systemd/system/pm2-ubuntu.service << EOF
[Unit]
Description=PM2 process manager
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
User=ubuntu
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment=PATH=/home/ubuntu/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin
Environment=PM2_HOME=/home/ubuntu/.pm2
ExecStartPre=/bin/sleep 5
ExecStart=/usr/lib/node_modules/pm2/bin/pm2 resurrect
ExecReload=/usr/lib/node_modules/pm2/bin/pm2 reload all
ExecStop=/usr/lib/node_modules/pm2/bin/pm2 kill

[Install]
WantedBy=multi-user.target
EOF'

sudo systemctl daemon-reload
sudo systemctl enable pm2-ubuntu
sudo systemctl start pm2-ubuntu

# Salvar estado actual
pm2 save
```

---

## 7. Isolamento Multi-Projecto (Ultra Rigor)

### Regras de Isolamento

Quando múltiplos projectos coexistem no mesmo servidor, **cada um DEVE ter**:

| Requisito | Exemplo ASTRALMIA |
|---|---|
| **Directório próprio** | `/home/ubuntu/astralmia-openclaw/` |
| **Namespace PM2 único** | `namespace: "astralmia"` |
| **Porta HTTP única** | `4002` |
| **Ficheiro .env próprio** | `openclaw/.env` |
| **Logs separados** | `/var/log/astralmia/` ou `~/logs/nome-*` |
| **Ecosystem próprio** | `openclaw/ecosystem.config.cjs` (no projecto) |
| **Sem cross-refs** | Nenhuma referência a paths de outros projectos |

### Mapa de Portas (Exemplo Real)

```
Porta   Projecto          Namespace
───────────────────────────────────
3002    Subreviva Bot      subreviva
4002    ASTRALMIA Engine   astralmia
4003    [Nova Loja]        nova-loja     ← exemplo
```

### Checklist de Isolamento

```bash
# 1. Verificar namespaces
pm2 jlist | python3 -c "
import json, sys
for app in json.load(sys.stdin):
    ns = app['pm2_env'].get('namespace','DEFAULT')
    print(f'{app[\"name\"]:25s} → {ns}')
"

# 2. Verificar portas
ss -tlnp | grep LISTEN

# 3. Verificar CWDs (sem cross-namespace)
pm2 jlist | python3 -c "
import json, sys
cwds = {}
for a in json.load(sys.stdin):
    ns=a['pm2_env'].get('namespace','x')
    cwd=a['pm2_env'].get('pm_cwd','?')
    cwds.setdefault(cwd,[]).append(f'{a[\"name\"]} ({ns})')
for c,apps in cwds.items():
    nss = set(a.split('(')[1].rstrip(')') for a in apps)
    if len(nss) > 1: print(f'⚠️ CONFLITO: {c}')
"

# 4. Verificar processos soltos (fora do PM2)
pm2 jlist | python3 -c "import json,sys;[print(a['pid']) for a in json.load(sys.stdin)]" > /tmp/pm2pids
ps aux | grep "node " | grep -v grep | awk '{print $2}' | while read p; do
  grep -q "$p" /tmp/pm2pids || echo "⚠️ UNMANAGED PID $p"
done

# 5. Verificar env cross-contamination
# Procurar chaves de um projecto em directórios de outros
grep -r "CJ_API_KEY_DO_PROJ_A" ~/outro_projecto/ 2>/dev/null
```

### Ficheiros Perigosos

**NUNCA usar** um ecosystem.config.cjs na raiz (`~/ecosystem.config.cjs`) que contenha apps de múltiplos projectos. Cada projecto deve ter o seu no seu próprio directório.

Se existem ficheiros raiz legados, desactivar:
```bash
mv ~/ecosystem.config.cjs ~/ecosystem.config.cjs.DISABLED
```

### Scripts Self-Daemonizing

Alguns scripts fazem fork de si próprios (ex: `script.cjs` → `script.cjs daemon`). Quando geridos por PM2, passar o arg `daemon` directamente:

```javascript
// ecosystem.config.cjs
{
  name: 'meu-bot',
  script: 'bot.cjs',
  args: 'daemon',  // ← Evita double-fork!
  // ...
}
```

---

## 8. Deploy Passo a Passo

### 8.1 Primeiro Deploy

```bash
# No servidor:
cd ~
git clone git@github.com:USUARIO/PROJECTO.git nome-projecto
cd nome-projecto/openclaw

# Criar .env
cat > .env << 'EOF'
CJ_API_KEY=SUA_CHAVE_CJ
CJ_BASE_URL=https://developers.cjdropshipping.com/api2.0/v1
NOME_PORT=PORTA
SCAN_INTERVAL_HOURS=4
EOF

# Criar directório de logs
sudo mkdir -p /var/log/nome-projecto
sudo chown ubuntu:ubuntu /var/log/nome-projecto

# Iniciar com PM2
pm2 start ecosystem.config.cjs
pm2 save

# Verificar
curl http://localhost:PORTA/health
```

### 8.2 Updates Subsequentes

```bash
# Via git (recomendado):
cd ~/nome-projecto
git pull origin main
pm2 restart nome-engine

# Verificar saúde:
curl http://localhost:PORTA/health
```

### 8.3 Deploy Automatizado (CI/CD)

```bash
# No GitHub Actions ou localmente:
git push origin main

# SSH deploy:
ssh servidor "cd ~/nome-projecto && git pull && pm2 restart nome-engine"
```

---

## 9. API HTTP — Todos os Endpoints

O engine expõe ~55 endpoints HTTP. Exemplos principais:

### Sistema
| Método | Path | Descrição |
|---|---|---|
| `GET` | `/health` | Estado de saúde + subsistemas |
| `GET` | `/metrics` | Métricas (uptime, API calls, catálogo) |

### Catálogo
| Método | Path | Descrição |
|---|---|---|
| `GET` | `/catalog` | Catálogo completo |
| `GET` | `/catalog/featured` | Produtos em destaque |
| `GET` | `/catalog/product/:id` | Produto por ID |
| `GET` | `/catalog/categories` | Categorias |
| `POST` | `/catalog/scan` | Forçar scan imediato |

### CJ API (Proxy)
| Método | Path | Descrição |
|---|---|---|
| `GET` | `/cj/products` | Buscar produtos CJ |
| `GET` | `/cj/product/:pid` | Detalhes CJ |
| `GET` | `/cj/categories` | Categorias CJ |
| `POST` | `/cj/freight` | Calcular frete |
| `GET` | `/cj/stock/:vid` | Stock de variante |
| `GET` | `/cj/balance` | Saldo CJ |
| `GET` | `/cj/warehouses` | Listar armazéns |

### Encomendas
| Método | Path | Descrição |
|---|---|---|
| `POST` | `/orders` | Criar encomenda |
| `GET` | `/orders` | Listar encomendas |
| `GET` | `/orders/:id` | Detalhes da encomenda |
| `GET` | `/orders/stats` | Estatísticas |
| `POST` | `/orders/:id/process` | Processar manualmente |

### Inventário
| Método | Path | Descrição |
|---|---|---|
| `GET` | `/inventory` | Estado do inventário |
| `GET` | `/inventory/alerts` | Alertas de stock |
| `POST` | `/inventory/check` | Forçar verificação |

### Disputas
| Método | Path | Descrição |
|---|---|---|
| `GET` | `/disputes` | Listar disputas |
| `POST` | `/disputes` | Criar disputa |
| `GET` | `/disputes/stats` | Estatísticas |

---

## 10. Integração OpenClaw

O OpenClaw é instalado no servidor e usado como runtime/gateway:

```bash
# Instalação
curl -sSL https://openclaw.dev/install.sh | bash

# Verificar
openclaw --version

# Pode ser usado como gateway (opcional):
# pm2 start openclaw -- gateway --port 18789
```

No ecosystem.config.cjs, o OpenClaw gateway é opcional:

```javascript
{
  name: "openclaw-gateway",
  namespace: "NOME",
  script: "openclaw",
  args: "gateway --port 18789",
  cwd: "/home/ubuntu",
  max_memory_restart: "1G",
}
```

---

## 11. Replicar para Nova Loja

### Passo 1: Clonar Estrutura

```bash
# Copiar engine de referência
cp -r astralmia-openclaw/openclaw nova-loja/openclaw

# Ou clonar do git
git clone git@github.com:USUARIO/NOVA-LOJA.git nova-loja
```

### Passo 2: Configurar CJ API

```bash
# Criar conta CJ: developers.cjdropshipping.com
# Obter API key
# Configurar .env:
cat > nova-loja/openclaw/.env << 'EOF'
CJ_API_KEY=NOVA_CHAVE_CJ
CJ_BASE_URL=https://developers.cjdropshipping.com/api2.0/v1
NOVA_LOJA_PORT=4003
SCAN_INTERVAL_HOURS=4
EOF
```

### Passo 3: Personalizar Product Engine

Editar `product-engine.js`:
- **Regras de tradução**: Adaptar ao nicho da loja
- **Markup/Pricing**: Ajustar margens
- **Filtros**: Keywords, categorias, qualidade mínima
- **SEO**: Descrições, metadados

Editar `catalog-scanner.js`:
- **Search queries**: Termos específicos do nicho
- **Filtros de qualidade**: Rating mínimo, vendas
- **Categorização**: Mapear para categorias da loja

### Passo 4: Configurar PM2

```javascript
// nova-loja/openclaw/ecosystem.config.cjs
module.exports = {
  apps: [{
    name: "nova-loja-engine",
    namespace: "nova-loja",        // ← DIFERENTE dos outros
    script: "engine/main.js",
    cwd: __dirname,
    env: {
      NODE_ENV: "production",
      NOVA_LOJA_PORT: "4003",     // ← PORTA DIFERENTE
      SCAN_INTERVAL_HOURS: "4",
    },
    error_file: "/var/log/nova-loja/engine-error.log",
    out_file: "/var/log/nova-loja/engine-out.log",
    merge_logs: true,
    time: true,
  }],
};
```

### Passo 5: Deploy

```bash
# No servidor
cd ~/nova-loja/openclaw
sudo mkdir -p /var/log/nova-loja && sudo chown ubuntu:ubuntu /var/log/nova-loja
pm2 start ecosystem.config.cjs
pm2 save

# Verificar isolamento
pm2 list  # Deve mostrar namespace "nova-loja" separado
ss -tlnp  # Deve mostrar porta 4003
```

### Passo 6: Configurar Frontend

No Next.js, os API routes fazem proxy para o engine:

```typescript
// src/app/api/cj/products/route.ts
export async function GET(request: Request) {
  const engineUrl = process.env.ENGINE_URL || 'http://localhost:4003';
  const res = await fetch(`${engineUrl}/catalog`);
  return Response.json(await res.json());
}
```

---

## 12. Manutenção e Monitorização

### Comandos PM2 Essenciais

```bash
# Ver todos os processos
pm2 list

# Ver logs de um namespace
pm2 logs --namespace NOME

# Restart de um namespace
pm2 restart --namespace NOME

# Monitorizar em tempo real
pm2 monit

# Ver métricas detalhadas
pm2 describe nome-engine
```

### Verificações de Rotina

```bash
# Health check
curl http://localhost:PORTA/health

# Métricas
curl http://localhost:PORTA/metrics

# Stock do catálogo
curl http://localhost:PORTA/catalog | python3 -c "
import json,sys
data=json.load(sys.stdin)
print(f'Produtos: {len(data.get(\"products\",[]))}')
"

# Saldo CJ
curl http://localhost:PORTA/cj/balance
```

### Alertas

O sistema gera alertas nos logs para:
- Stock baixo (< 5 unidades)
- Mudanças de preço significativas (> 15%)
- Encomendas não expedidas (> 7 dias)
- Tracking parado (> 15 dias)
- Falhas de autenticação CJ
- Saldo CJ insuficiente

### Backup

```bash
# Dados do catálogo
cp ~/projecto/openclaw/engine/data/catalog.json ~/backups/

# PM2 state
pm2 save  # Salva em ~/.pm2/dump.pm2
```

---

## Estado Actual do Servidor (2026-02-26)

```
┌───────────────────────┬─────────────┬──────┬──────────┐
│ App                   │ Namespace   │ Port │ Status   │
├───────────────────────┼─────────────┼──────┼──────────┤
│ astralmia-engine      │ astralmia   │ 4002 │ online   │
│ penclaw-autonomous    │ penclaw     │ -    │ online   │
│ penclaw-dealer        │ penclaw     │ -    │ online   │
│ portab-automation     │ portab      │ -    │ online   │
│ subreviva-bot         │ subreviva   │ 3002 │ online   │
│ subreviva-scanner     │ subreviva   │ -    │ online   │
│ pm2-logrotate         │ default     │ -    │ online   │
└───────────────────────┴─────────────┴──────┴──────────┘

PM2 Systemd: enabled + active (Type=oneshot, RemainAfterExit)
Memória: ~41% de 2GB
Processos soltos: 0
Ecosystem files perigosos: DISABLED
```

### O que foi feito nesta sessão:

1. **PM2 systemd service reparado** — Mudado de `Type=forking` para `Type=oneshot` com `RemainAfterExit=yes` para resolver erro de PID file
2. **Penclaw sob PM2** — Processos bare (não geridos) trazidos para PM2 com namespace `penclaw` e arg `daemon` para evitar double-fork
3. **Namespaces verificados** — Todos os 5 projectos com namespace isolado
4. **Portas verificadas** — Sem conflitos (3002, 4002)
5. **Ecosystem configs limpos** — Ficheiros raiz perigosos renomeados para `.DISABLED`, cada projecto tem o seu
6. **Env cross-contamination** — Verificada, CJ API key só no .env do astralmia e ecosystem do subreviva (mesmo dono)
7. **PM2 save** — Estado salvo para sobreviver a reboots

---

*Este documento serve como blueprint para implementar qualquer nova loja com a mesma arquitectura.*
*Copiar engine → Configurar .env → Personalizar nicho → Deploy com PM2 → Verificar isolamento.*
