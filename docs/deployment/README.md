# TapMove Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Movement CLI (`aptos`) for contract deployment
- Privy account with app configured
- Android device for mobile testing (NFC support)

## Quick Start (Local Development)

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/your-repo/tapmove.git
cd tapmove

# Install all dependencies
npm run install:all
# OR manually:
cd backend && npm install
cd ../merchant && npm install
cd ../mobile && npm install
```

### 2. Configure Environment

```bash
# Copy example files
cp .env.example .env
cp backend/.env.example backend/.env
cp merchant/.env.example merchant/.env.local
cp mobile/.env.example mobile/.env

# Edit each file and fill in your values:
# - Privy credentials from https://console.privy.io
# - Contract addresses (after deployment)
```

### 3. Deploy Contracts (First Time Only)

```bash
cd contracts

# Initialize Aptos profile for Movement testnet
aptos init --network custom --rest-url https://aptos.testnet.porto.movementlabs.xyz/v1

# Fund your account
aptos account fund-with-faucet --account default

# Compile and publish
aptos move compile
aptos move publish --profile default
```

Update contract addresses in all `.env` files.

### 4. Start Development Servers

```bash
# Option A: Use startup script
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh

# Option B: Start manually in separate terminals

# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Merchant Terminal
cd merchant && npm run dev

# Terminal 3: Mobile App
cd mobile && npx expo start
```

### 5. Verify Everything Works

```bash
# Check backend health
curl http://localhost:3001/health

# Open merchant terminal
open http://localhost:3000

# Scan QR from Expo Go on mobile
```

## Environment Files

| File | Purpose |
|------|---------|
| `.env` (root) | Shared configuration |
| `backend/.env` | Backend server config |
| `merchant/.env.local` | Next.js merchant app |
| `mobile/.env` | Expo mobile app |

## Key Configuration Values

### Privy Setup

1. Go to https://console.privy.io
2. Create a new app
3. Configure login methods (email, Google, Apple)
4. Enable embedded wallets
5. Add your app URLs to allowed origins
6. Copy App ID and Client ID to env files

### Movement Network

| Network | RPC URL |
|---------|---------|
| Testnet | `https://aptos.testnet.porto.movementlabs.xyz/v1` |
| Mainnet | TBD |

## Production Deployment

### Backend (Railway/Render)

```bash
# Set environment variables in hosting dashboard:
NODE_ENV=production
PORT=3001
MOVEMENT_RPC_URL=...
PAYMENT_MODULE=...
DATABASE_PATH=/data/tapmove.db
CORS_ORIGINS=https://your-merchant-domain.com
```

### Merchant Terminal (Vercel)

```bash
# Set in Vercel dashboard:
NEXT_PUBLIC_PRIVY_APP_ID=...
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_MOVEMENT_RPC=...
```

### Mobile App (EAS Build)

```bash
# Build for production
cd mobile
eas build --platform android --profile production

# Submit to stores
eas submit --platform android
```

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify `.env` file exists and has required values
- Check database directory permissions

### Mobile can't connect to backend
- Use your local IP instead of `localhost` for physical devices
- Example: `EXPO_PUBLIC_API_URL=http://192.168.1.100:3001`
- Ensure phone and computer are on same network

### Contracts won't deploy
- Ensure sufficient MOVE for gas
- Check account is initialized: `aptos account lookup-address`
- Verify RPC URL is correct

### NFC not working
- Only works on physical Android devices
- Ensure NFC is enabled in device settings
- Check app has NFC permissions

## Security Checklist

- [ ] Never commit `.env` files
- [ ] Use strong webhook secrets
- [ ] Enable rate limiting in production
- [ ] Set correct CORS origins
- [ ] Use HTTPS in production
- [ ] Rotate API keys periodically
