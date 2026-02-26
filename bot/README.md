# 🌟 ASTRALMIA Bot — Caela

AI-powered sales bot and supplier search engine for the ASTRALMIA esoteric shop.

## Quick Start

```bash
cd bot
cp .env.example .env
# Edit .env with your Telegram bot token
node server.js
```

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and command list |
| `/produtos` | Full product catalogue with prices |
| `/fornecedores cristais` | Find cheapest crystal suppliers |
| `/fornecedores tarot` | Find cheapest tarot card suppliers |
| `/fornecedores incenso` | Find cheapest incense suppliers |
| `/fornecedores velas` | Find cheapest candle suppliers |
| `/horoscopo aries` | Daily horoscope for any sign |
| `/tarot` | 3-card tarot reading |
| `/margem 5 38` | Calculate profit margin |

## Supplier Platforms Searched

| Platform | Type | MOQ | Best For |
|----------|------|-----|----------|
| Alibaba | Wholesale | 50-500 | Best unit price |
| AliExpress | Retail/Test | 1 | Testing products |
| DHgate | Mid-Wholesale | 5-50 | Medium orders |
| Ankorstore | EU Wholesale | 6 | European suppliers |
| Faire | Curated Wholesale | 3+ | Premium brands |
| Mystic Moments | Esoteric Specialist | 50+ | UK/EU specialist |

## Where to Sell

| Platform | Fee | Best For |
|----------|-----|---------|
| **Own Website (ASTRALMIA)** | 0% | Full control, brand |
| **Etsy** | 6.5% + €0.20/listing | Handmade/mystical |
| **Amazon Handmade** | 15% | Large audience |
| **Instagram Shop** | Free/Payment fees | Visual products |
| **Shopify** | $29/mo + fees | Scalable store |
| **Mercado Livre** | 10-16% | PT/BR market |
| **OLX** | Free/Premium | Local PT sales |

## Telegram Setup

1. Message @BotFather on Telegram
2. Create a new bot: `/newbot`
3. Copy the token to `.env` as `TELEGRAM_BOT_TOKEN`
4. Set webhook:
   ```bash
   curl "https://api.telegram.org/botYOUR_TOKEN/setWebhook?url=YOUR_URL/webhook"
   ```

## API Endpoints

- `GET /health` — Bot health check
- `GET /suppliers` — Full supplier database (JSON)
- `POST /webhook` — Telegram webhook receiver  
- `POST /query` — Test commands: `{"command": "/produtos"}`