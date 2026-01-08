#!/bin/bash

# Change to script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting TapMove Development Environment"
echo "   Working from: $SCRIPT_DIR"
echo ""

# Check env files exist
if [ ! -f "backend/.env" ]; then
  echo "❌ backend/.env missing. Copy from .env.example"
  exit 1
fi

if [ ! -f "merchant/.env.local" ]; then
  echo "❌ merchant/.env.local missing. Copy from .env.example"
  exit 1
fi

# Create data directory for SQLite
mkdir -p backend/data

# Start backend in subshell
echo "📦 Starting backend on :3001..."
(cd "$SCRIPT_DIR/backend" && npm run dev) &
BACKEND_PID=$!

# Wait for backend
sleep 3

# Start merchant in subshell
echo "🏪 Starting merchant terminal on :3000..."
(cd "$SCRIPT_DIR/merchant" && npm run dev) &
MERCHANT_PID=$!

echo ""
echo "✅ Services starting..."
echo "   Backend:  http://localhost:3001"
echo "   Merchant: http://localhost:3000"
echo ""
echo "📱 For mobile: cd mobile && npx expo start"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $BACKEND_PID $MERCHANT_PID 2>/dev/null; exit" INT TERM
wait
