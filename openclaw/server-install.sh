#!/usr/bin/env bash
# ASTRALMIA — Server-Side Auto-Install v3.0
# Run on ubuntu@35.180.129.195:
#   cd ~/ASRALMIA/openclaw && bash server-install.sh
set -euo pipefail

GREEN='\033[0;32m'; RED='\033[0;31m'; PURPLE='\033[0;35m'; YELLOW='\033[0;33m'; NC='\033[0m'
log() { echo -e "${PURPLE}[ASTRALMIA]${NC} $1"; }
ok() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
err() { echo -e "${RED}[ERRO]${NC} $1"; exit 1; }

echo ""
echo -e "${PURPLE}  ASTRALMIA — Server Installation v3.0${NC}"
echo -e "${PURPLE}  Motor autonomo de vendas 24/7${NC}"
echo ""

# Node.js 22+
log "Checking Node.js..."
if ! command -v node &>/dev/null || [[ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 22 ]]; then
  log "Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
ok "Node.js $(node -v)"

# PM2
log "Checking PM2..."
if ! command -v pm2 &>/dev/null; then
  sudo npm install -g pm2
fi
ok "PM2 $(pm2 -v)"

# Git clone/pull
log "Setting up codebase..."
REPO_DIR="$HOME/ASRALMIA"
if [[ -d "$REPO_DIR/.git" ]]; then
  cd "$REPO_DIR" && git pull origin main
  ok "Repository updated"
else
  git clone https://github.com/subreviva2024/ASRALMIA.git "$REPO_DIR"
  ok "Repository cloned"
fi

OPENCLAW_DIR="$REPO_DIR/openclaw"
ENGINE_DIR="$HOME/astralmia-openclaw"

# Directories
mkdir -p "$ENGINE_DIR/engine" "$ENGINE_DIR/data"
sudo mkdir -p /var/log/astralmia 2>/dev/null || true
sudo chown -R "$USER" /var/log/astralmia 2>/dev/null || true
ok "Directories ready"

# Copy engine files
log "Installing engine..."
cp -r "$OPENCLAW_DIR/engine/"* "$ENGINE_DIR/engine/"
cp "$OPENCLAW_DIR/package.json" "$ENGINE_DIR/package.json"
cp "$OPENCLAW_DIR/ecosystem.config.cjs" "$ENGINE_DIR/ecosystem.config.cjs"

if [[ -f "$ENGINE_DIR/.env" ]]; then
  ok ".env exists (keeping current)"
else
  cp "$OPENCLAW_DIR/.env.example" "$ENGINE_DIR/.env"
  warn ".env created from template"
  warn "EDIT with CJ credentials: nano $ENGINE_DIR/.env"
fi
ok "Engine installed"

# OpenClaw setup (optional)
if command -v openclaw &>/dev/null; then
  mkdir -p "$HOME/.openclaw/workspace" "$HOME/.openclaw/extensions/cj-dropshipping"
  cp "$OPENCLAW_DIR/openclaw.json" "$HOME/.openclaw/openclaw.json"
  cp -r "$OPENCLAW_DIR/workspace/"* "$HOME/.openclaw/workspace/"
  cp -r "$OPENCLAW_DIR/extensions/cj-dropshipping/"* "$HOME/.openclaw/extensions/cj-dropshipping/"
  ok "OpenClaw configured"
fi

# Check credentials
if grep -q "YOUR_CJ_API_KEY_HERE" "$ENGINE_DIR/.env" 2>/dev/null; then
  warn "CJ_API_KEY nao configurado!"
  warn "Edita: nano $ENGINE_DIR/.env"
  warn "Depois: cd $ENGINE_DIR && pm2 start ecosystem.config.cjs && pm2 save"
  exit 0
fi

# Start services
log "Starting services..."
cd "$ENGINE_DIR"
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup 2>/dev/null || true
ok "Services started"

sleep 3
pm2 list

IP=$(hostname -I | awk '{print $1}')
echo ""
ok "ASTRALMIA instalado!"
echo "  Engine API:  http://$IP:4002/health"
echo "  Catalogo:    http://$IP:4002/catalog"
echo "  Logs:        pm2 logs astralmia-engine"
echo "  Monitor:     pm2 monit"
echo ""
