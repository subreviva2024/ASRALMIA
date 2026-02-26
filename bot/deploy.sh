#!/bin/bash
#
# ASTRALMIA — Deploy Script
# Deploys the sales bot to the production server
#
# Usage: ./deploy.sh
#

set -e

# ── Configuration ──────────────────────────────────────────────────────────

SERVER="ubuntu@35.180.129.195"
KEY_PATH="$HOME/LightsailDefaultKey-eu-west-3.pem"
REMOTE_DIR="/home/ubuntu/astralmia-bot"
SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i $KEY_PATH"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║    ASTRALMIA — Deploy Sales Bot           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Check key file ───────────────────────────────────────────────────────

if [ ! -f "$KEY_PATH" ]; then
  echo "❌ SSH key not found: $KEY_PATH"
  echo "   Place the .pem file at: $KEY_PATH"
  exit 1
fi

chmod 600 "$KEY_PATH"

echo "1/5 — Connecting to server..."
ssh $SSH_OPTS $SERVER "echo '✅ Connected'"

echo "2/5 — Creating project directory..."
ssh $SSH_OPTS $SERVER "mkdir -p $REMOTE_DIR/logs $REMOTE_DIR/data"

echo "3/5 — Uploading bot files..."
scp $SSH_OPTS \
  astralmia-bot.js \
  cj-client.js \
  product-manager.js \
  order-manager.js \
  horoscope.js \
  tarot-engine.js \
  messages.js \
  keyboards.js \
  analytics.js \
  cache.js \
  ecosystem.config.js \
  server.js \
  suppliers.js \
  pricing.js \
  package.json \
  $SERVER:$REMOTE_DIR/

echo "4/5 — Installing dependencies & setting up PM2..."
ssh $SSH_OPTS $SERVER << 'REMOTE_SCRIPT'
  cd /home/ubuntu/astralmia-bot

  # Install Node.js if not present
  if ! command -v node &> /dev/null; then
    echo "Installing Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi

  echo "Node.js version: $(node -v)"
  echo "npm version: $(npm -v)"

  # Install dependencies
  npm install --production 2>&1 | tail -3

  # Install PM2 globally if not present
  if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | bash || true
  fi

  # Check for .env file
  if [ ! -f .env ]; then
    echo ""
    echo "⚠️  .env file not found! Create it with:"
    echo ""
    echo "cat > /home/ubuntu/astralmia-bot/.env << 'ENV'"
    echo "# Telegram Bot Token (get from @BotFather)"
    echo "TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here"
    echo ""
    echo "# CJ Dropshipping API Key"
    echo "CJ_API_KEY=your_cj_api_key_here"
    echo "# OR use email/password:"
    echo "# CJ_EMAIL=your_email"
    echo "# CJ_PASSWORD=your_password"
    echo ""
    echo "# Admin Telegram User IDs (comma-separated)"
    echo "ADMIN_IDS=your_telegram_user_id"
    echo ""
    echo "# Site URL"
    echo "SITE_URL=https://astralmia.com"
    echo "ENV"
    echo ""
  fi

  echo "✅ Dependencies installed"
REMOTE_SCRIPT

echo "5/5 — Starting bot with PM2..."
ssh $SSH_OPTS $SERVER << 'REMOTE_SCRIPT'
  cd /home/ubuntu/astralmia-bot
  
  # Stop existing processes gracefully
  pm2 delete astralmia-bot 2>/dev/null || true
  pm2 delete caela-engine 2>/dev/null || true
  
  # Start with ecosystem config
  pm2 start ecosystem.config.js
  pm2 save
  
  echo ""
  pm2 list
  echo ""
  echo "✅ ASTRALMIA Bot deployed and running!"
  echo ""
REMOTE_SCRIPT

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║    ✅ Deployment Complete!                ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. SSH into the server: ssh $SSH_OPTS $SERVER"
echo "  2. Create .env file: nano $REMOTE_DIR/.env"
echo "  3. Restart bot: pm2 restart astralmia-bot"
echo "  4. View logs: pm2 logs astralmia-bot"
echo ""
