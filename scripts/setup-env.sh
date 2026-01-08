#!/bin/bash

# TapMove Environment Setup Script
# This script creates all .env files and installs dependencies

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 TapMove Environment Setup"
echo "   Project: $PROJECT_ROOT"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get local IP
get_local_ip() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost"
  else
    hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost"
  fi
}

LOCAL_IP=$(get_local_ip)

echo "📍 Detected local IP: $LOCAL_IP"
echo ""

# Check for required inputs
if [ -z "$PRIVY_APP_ID" ]; then
  echo -e "${YELLOW}⚠️  PRIVY_APP_ID not set${NC}"
  echo "   Get it from: https://dashboard.privy.io"
  echo ""
  read -p "   Enter Privy App ID: " PRIVY_APP_ID
fi

if [ -z "$PRIVY_CLIENT_ID" ]; then
  echo -e "${YELLOW}⚠️  PRIVY_CLIENT_ID not set${NC}"
  echo "   Get it from: https://dashboard.privy.io → App Settings"
  echo ""
  read -p "   Enter Privy Client ID: " PRIVY_CLIENT_ID
fi

if [ -z "$PRIVY_APP_ID" ] || [ -z "$PRIVY_CLIENT_ID" ]; then
  echo -e "${RED}❌ Privy credentials required. Exiting.${NC}"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Create backend/.env
echo "📦 Creating backend/.env..."
cat > "$PROJECT_ROOT/backend/.env" << EOF
# TapMove Backend Configuration
PORT=3001
NODE_ENV=development

# Movement Network
MOVEMENT_RPC_URL=https://testnet.movementnetwork.xyz/v1

# Database
DATABASE_PATH=./data/tapmove.db

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8081,http://$LOCAL_IP:3000
EOF
echo -e "${GREEN}   ✓ backend/.env created${NC}"

# 2. Create merchant/.env.local
echo "🏪 Creating merchant/.env.local..."
cat > "$PROJECT_ROOT/merchant/.env.local" << EOF
# TapMove Merchant Terminal Configuration

# Privy
NEXT_PUBLIC_PRIVY_APP_ID=$PRIVY_APP_ID

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Movement Network
NEXT_PUBLIC_MOVEMENT_RPC=https://testnet.movementnetwork.xyz/v1
EOF
echo -e "${GREEN}   ✓ merchant/.env.local created${NC}"

# 3. Create mobile/.env
echo "📱 Creating mobile/.env..."
cat > "$PROJECT_ROOT/mobile/.env" << EOF
# TapMove Mobile App Configuration

# Privy
EXPO_PUBLIC_PRIVY_APP_ID=$PRIVY_APP_ID

# Backend API (use local IP for physical device testing)
EXPO_PUBLIC_API_URL=http://$LOCAL_IP:3001

# Movement Network
EXPO_PUBLIC_MOVEMENT_RPC=https://testnet.movementnetwork.xyz/v1
EOF
echo -e "${GREEN}   ✓ mobile/.env created${NC}"

# 4. Update mobile/app.json with Privy credentials
echo "📱 Updating mobile/app.json with Privy credentials..."
if command -v node &> /dev/null; then
  node -e "
    const fs = require('fs');
    const appJson = JSON.parse(fs.readFileSync('$PROJECT_ROOT/mobile/app.json', 'utf8'));
    appJson.expo.extra.privyAppId = '$PRIVY_APP_ID';
    appJson.expo.extra.privyClientId = '$PRIVY_CLIENT_ID';
    fs.writeFileSync('$PROJECT_ROOT/mobile/app.json', JSON.stringify(appJson, null, 2));
  "
  echo -e "${GREEN}   ✓ mobile/app.json updated${NC}"
else
  echo -e "${YELLOW}   ⚠ Node not found, please manually update mobile/app.json${NC}"
fi

# 5. Create data directory for SQLite
echo "📁 Creating backend/data directory..."
mkdir -p "$PROJECT_ROOT/backend/data"
echo -e "${GREEN}   ✓ backend/data created${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 6. Install dependencies
echo "📦 Installing dependencies..."
echo ""

echo "   Installing backend dependencies..."
cd "$PROJECT_ROOT/backend" && npm install --silent
echo -e "${GREEN}   ✓ Backend dependencies installed${NC}"

echo "   Installing merchant dependencies..."
cd "$PROJECT_ROOT/merchant" && npm install --silent
echo -e "${GREEN}   ✓ Merchant dependencies installed${NC}"

echo "   Installing mobile dependencies..."
cd "$PROJECT_ROOT/mobile" && npm install --silent
echo -e "${GREEN}   ✓ Mobile dependencies installed${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📋 Configuration Summary:"
echo "   Privy App ID:    $PRIVY_APP_ID"
echo "   Privy Client ID: $PRIVY_CLIENT_ID"
echo "   Local IP:        $LOCAL_IP"
echo "   Backend URL:     http://localhost:3001"
echo "   Merchant URL:    http://localhost:3000"
echo ""
echo "🚀 To start the app, run:"
echo "   ./start-dev.sh"
echo ""
echo "📱 For mobile testing:"
echo "   cd mobile && npx expo start"
echo ""
