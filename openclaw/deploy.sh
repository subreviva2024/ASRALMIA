#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
# ASTRALMIA — Full Deploy to Server
# Target: ubuntu@35.180.129.195
# ═══════════════════════════════════════════════════════════
set -euo pipefail

SERVER_IP="${ASTRALMIA_SERVER_IP:-35.180.129.195}"
SERVER_USER="${ASTRALMIA_SERVER_USER:-ubuntu}"
SSH_KEY="${ASTRALMIA_SSH_KEY:-$HOME/.ssh/astralmia_key}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'
log() { echo -e "${PURPLE}[ASTRALMIA]${NC} $1"; }
ok() { echo -e "${GREEN}[✅]${NC} $1"; }
err() { echo -e "${RED}[❌]${NC} $1"; exit 1; }

remote() {
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=15 \
    "${SERVER_USER}@${SERVER_IP}" "$@"
}

remote_copy() {
  scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r "$1" "${SERVER_USER}@${SERVER_IP}:$2"
}

# ── Pre-checks ──
[[ -f "$SSH_KEY" ]] || err "SSH key not found: $SSH_KEY"
ok "SSH key found"

# ── Step 1: Ensure Node.js 22+ ──
log "Checking Node.js..."
NODE_VER=$(remote "node --version 2>/dev/null || echo none")
if [[ "$NODE_VER" == "none" ]] || [[ "${NODE_VER:1:2}" -lt 22 ]]; then
  log "Installing Node.js 22..."
  remote "curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs"
fi
ok "Node.js $(remote 'node --version')"

# ── Step 2: Install OpenClaw (if not present) ──
log "Checking OpenClaw..."
HAS_OC=$(remote "command -v openclaw && echo yes || echo no")
if [[ "$HAS_OC" == "no" ]]; then
  log "Installing OpenClaw..."
  remote "sudo npm install -g openclaw@latest"
fi
ok "OpenClaw installed"

# ── Step 3: Install PM2 ──
HAS_PM2=$(remote "command -v pm2 && echo yes || echo no")
if [[ "$HAS_PM2" == "no" ]]; then
  log "Installing PM2..."
  remote "sudo npm install -g pm2"
fi
ok "PM2 installed"

# ── Step 4: Create directories ──
log "Creating directories..."
remote "mkdir -p ~/.openclaw/workspace ~/.openclaw/extensions/cj-dropshipping ~/astralmia-openclaw/engine ~/astralmia-openclaw/data /var/log/astralmia 2>/dev/null; sudo chown -R $SERVER_USER /var/log/astralmia 2>/dev/null || true"
ok "Directories ready"

# ── Step 5: Upload files ──
log "Uploading OpenClaw config..."
remote_copy "$SCRIPT_DIR/openclaw.json" "~/.openclaw/openclaw.json"

log "Uploading workspace files..."
remote_copy "$SCRIPT_DIR/workspace/" "~/.openclaw/workspace/"

log "Uploading CJ plugin..."
remote_copy "$SCRIPT_DIR/extensions/cj-dropshipping/" "~/.openclaw/extensions/cj-dropshipping/"

log "Uploading engine..."
remote_copy "$SCRIPT_DIR/engine/" "~/astralmia-openclaw/engine/"

log "Uploading package.json..."
remote_copy "$SCRIPT_DIR/package.json" "~/astralmia-openclaw/package.json"

log "Uploading ecosystem config..."
remote_copy "$SCRIPT_DIR/ecosystem.config.cjs" "~/astralmia-openclaw/ecosystem.config.cjs"

log "Uploading .env..."
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  remote_copy "$SCRIPT_DIR/.env" "~/astralmia-openclaw/.env"
else
  remote_copy "$SCRIPT_DIR/.env.example" "~/astralmia-openclaw/.env"
  echo "   ⚠️  Using .env.example — edit ~/astralmia-openclaw/.env with real CJ credentials"
fi
ok "All files uploaded"

# ── Step 6: Start services ──
log "Starting services with PM2..."
remote "cd ~/astralmia-openclaw && pm2 delete all 2>/dev/null || true && pm2 start ecosystem.config.cjs && pm2 save && pm2 startup 2>/dev/null || true"
ok "Services started"

# ── Step 7: Verify ──
log "Verifying..."
sleep 3
remote "pm2 list"
echo ""
ok "Deploy complete! Services running on $SERVER_IP"
echo ""
echo "  🌐 OpenClaw UI:  http://$SERVER_IP:18789"
echo "  📊 Engine API:   http://$SERVER_IP:4002/health"
echo "  📦 Catalog:      http://$SERVER_IP:4002/catalog"
echo ""
