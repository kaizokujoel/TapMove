# PRD: TapMove — NFC Tap-to-Pay with Privy Wallets

## Track: Best App on Movement Using Privy Wallets

---

## Executive Summary

TapMove is a mobile-first payment app that enables tap-to-pay cryptocurrency transactions using NFC and Privy embedded wallets. Users tap their phone to pay merchants in USDC on Movement, with sub-second settlement and zero seed phrase management.

---

## Problem Statement

Crypto payments fail at point-of-sale because:

1. **Too many steps** — Open wallet → Scan QR → Enter amount → Confirm → Wait
2. **Seed phrase anxiety** — Users fear losing funds
3. **Slow confirmation** — 10-60 seconds feels like forever at checkout
4. **Poor merchant UX** — Complex integration, volatile assets

**Apple Pay works because:** One tap → Done. We need this for crypto.

---

## Solution Overview

### Core Experience

```
Customer                              Merchant
   │                                     │
   │   [Tap phone to terminal]           │
   │ ─────────────────────────────────▶  │
   │                                     │
   │   Transaction signed (Privy)        │
   │   Settled on Movement (~200ms)      │
   │                                     │
   │   ✅ Payment complete               │
   │ ◀─────────────────────────────────  │
   │                                     │
   │   Receipt + loyalty points          │
```

### Why Privy + Movement

| Component | Solution | Why |
|-----------|----------|-----|
| **Wallet** | Privy embedded | No seed phrases, social recovery |
| **Settlement** | Movement FFS | Sub-second finality |
| **Currency** | USDC | Stable value, merchant-friendly |
| **Transport** | NFC + QR fallback | Works on any smartphone |

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Customer Mobile App                               │
│                    (React Native + Privy SDK)                           │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Wallet    │  │    NFC      │  │  Payment    │  │   History   │   │
│  │   Home      │  │   Handler   │  │   Confirm   │  │   & Receipts│   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌──────────────────────────────────┐    ┌──────────────────────────────┐
│      Merchant Terminal        │    │       TapMove Backend         │
│   (Web App / Dedicated POS)   │    │         (Node.js)            │
│                               │    │                               │
│  - Generate payment request   │    │  - Payment orchestration     │
│  - Display QR / NFC beacon    │    │  - Merchant management       │
│  - Confirm settlement         │    │  - Analytics & reporting     │
│  - Print receipt              │    │  - Webhook notifications     │
└──────────────────────────────┘    └──────────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Movement Network                                 │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    │
│  │   USDC      │  │   Payment   │  │   Merchant  │                    │
│  │   Contract  │  │   Router    │  │   Registry  │                    │
│  └─────────────┘  └─────────────┘  └─────────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### NFC Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           NFC Payment Flow                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. MERCHANT INITIATES                                                  │
│     ┌────────────────────────────────────────┐                         │
│     │  Merchant POS creates PaymentRequest:  │                         │
│     │  {                                     │                         │
│     │    id: "pay_abc123",                   │                         │
│     │    merchant: "0xmerchant...",          │                         │
│     │    amount: "25.00",                    │                         │
│     │    currency: "USDC",                   │                         │
│     │    memo: "Coffee Shop - Order #42",    │                         │
│     │    expiry: 1703456789                  │                         │
│     │  }                                     │                         │
│     └────────────────────────────────────────┘                         │
│                          │                                              │
│                          ▼                                              │
│  2. NFC BROADCAST                                                       │
│     ┌────────────────────────────────────────┐                         │
│     │  Terminal broadcasts NDEF message:     │                         │
│     │  - URI: TapMove://pay?id=pay_abc123    │                         │
│     │  - Or: Deep link with encoded request  │                         │
│     └────────────────────────────────────────┘                         │
│                          │                                              │
│                          ▼                                              │
│  3. CUSTOMER TAP                                                        │
│     ┌────────────────────────────────────────┐                         │
│     │  Customer phone reads NFC:             │                         │
│     │  - App opens (if closed)               │                         │
│     │  - Payment sheet slides up             │                         │
│     │  - Shows: "Pay $25.00 to Coffee Shop?" │                         │
│     └────────────────────────────────────────┘                         │
│                          │                                              │
│                          ▼                                              │
│  4. BIOMETRIC CONFIRM                                                   │
│     ┌────────────────────────────────────────┐                         │
│     │  Face ID / Touch ID / PIN              │                         │
│     │  ← Privy signs transaction             │                         │
│     └────────────────────────────────────────┘                         │
│                          │                                              │
│                          ▼                                              │
│  5. SETTLEMENT (~200ms)                                                 │
│     ┌────────────────────────────────────────┐                         │
│     │  Transaction broadcast to Movement     │                         │
│     │  FFS confirms in <1 second             │                         │
│     │  Merchant terminal shows ✅            │                         │
│     └────────────────────────────────────────┘                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Privy Integration

