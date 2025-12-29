#!/bin/bash

# TapMove Development Startup Script
# Starts backend and merchant terminal in parallel

set -e

echo "🚀 Starting TapMove Development Environment"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for required files
check_env() {
    local file=$1
    local name=$2
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠️  $name not found. Copy from example:${NC}"
        echo "   cp $file.example $file"
        return 1
    fi
    return 0
}

# Check environment files
echo "📋 Checking environment files..."
env_ok=true

check_env "backend/.env" "backend/.env" || env_ok=false
check_env "merchant/.env.local" "merchant/.env.local" || {
    # Try .env if .env.local doesn't exist
    if [ -f "merchant/.env" ]; then
        echo -e "${GREEN}✓ Using merchant/.env${NC}"
    else
        env_ok=false
    fi
}

if [ "$env_ok" = false ]; then
    echo ""
    echo -e "${RED}❌ Please create missing .env files before starting${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment files found${NC}"
echo ""

# Start backend
echo "📦 Starting backend server..."
cd "$PROJECT_ROOT/backend"
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start merchant terminal
echo "🏪 Starting merchant terminal..."
cd "$PROJECT_ROOT/merchant"
npm run dev &
MERCHANT_PID=$!

# Wait for services to be ready
sleep 3

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ TapMove Development Environment Started${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Backend:    http://localhost:3001"
echo "   Merchant:   http://localhost:3000"
echo "   Health:     http://localhost:3001/health"
echo ""
echo "📱 To start mobile app, run in a new terminal:"
echo "   cd mobile && npx expo start"
echo ""
echo "Press Ctrl+C to stop all services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Cleanup function
cleanup() {
    echo ""
    echo "Shutting down services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $MERCHANT_PID 2>/dev/null || true
    echo "Done."
}

# Register cleanup on exit
trap cleanup EXIT INT TERM

# Wait for either process to exit
wait $BACKEND_PID $MERCHANT_PID
