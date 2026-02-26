# ✨ ASTRALMIA — OpenClaw Gateway Bot

## Caela — Guia Espiritual & Assistente de Vendas

Bot de IA com integração completa CJ Dropshipping, a correr 24/7 no OpenClaw Gateway.

---

## Arquitectura

```
┌─────────────────────────────────────┐
│     OpenClaw Gateway (:18789)       │
│                                     │
│  ┌──────────┐   ┌───────────────┐  │
│  │  Caela    │   │ CJ Plugin     │  │
│  │  Agent    │◄──│ (14 tools)    │  │
│  │  (AI)     │   │               │  │
│  └─────┬────┘   └───────┬───────┘  │
│        │                │          │
│  ┌─────┴────┐   ┌───────┴───────┐  │
│  │ Web UI   │   │ CJ API v2.0   │  │
│  │ Chat     │   │ Dropshipping  │  │
│  └──────────┘   └───────────────┘  │
│                                     │
│  ┌──────────┐   ┌───────────────┐  │
│  │ Webhooks │   │ Workspace     │  │
│  │ /hooks/* │   │ SOUL/AGENTS   │  │
│  └──────────┘   └───────────────┘  │
└─────────────────────────────────────┘
         ↕                  ↕
    Browser UI         CJ Dropshipping
   (qualquer           API v2.0
    dispositivo)        (produtos, envio,
                        encomendas, tracking)
```

## Ferramentas CJ Disponíveis (14 tools)

| # | Ferramenta | Descrição |
|---|-----------|-----------|
| 1 | `cj_search_products` | Pesquisa de produtos por keyword |
| 2 | `cj_product_detail` | Detalhes de produto por PID |
| 3 | `cj_product_variants` | Lista de variantes (cores, tamanhos) |
| 4 | `cj_check_inventory` | Verificação de stock em tempo real |
| 5 | `cj_calculate_shipping` | Cálculo de portes para Portugal |
| 6 | `cj_calculate_pricing` | Cálculo de preço de venda + margem |
| 7 | `cj_translate_product` | Tradução EN→PT-PT com categorias |
| 8 | `cj_create_order` | Criar encomenda no CJ |
| 9 | `cj_order_detail` | Detalhes de encomenda |
| 10 | `cj_track_shipment` | Rastreamento de envio |
| 11 | `cj_list_categories` | Lista de categorias CJ |
| 12 | `cj_list_warehouses` | Armazéns globais CJ |
| 13 | `cj_analyze_product` | Análise completa (all-in-one) |
| 14 | `cj_bulk_search` | Pesquisa + análise em bulk |

## Estrutura de Ficheiros

```
openclaw/
├── openclaw.json                    # Configuração do gateway
├── deploy.sh                        # Script de deploy para o servidor
├── README.md                        # Esta documentação
├── workspace/                       # Persona e instruções do agente
│   ├── SOUL.md                      # Personalidade da Caela
│   ├── AGENTS.md                    # Instruções de operação
│   ├── USER.md                      # Perfil do utilizador/negócio
│   ├── IDENTITY.md                  # Identidade visual
│   └── TOOLS.md                     # Notas de uso das ferramentas
├── extensions/
│   └── cj-dropshipping/
│       ├── index.ts                 # Plugin OpenClaw (14 tools)
│       └── openclaw.plugin.json     # Manifesto do plugin
└── scripts/                         # Scripts auxiliares
```

## Instalação Rápida

### 1. No servidor (35.180.129.195)

```bash
# Executar o deploy automatizado
cd /workspaces/ASRALMIA
./openclaw/deploy.sh deploy
```

### 2. Configurar chaves API

```bash
ssh -i ~/.ssh/astralmia_key ubuntu@35.180.129.195
nano ~/.openclaw/.env
```

Preencher:
```env
OPENCLAW_AUTH_TOKEN=<gerar com: openssl rand -hex 32>
CJ_API_KEY=<a tua chave CJ>
ANTHROPIC_API_KEY=<a tua chave Anthropic>
```

### 3. Aceder ao Web UI

Abrir no browser: `http://35.180.129.195:18789/`

## Comandos Úteis

```bash
# Ver logs em tempo real
./openclaw/deploy.sh logs

# Estado do serviço
./openclaw/deploy.sh status

# Reiniciar
./openclaw/deploy.sh restart

# Parar
./openclaw/deploy.sh stop

# Re-upload ficheiros (sem reinstalar)
./openclaw/deploy.sh upload
```

## Webhooks CJ

O gateway aceita callbacks do CJ Dropshipping:

| Endpoint | Evento |
|----------|--------|
| `/hooks/cj-order` | Actualizações de encomendas |
| `/hooks/cj-product` | Actualizações de produtos |
| `/hooks/cj-logistics` | Actualizações de envio/tracking |

Configurar no painel CJ: `http://35.180.129.195:18789/hooks/cj-order`

## Exemplos de Uso no Chat

### Pesquisar Produtos
> "Pesquisa cristais de ametista no CJ"
> "Encontra os melhores pendentes de cristal para a loja"

### Analisar Produto
> "Analisa o produto PID XXX — vale a pena vender?"
> "Faz uma análise completa do tarot deck mais barato"

### Calcular Preços
> "Qual o preço de venda para um produto CJ de $5.50?"
> "Compara margens de 3 cristais diferentes"

### Gerir Encomendas
> "Cria uma encomenda para Lisboa, nome Maria Silva"
> "Rastreia o envio número TRACK123456"

### Catálogo
> "Pesquisa bulk: incense, candle, crystal tree — analisa os 5 melhores de cada"
> "Lista todas as categorias CJ"

## Requisitos

- **Node.js** 22+
- **OpenClaw** (npm install -g openclaw@latest)
- **CJ API Key** (developers.cjdropshipping.com)
- **Anthropic API Key** (claude-sonnet-4-5)
- **Servidor** Ubuntu 22+ com porta 18789 aberta
