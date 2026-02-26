#!/usr/bin/env npx tsx
/**
 * Setup Stripe Webhook Endpoint
 * Run: npx tsx scripts/setup-stripe-webhook.ts
 * 
 * This registers a webhook endpoint in Stripe Dashboard and outputs the webhook secret.
 * Add the secret to .env.local as STRIPE_WEBHOOK_SECRET.
 */

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_URL = process.env.WEBHOOK_URL || "http://35.180.129.195:3000/api/webhook/stripe";

if (!STRIPE_SECRET_KEY) {
  console.error("❌ Set STRIPE_SECRET_KEY environment variable");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
});

async function main() {
  console.log("🔧 Setting up Stripe webhook...");
  console.log(`   URL: ${WEBHOOK_URL}`);

  // List existing webhook endpoints
  const existing = await stripe.webhookEndpoints.list({ limit: 20 });
  const alreadyExists = existing.data.find(w => w.url === WEBHOOK_URL);

  if (alreadyExists) {
    console.log(`\n⚠️  Webhook already exists: ${alreadyExists.id}`);
    console.log(`   Status: ${alreadyExists.status}`);
    console.log(`   Events: ${alreadyExists.enabled_events.join(", ")}`);
    console.log("\n   To delete and re-create, run:");
    console.log(`   stripe webhook_endpoints delete ${alreadyExists.id}`);
    return;
  }

  // Create webhook endpoint
  const webhook = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: [
      "checkout.session.completed",
      "payment_intent.succeeded",
      "payment_intent.payment_failed",
      "charge.refunded",
    ],
    description: "ASTRALMIA — Payment notifications",
  });

  console.log("\n✅ Webhook created!");
  console.log(`   ID: ${webhook.id}`);
  console.log(`   Status: ${webhook.status}`);
  console.log(`   Secret: ${webhook.secret}`);
  console.log("\n📋 Add this to your .env.local on the server:");
  console.log(`   STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
  console.log("\n   ssh -i ~/.ssh/lightsail_key ubuntu@35.180.129.195");
  console.log(`   echo 'STRIPE_WEBHOOK_SECRET=${webhook.secret}' >> ~/ASRALMIA/.env.local`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
