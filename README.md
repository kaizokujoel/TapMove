# TapMove

> NFC Tap-to-Pay with Privy Wallets on Movement Network

**Apple Pay for crypto.** One tap. Sub-second settlement. No seed phrases.

![TapMove Banner](./docs/banner.png)

---

## What is TapMove?

TapMove is a mobile-first payment app that enables tap-to-pay cryptocurrency transactions using NFC and Privy embedded wallets. Customers tap their phone to pay merchants in USDC on Movement, with sub-second settlement and zero seed phrase management.

### The Problem

Crypto payments fail at point-of-sale:
- **Too many steps**: Open wallet → Scan QR → Enter amount → Confirm → Wait
- **Seed phrase anxiety**: Users fear losing funds
- **Slow confirmation**: 10-60 seconds feels like forever at checkout

### Our Solution

```
Customer taps phone → Biometric confirm → Paid in <1 second
```

---

## Features

### Customer App
- **Tap to Pay**: NFC-powered payments, just like Apple Pay
- **No Seed Phrases**: Privy embedded wallets with social recovery
- **Instant Settlement**: Movement's Fast Finality Settlement (~200ms)
- **Transaction History**: Complete payment history with receipts
- **QR Fallback**: Scan to pay when NFC isn't available

### Merchant Terminal
- **Create Payments**: Enter amount, generate QR + NFC broadcast
- **Real-time Status**: Live payment confirmation
- **Transaction Dashboard**: Analytics and reporting
- **PWA Support**: Install on any device

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Mobile | React Native + Expo | Customer app |
| Web | Next.js 14 | Merchant terminal |
| Auth | Privy | Embedded wallets, social login |
| Blockchain | Movement | Sub-second finality |
| Smart Contracts | Move | Payment routing |
| Backend | Node.js | API, payment orchestration |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Movement CLI (`npm install -g aptos`)

### Environment Variables

Create `.env` files in each directory:

**Backend** (`backend/.env`):
```env
PORT=3001
MOVEMENT_RPC_URL=https://testnet.movementlabs.xyz
PRIVY_APP_ID=your_privy_app_id
PRIVY_SECRET=your_privy_secret
```

**Merchant** (`merchant/.env.local`):
```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Mobile** (`mobile/.env`):
```env
EXPO_PUBLIC_PRIVY_APP_ID=your_privy_app_id
EXPO_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### Installation

```bash
# Clone repository
git clone https://github.com/gabrielantonyxaviour/TapMove.git
cd TapMove

# Install dependencies
cd backend && npm install
cd ../merchant && npm install
cd ../mobile && npm install

# Deploy contracts (Movement testnet)
cd ../contracts
aptos move compile
aptos move publish --profile movement-testnet
```

### Running Locally

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Merchant Terminal
cd merchant && npm run dev

# Terminal 3: Mobile App
cd mobile && npx expo start
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Customer Mobile App                           │
│                    (React Native + Privy SDK)                        │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │  Wallet   │  │   NFC     │  │  Payment  │  │  History  │       │
│  │   Home    │  │  Handler  │  │  Confirm  │  │  Receipts │       │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘       │
└─────────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│     Merchant Terminal        │    │       TapMove Backend        │
│   (Next.js PWA)              │    │       (Node.js)              │
│  - Payment creation          │    │  - Payment orchestration     │
│  - QR/NFC broadcast          │    │  - Merchant management       │
│  - Real-time updates         │    │  - Transaction indexing      │
└──────────────────────────────┘    └──────────────────────────────┘
                │                               │
                └───────────────┬───────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Movement Network                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐          │
│  │     USDC      │  │    Payment    │  │   Merchant    │          │
│  │   Contract    │  │    Router     │  │   Registry    │          │
│  └───────────────┘  └───────────────┘  └───────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## NFC Payment Flow

1. **Merchant creates payment** → Amount + description
2. **Terminal broadcasts NFC** → `tapmove://pay?id=xyz`
3. **Customer taps phone** → App opens, shows payment
4. **Biometric confirm** → Privy signs transaction
5. **Settlement (~200ms)** → Movement confirms, both parties notified

---

## Move Contracts

### Payment Module

```move
module tapmove::payment {
    public entry fun pay(
        payer: &signer,
        merchant: address,
        amount: u64,
        payment_id: vector<u8>
    ) {
        // Transfer USDC from payer to merchant
        // Emit payment event
    }
}
```

### Deployment

```bash
cd contracts
aptos move compile
aptos move test
aptos move publish --profile movement-testnet
```

---

## API Reference

### Create Payment

```http
POST /api/payments
Content-Type: application/json

{
  "merchantId": "merchant_123",
  "amount": "15.00",
  "description": "Coffee order"
}
```

### Get Payment Status

```http
GET /api/payments/:id
```

### Confirm Payment

```http
POST /api/payments/:id/confirm
Content-Type: application/json

{
  "transactionHash": "0x..."
}
```

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `docs:` Documentation
- `test:` Tests

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Links

- **Demo**: See [DEMO.md](./DEMO.md)
- **Track**: Best App on Movement Using Privy Wallets
- **Movement Docs**: https://docs.movementlabs.xyz
- **Privy Docs**: https://docs.privy.io

---

## Team

Built for Movement x Privy Hackathon 2024

---

**TapMove** - *The future of crypto payments*