```typescript
// Customer App - Privy Setup
import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-native-auth";

const App = () => (
  <PrivyProvider
    appId="your-privy-app-id"
    config={{
      embeddedWallets: {
        createOnLogin: "all-users",
        noPromptOnSignature: false,  // Always prompt for payments
      },
      loginMethods: ["email", "google", "apple"],
      appearance: {
        theme: "light",
        accentColor: "#FF6B00",  // Movement orange
      },
    }}
  >
    <TapMoveApp />
  </PrivyProvider>
);

// Payment signing
const PaymentHandler = () => {
  const { ready } = usePrivy();
  const { wallets } = useWallets();

  const processPayment = async (paymentRequest: PaymentRequest) => {
    const wallet = wallets[0];  // Embedded wallet

    // Build USDC transfer transaction
    const tx = buildUSDCTransfer({
      to: paymentRequest.merchant,
      amount: paymentRequest.amount,
      memo: paymentRequest.id,
    });

    // Privy prompts for biometric
    const signedTx = await wallet.signTransaction(tx);

    // Submit to Movement
    const result = await submitToMovement(signedTx);

    return result;
  };

  return <NfcListener onPaymentRequest={processPayment} />;
};
```

### Move Contracts

```move
module TapMove::payment {
    use aptos_framework::coin;
    use aptos_framework::event;
    use std::string::String;

    /// Payment record for receipts and disputes
    struct Payment has key, store {
        id: vector<u8>,
        payer: address,
        merchant: address,
        amount: u64,
        currency: String,
        memo: String,
        timestamp: u64,
        status: PaymentStatus
    }

    enum PaymentStatus has store, drop, copy {
        Completed,
        Refunded,
        Disputed
    }

    struct PaymentCompleted has drop, store {
        payment_id: vector<u8>,
        payer: address,
        merchant: address,
        amount: u64,
        timestamp: u64
    }

    /// Execute payment with memo for receipts
    public entry fun pay(
        payer: &signer,
        merchant: address,
        amount: u64,
        payment_id: vector<u8>,
        memo: String
    ) {
        // Transfer USDC
        let coins = coin::withdraw<USDC>(payer, amount);
        coin::deposit(merchant, coins);

        // Record payment
        let payment = Payment {
            id: payment_id,
            payer: signer::address_of(payer),
            merchant,
            amount,
            currency: string::utf8(b"USDC"),
            memo,
            timestamp: timestamp::now_seconds(),
            status: PaymentStatus::Completed
        };

        move_to(payer, payment);

        // Emit event for merchant notification
        event::emit(PaymentCompleted {
            payment_id,
            payer: signer::address_of(payer),
            merchant,
            amount,
            timestamp: timestamp::now_seconds()
        });
    }

    /// Merchant initiates refund
    public entry fun refund(
        merchant: &signer,
        payment_id: vector<u8>,
        payer: address
    ) acquires Payment {
        let payment = borrow_global_mut<Payment>(payer);
        assert!(payment.id == payment_id, E_PAYMENT_NOT_FOUND);
        assert!(payment.merchant == signer::address_of(merchant), E_NOT_MERCHANT);

        // Transfer back
        let coins = coin::withdraw<USDC>(merchant, payment.amount);
        coin::deposit(payer, coins);

        payment.status = PaymentStatus::Refunded;
    }
}

module TapMove::merchant {
    use std::string::String;

    struct Merchant has key {
        address: address,
        name: String,
        category: String,
        logo_url: String,
        webhook_url: String,
        total_volume: u64,
        total_transactions: u64,
        fee_rate_bps: u64,  // Platform fee in basis points
        verified: bool
    }

    /// Register as a merchant
    public entry fun register(
        account: &signer,
        name: String,
        category: String,
        logo_url: String,
        webhook_url: String
    ) {
        let merchant = Merchant {
            address: signer::address_of(account),
            name,
            category,
            logo_url,
            webhook_url,
            total_volume: 0,
            total_transactions: 0,
            fee_rate_bps: 50,  // 0.5% default
            verified: false
        };

        move_to(account, merchant);
    }
}
```

