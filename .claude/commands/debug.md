---
description: Strategic debugging across contracts, mobile app, merchant terminal, and backend
argument: <error description or unexpected behavior>
---

# Full-Stack Debug

Strategic debugging system for TapMove. Identifies issues across: **Move contracts <-> Mobile app <-> Merchant terminal <-> Backend**.

**SINGLE SOURCE OF TRUTH:** `contracts/deployment.config.json`

## Prerequisites

- Read `contracts/deployment.config.json` for deployed addresses
- Identify which layer(s) the error originates from
- Load relevant skill (`move-contracts`, `privy-integration`, `nfc-payments`, `ui-dev`)

## Debug Strategy

### Phase 1: Classify the Issue

| Symptom | Primary Layer | Check Also |
|---------|---------------|------------|
| Transaction fails | Move contract | Frontend (wrong args), Privy (signing) |
| NFC not reading | Mobile app | Device settings, NFC hardware |
| Payment stuck | Backend | Contract events, WebSocket |
| Wallet won't connect | Mobile app | Privy config, network mismatch |
| QR won't scan | Mobile app | Camera permissions, QR format |
| "Module not found" | Frontend | Contract address, deployment |

### Phase 2: Layer-Specific Debugging

#### Move Contract Issues

```bash
# Test contract locally
cd contracts && aptos move test -vvv

# Check if module exists on-chain
aptos move view --function-id 'ADDR::payment::get_payment'

# Verify deployment
cat deployment.config.json | jq '.addresses'
```

#### Mobile App Issues

```bash
# Check Expo logs
npx expo start

# Common issues:
# - Privy app ID mismatch
# - Wrong network in config
# - NFC permissions not granted
# - Deep link scheme not configured
```

#### Merchant Terminal Issues

```bash
# Check Next.js build
cd merchant && npm run build

# Common issues:
# - Environment variables missing
# - WebSocket connection failed
# - Web NFC not supported (need Chrome Android)
```

#### Backend Issues

```bash
# Check logs
cd backend && npm run dev

# Common issues:
# - Database connection
# - Redis not running
# - Payment webhook timeout
```

### Phase 3: Cross-Layer Verification

**Address Consistency Check:**
```bash
# 1. Contract deployment
cat contracts/deployment.config.json

# 2. Mobile app constants
cat mobile/constants/addresses.ts

# 3. Merchant terminal constants
cat merchant/constants/addresses.ts

# 4. Backend config
cat backend/.env
```

**All should have matching addresses!**

### Phase 4: Common Integration Bugs

| Bug Pattern | Cause | Fix |
|-------------|-------|-----|
| Mobile works, merchant fails | Different addresses | Sync from deployment.config.json |
| Payment signed but fails | Wrong function args | Check Move function signature |
| NFC reads but no payment | Deep link not handled | Check app scheme config |
| Events not received | WebSocket disconnect | Check backend connection |
| Privy login fails | Wrong app ID | Verify PRIVY_APP_ID in .env |

### Phase 5: Resolution

After identifying the issue:

1. **If config mismatch:** Sync all configs from deployment.config.json
2. **If contract bug:** Fix → test → redeploy → update configs
3. **If mobile bug:** Fix → test on device
4. **If merchant bug:** Fix → test in Chrome Android
5. **If backend bug:** Fix → restart services

## Debug Checklist

```
□ Reproduced the issue
□ Identified which layer (contract/mobile/merchant/backend)
□ Checked address consistency across all configs
□ Checked network/chainId consistency
□ Read error messages carefully
□ Tested component in isolation
□ Fixed and verified resolution
```

## Example Usage

```
/debug Transaction reverts when paying but works in Move tests
```

```
/debug NFC tag reads but app doesn't show payment sheet
```

```
/debug Merchant terminal shows "waiting" but payment already confirmed on-chain
```
