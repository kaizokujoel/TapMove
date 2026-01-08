# TapMove - App Flow & Testing Guide

## Quick Start Testing

### Prerequisites

**1. Start Backend (Terminal 1)**
```bash
cd backend
npm install
cp .env.example .env  # Configure with your keys
npm run dev           # Runs on http://localhost:4001
```

**2. Start Merchant Terminal (Terminal 2)**
```bash
cd merchant
npm install
cp .env.example .env.local  # Set NEXT_PUBLIC_API_URL=http://localhost:4001
npm run dev                  # Runs on http://localhost:3000
```

**3. Start Mobile App (Terminal 3)**
```bash
cd mobile
npm install
npx expo start  # Press 'i' for iOS simulator or 'a' for Android
```

### Environment Variables

| Service | Key Variables |
|---------|---------------|
| Backend | `PORT=4001`, `MOVEMENT_NODE_URL`, `TAPMOVE_MODULE_ADDRESS`, `SHINAMI_GAS_STATION_ACCESS_KEY` |
| Merchant | `NEXT_PUBLIC_API_URL=http://localhost:4001`, `NEXT_PUBLIC_PRIVY_APP_ID` |
| Mobile | `EXPO_PUBLIC_API_URL`, `PRIVY_APP_ID`, `PRIVY_CLIENT_ID` |

---

## End-to-End Payment Flow Test

### Step 1: Customer Login (Mobile App)

1. Open the mobile app
2. Tap "Get Started" or "Sign In"
3. Sign in with email/Google/Apple via Privy
4. Privy creates an embedded wallet automatically
5. **Verify**: Home screen shows wallet address and USDC balance

### Step 2: Fund Customer Wallet (Testnet)

For testnet testing, fund the customer wallet:
```bash
# Get testnet MOVE tokens from faucet
curl -X POST "https://faucet.movementnetwork.xyz/mint?address=<CUSTOMER_WALLET_ADDRESS>&amount=100000000"
```

Or use the app's faucet feature if available.

### Step 3: Merchant Login (Web Terminal)

1. Open http://localhost:3000
2. Sign in with Privy (merchant account)
3. **Verify**: Dashboard loads with stats and transaction history

### Step 4: Create Payment Request (Merchant)

1. Click "New Payment" or navigate to Payment page
2. Enter amount (e.g., `5.00`)
3. Enter memo (e.g., `Coffee order #123`)
4. Click "Create Payment"
5. **Verify**: QR code displayed with countdown timer

### Step 5: Scan & Pay (Mobile App)

**Option A: QR Code**
1. Tap "Scan" tab in mobile app
2. Point camera at merchant's QR code
3. Payment details screen appears

**Option B: Manual Entry**
1. Tap "Scan" tab
2. Tap "Enter Code Manually"
3. Type the payment ID shown on merchant screen

**Option C: NFC (Android)**
1. Tap "Tap to Pay" on merchant terminal
2. Hold phone near NFC tag/device
3. Deep link triggers payment screen

### Step 6: Confirm Payment (Mobile App)

1. Review payment details:
   - Amount
   - Merchant name
   - Payment ID
   - Memo
2. Tap "Confirm Payment"
3. Authenticate with Face ID/Touch ID (Privy biometric)
4. **Verify**:
   - Success screen with transaction hash
   - Link to Movement explorer

### Step 7: Verify Settlement (Both Sides)

**Mobile App:**
- Home screen shows updated balance (decreased)
- Transaction appears in history

**Merchant Terminal:**
- Payment status changes to "Completed"
- Success modal with transaction hash
- Dashboard stats update
- Transaction appears in history

---

## Component Testing

### Test Backend Health
```bash
curl http://localhost:4001/health
# Expected: { "status": "ok", "expiryChecker": "running" }

curl http://localhost:4001/config
# Expected: Network config with chainId, nodeUrl, module addresses
```