---

## Feature Specifications

### MVP (Hackathon Scope)

| Feature | Priority | Effort |
|---------|----------|--------|
| Privy embedded wallet setup | P0 | Low |
| QR code payment (fallback) | P0 | Medium |
| NFC payment (Android) | P0 | High |
| Basic merchant terminal (web) | P0 | Medium |
| USDC transfer on Movement | P0 | Medium |
| Transaction history | P0 | Low |

### Post-MVP Features

| Feature | Priority | Effort |
|---------|----------|--------|
| iOS NFC (Apple Pay style) | P1 | High |
| Loyalty points system | P1 | Medium |
| Multi-currency support | P1 | Medium |
| Merchant dashboard | P1 | High |
| POS hardware integration | P2 | High |
| Fiat on-ramp | P2 | High |
| Recurring payments | P2 | Medium |

---

## User Interface Design

### Customer App

```
┌─────────────────────────────────┐
│  ●●●●○  5:42 PM                │
├─────────────────────────────────┤
│                                 │
│         TapMove                 │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │      💳                 │   │
│  │                         │   │
│  │    $1,234.56           │   │
│  │    Available USDC       │   │
│  │                         │   │
│  │  [  + Add Funds  ]     │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Ready to Pay                   │
│  ─────────────────────────────  │
│                                 │
│      📱 Tap to pay or           │
│      📷 Scan QR code            │
│                                 │
│                                 │
│  Recent Transactions            │
│  ─────────────────────────────  │
│                                 │
│  ☕ Coffee Shop      -$5.50    │
│     Today, 2:30 PM              │
│                                 │
│  🛒 Grocery Store   -$42.30    │
│     Yesterday                   │
│                                 │
│  ⛽ Gas Station     -$35.00    │
│     Dec 22                      │
│                                 │
├─────────────────────────────────┤
│  [Home]  [Scan]  [History]  [⚙️] │
└─────────────────────────────────┘
```

### Payment Confirmation Sheet

```
┌─────────────────────────────────┐
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │     ☕ Coffee Shop       │   │
│  │     123 Main Street     │   │
│  │                         │   │
│  │     ─────────────────   │   │
│  │                         │   │
│  │        $25.00           │   │
│  │                         │   │
│  │     Order #42           │   │
│  │     2 Lattes, 1 Muffin  │   │
│  │                         │   │
│  │     ─────────────────   │   │
│  │                         │   │
│  │  Network: Movement      │   │
│  │  Fee: $0.001            │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │   👆 Confirm with       │   │
│  │      Face ID            │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│       [ Cancel Payment ]        │
│                                 │
└─────────────────────────────────┘
```

