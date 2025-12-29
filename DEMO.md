# TapMove Demo Guide

## Overview

TapMove demonstrates NFC tap-to-pay cryptocurrency transactions using Privy embedded wallets on Movement Network. This guide walks through the complete demo flow.

---

## Pre-Demo Setup

### Requirements

- **Mobile Device**: Android phone with NFC support (iOS for QR-only flow)
- **Chrome on Android**: For merchant terminal NFC broadcasting
- **Movement Testnet**: Ensure contracts are deployed
- **Test USDC**: Fund the customer wallet with testnet USDC

### Environment Checklist

- [ ] Backend API running at `https://api.tapmove.xyz` or locally
- [ ] Merchant terminal accessible at `https://merchant.tapmove.xyz`
- [ ] Mobile app installed via Expo Go or development build
- [ ] Customer wallet funded with 100+ test USDC
- [ ] Merchant account registered and approved

### Quick Local Setup

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Merchant Terminal
cd merchant && npm run dev

# Terminal 3: Mobile App
cd mobile && npx expo start
```

---

## Demo Script

### Act 1: The Problem (30 seconds)

> "Imagine you're at a coffee shop. With traditional crypto payments, you'd need to:
> 1. Open your wallet app
> 2. Scan a QR code
> 3. Enter the exact amount
> 4. Confirm the transaction
> 5. Wait 10-60 seconds for confirmation
>
> That's 5 steps and up to a minute. Apple Pay? One tap. Done. We built that for crypto."

### Act 2: Customer Onboarding (1 minute)

1. **Open TapMove app** on customer phone
2. **Login with email** - "No seed phrases. Just email or social login."
3. **Show wallet created** - "Privy creates a secure embedded wallet instantly."
4. **Show balance** - "$50 USDC ready to spend"

### Act 3: Merchant Setup (30 seconds)

1. **Open merchant terminal** on tablet/laptop
2. **Login as merchant** - "The merchant registers once"
3. **Show dashboard** - "Real-time transaction view, analytics"

### Act 4: The Magic - NFC Payment (1 minute)

1. **Merchant creates payment**:
   - Enter amount: $15.00
   - Description: "Latte + Croissant"
   - Click "Create Payment"

2. **Show QR + NFC ready**:
   - "QR code for any phone"
   - "NFC broadcasting for tap-to-pay"

3. **Customer taps phone to terminal**:
   - Payment sheet slides up automatically
   - Shows: "Pay $15.00 to Coffee Shop?"
   - Customer confirms with Face ID/fingerprint

4. **Settlement in <1 second**:
   - Merchant terminal shows checkmark
   - Customer sees transaction in history
   - "Paid. On-chain. Sub-second."

### Act 5: The Tech (30 seconds)

> "How does this work?
> - **Privy** handles wallet security - no seed phrases, social recovery
> - **Movement Network** provides sub-second finality with Fast Finality Settlement
> - **NFC** enables tap-to-pay just like Apple Pay
> - **USDC** gives merchants stable value"

---

## Key Talking Points

### Why Privy?

- **No seed phrases**: Users never see or manage private keys
- **Social recovery**: Lose your phone? Recover via email
- **Mobile-native**: Built for React Native, smooth UX
- **Secure signing**: Biometric-protected transaction signing

### Why Movement?

- **Sub-second finality**: Fast Finality Settlement (FFS) confirms in ~200ms
- **Move language**: Resource-oriented programming prevents reentrancy
- **Low fees**: Microtransactions are economically viable
- **EVM compatibility**: Easy migration for existing dApps

### Why NFC?

- **Familiar UX**: Same experience as Apple Pay/Google Pay
- **No app juggling**: Payment opens automatically on tap
- **Secure**: Data only transfers on close proximity
- **Universal**: Works on virtually all modern smartphones

---

## Fallback Flows

### QR Code (iOS or no NFC)

If NFC isn't available:
1. Customer opens TapMove app
2. Taps "Scan to Pay"
3. Scans QR code on merchant terminal
4. Confirms payment

### Deep Link

For web or messaging:
1. Merchant shares payment link: `tapmove://pay?id=xyz`
2. Customer clicks link
3. App opens to payment confirmation
4. Customer confirms

---

## Known Limitations

- **Android NFC**: Full tap-to-pay experience (Chrome required for merchant)
- **iOS NFC**: QR fallback (iOS NFC writing requires special entitlement)
- **Testnet only**: Production deployment pending Movement mainnet
- **USDC only**: Multi-token support in roadmap

---

## FAQ

**Q: What if I lose my phone?**
> Privy social recovery. Log in on new device with email, recover wallet.

**Q: Are transactions reversible?**
> No, blockchain transactions are final. Refunds require merchant cooperation.

**Q: What about gas fees?**
> Movement's low fees make micropayments viable. ~$0.001 per transaction.

**Q: Can merchants accept other tokens?**
> Currently USDC only. Multi-token support planned.

---

## Future Roadmap

1. **Loyalty Points**: On-chain rewards for frequent purchases
2. **Split Payments**: Pay with friends
3. **Recurring Payments**: Subscriptions via signed approvals
4. **Multi-currency**: Accept any supported token
5. **Merchant SDK**: Easy integration for existing POS systems

---

## Demo Video Script (3 minutes)

### 0:00 - 0:15 | Hook
"What if paying with crypto was as easy as Apple Pay?"

### 0:15 - 0:45 | Problem
Show traditional crypto payment flow, emphasize friction points.

### 0:45 - 1:30 | Solution Demo
Live tap-to-pay demo with timer showing sub-second settlement.

### 1:30 - 2:15 | Tech Stack
Explain Privy + Movement + NFC integration.

### 2:15 - 2:45 | Use Cases
Coffee shop, food truck, vending machine, tips.

### 2:45 - 3:00 | Call to Action
"Try TapMove. The future of crypto payments."

---

## Contact

- **Project**: TapMove
- **Track**: Best App on Movement Using Privy Wallets
- **GitHub**: https://github.com/gabrielantonyxaviour/TapMove