### Test Payment API
```bash
# Create payment
curl -X POST http://localhost:4001/payments \
  -H "Content-Type: application/json" \
  -d '{"merchantAddress": "0x123...", "amount": "5.00", "memo": "Test"}'

# Check payment status
curl http://localhost:4001/payments/<PAYMENT_ID>/status
```

### Test Balance Query
```bash
curl http://localhost:4001/balance/<WALLET_ADDRESS>
# Expected: { "balance": "1000000", "formatted": "1.00" }
```

---

## Payment States

| Status | Description |
|--------|-------------|
| `pending` | Payment created, waiting for customer |
| `submitted` | Transaction sent to blockchain |
| `confirmed` | On-chain confirmed, payment complete |
| `expired` | Payment request timed out (default: 5 min) |
| `failed` | Transaction failed on-chain |

---

## Deep Link Testing

Test the mobile app deep link handler:
```
tapmove://pay?id=<PAYMENT_ID>
```

On iOS Simulator:
```bash
xcrun simctl openurl booted "tapmove://pay?id=test-payment-123"
```

On Android Emulator:
```bash
adb shell am start -a android.intent.action.VIEW -d "tapmove://pay?id=test-payment-123"
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Backend connection refused | Check PORT, ensure `npm run dev` running |
| Privy auth fails | Verify PRIVY_APP_ID in env vars |
| Balance shows 0 | Fund wallet from testnet faucet |
| Payment stuck on pending | Check backend logs, verify webhook URL |
| NFC not working | iOS: Background NFC limited. Android: Check NFC enabled in settings |
| Transaction fails | Check wallet has enough MOVE for gas (or Shinami configured) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CUSTOMER MOBILE APP                       │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────────────┐  │
│  │  Login  │ → │  Home   │ → │  Scan   │ → │ Payment Confirm │  │
│  │ (Privy) │   │(Balance)│   │(QR/NFC) │   │   (Biometric)   │  │
│  └─────────┘   └─────────┘   └─────────┘   └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                              │
│  ┌──────────────┐   ┌───────────────┐   ┌──────────────────┐   │
│  │ POST /payments│   │GET /payments/:id│  │POST /payments/:id│   │
│  │ (Create)     │   │ (Get Details) │   │    /submit       │   │
│  └──────────────┘   └───────────────┘   └──────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Movement Service (Aptos SDK)                 │   │
│  │  • Build transaction  • Submit via Shinami  • Get status │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MOVEMENT BLOCKCHAIN                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  TapMove::payment::pay<CoinType>                        │    │
│  │  • Transfers USDC from payer to merchant                │    │
│  │  • Emits PaymentCompleted event                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MERCHANT TERMINAL                            │
│  ┌─────────────┐   ┌──────────────┐   ┌───────────────────┐    │
│  │  Dashboard  │   │Create Payment│   │  Payment Status   │    │
│  │  (Stats)    │   │  (QR Code)   │   │  (Polling/Webhook)│    │
│  └─────────────┘   └──────────────┘   └───────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Addresses (Testnet)

| Item | Address |
|------|---------|
| TapMove Module | `0x2b633f672b485166e89bb90903962d5ad26bbf70ce079ed484bae518d89d2dc5` |
| Coin Type | `0x1::aptos_coin::AptosCoin` |
| Movement Explorer | `https://explorer.movementnetwork.xyz` |
| Movement RPC | `https://testnet.movementnetwork.xyz/v1` |
| Chain ID | `250` (Testnet) |

---

## Testing Checklist

- [ ] Backend starts and health check passes
- [ ] Merchant terminal loads and connects to backend
- [ ] Mobile app builds and Privy auth works
- [ ] Customer can view wallet balance
- [ ] Merchant can create payment request
- [ ] QR code displays and is scannable
- [ ] Mobile app receives payment via QR/NFC/deep link
- [ ] Payment confirmation shows correct details
- [ ] Biometric authentication triggers Privy
- [ ] Transaction submits successfully
- [ ] Payment status updates to confirmed
- [ ] Merchant sees completion notification
- [ ] Transaction appears in both histories
- [ ] Explorer link shows correct transaction