### Merchant Terminal (Web)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TapMove Merchant                              Coffee Shop    [Logout]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─ New Payment ────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │                                                                   │   │
│  │     Amount:   $[  25.00  ]                                       │   │
│  │                                                                   │   │
│  │     Memo:     [ Order #42 - 2 Lattes, 1 Muffin              ]   │   │
│  │                                                                   │   │
│  │                                                                   │   │
│  │               [    Create Payment    ]                           │   │
│  │                                                                   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─ Active Payment ─────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │     ┌─────────────────┐                                          │   │
│  │     │                 │      Waiting for customer...              │   │
│  │     │   [QR CODE]     │                                          │   │
│  │     │                 │      Amount: $25.00                       │   │
│  │     │                 │      ID: pay_abc123                       │   │
│  │     └─────────────────┘                                          │   │
│  │                                                                   │   │
│  │     NFC Active: ✅  Ready to receive tap                         │   │
│  │                                                                   │   │
│  │               [    Cancel    ]                                    │   │
│  │                                                                   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Today's Summary                                                        │
│  ─────────────────────────────────────────────────────────────────────  │
│  Transactions: 23        Volume: $456.78        Tips: $34.50           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Revenue Model

### Transaction Fees

| Party | Fee |
|-------|-----|
| Customer | $0 (free) |
| Merchant | 0.5% per transaction |
| Movement gas | ~$0.001 |

**Comparison:**
- Credit cards: 2.5-3.5%
- PayPal: 2.9% + $0.30
- **TapMove: 0.5%**

### Revenue Projections

| Milestone | Monthly Volume | Revenue (0.5%) |
|-----------|----------------|----------------|
| Month 3 | $50,000 | $250 |
| Month 6 | $500,000 | $2,500 |
| Month 12 | $5,000,000 | $25,000 |

### Additional Revenue
- Premium merchant features: $29/mo
- Loyalty program management: $49/mo
- Enterprise API access: Custom

---

## Technical Requirements

### Customer App Stack
- **Framework:** React Native (Expo)
- **Wallet:** Privy React Native SDK
- **NFC:** react-native-nfc-manager
- **Biometrics:** expo-local-authentication
- **State:** Zustand + React Query

### Merchant Terminal Stack
- **Framework:** Next.js PWA
- **NFC:** Web NFC API (Chrome Android)
- **WebSocket:** Real-time payment status
- **QR:** react-qr-code

### Backend Stack
- **Runtime:** Node.js / Bun
- **Framework:** Express or Hono
- **Database:** PostgreSQL
- **Cache:** Redis
- **Webhooks:** BullMQ

### Movement Integration
- Movement TypeScript SDK
- USDC contract interaction
- Event subscriptions for confirmations

---

## Success Metrics

### Hackathon Demo

| Metric | Target |
|--------|--------|
| Privy wallet creation | ✅ |
| QR payment works | ✅ |
| NFC payment works (Android) | ✅ |
| Sub-second settlement | ✅ |
| Receipt/history | ✅ |

### Post-Launch

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| App downloads | 500 | 3,000 | 15,000 |
| Active merchants | 10 | 50 | 200 |
| Transactions | 500 | 5,000 | 50,000 |
| Volume | $5,000 | $100,000 | $1,000,000 |

---

## Development Timeline

### Week 1: Core Wallet
- [ ] Privy setup (React Native)
- [ ] Embedded wallet creation
- [ ] USDC balance display
- [ ] Basic transfer function

### Week 2: Payment Flow
- [ ] QR code generation (merchant)
- [ ] QR scanning (customer)
- [ ] NFC implementation (Android)
- [ ] Payment confirmation UI

### Week 3: Settlement & Receipts
- [ ] Movement contract deployment
- [ ] Real-time confirmation
- [ ] Transaction history
- [ ] Merchant notifications

### Week 4: Polish & Demo
- [ ] Bug fixes
- [ ] Demo video
- [ ] Merchant onboarding flow
- [ ] Submission

---

## Why This Wins Privy Track

### Perfect Privy Showcase

1. **Embedded wallets** — Users never see seed phrases
2. **Social login** — Email/Google/Apple sign-in
3. **Biometric signing** — Face ID/Touch ID for payments
4. **Seamless UX** — Crypto that feels like Apple Pay

### Movement Synergy

1. **FFS speed** — Sub-second finality is critical for POS
2. **Low fees** — $0.001 makes micropayments viable
3. **Growing ecosystem** — First payment app on Movement

### Real-World Utility

1. **Solves actual problem** — Crypto payments are broken
2. **Clear path to merchants** — Start with crypto-native businesses
3. **Mainstream potential** — UX good enough for normies

---

## Appendix

### NFC Technical Details

```typescript
// Android NFC Reading
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

const initNfc = async () => {
  await NfcManager.start();
};

const readNfcPayment = async () => {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);

    const tag = await NfcManager.getTag();
    const ndefRecords = tag?.ndefMessage;

    if (ndefRecords) {
      const uriRecord = ndefRecords.find(r => r.tnf === Ndef.TNF_WELL_KNOWN);
      if (uriRecord) {
        const uri = Ndef.uri.decodePayload(uriRecord.payload);
        // uri = "TapMove://pay?id=pay_abc123"
        return parsePaymentUri(uri);
      }
    }
  } finally {
    NfcManager.cancelTechnologyRequest();
  }
};

// Android NFC Writing (Merchant Terminal)
const writeNfcPayment = async (paymentRequest: PaymentRequest) => {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);

    const uri = `TapMove://pay?id=${paymentRequest.id}`;
    const bytes = Ndef.encodeMessage([Ndef.uriRecord(uri)]);

    await NfcManager.ndefHandler.writeNdefMessage(bytes);
  } finally {
    NfcManager.cancelTechnologyRequest();
  }
};
```

### Security Considerations

| Risk | Mitigation |
|------|------------|
| Stolen phone | Biometric required for every payment |
| NFC replay attack | One-time payment IDs with expiry |
| Man-in-middle | End-to-end encryption, verify on-chain |
| Merchant fraud | On-chain receipts, dispute system |

### Team Requirements
- 1 React Native developer (customer app)
- 1 Full-stack developer (merchant terminal + backend)
- 1 Move developer (contracts)
