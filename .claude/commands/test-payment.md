---
description: End-to-end payment flow test
argument: <amount in USDC, e.g., "5.00">
---

# Test Payment Flow

Runs an end-to-end test of the payment flow from merchant terminal to customer app.

## Prerequisites

1. All components running:
   - Mobile app on device/emulator
   - Merchant terminal at localhost:3000
   - Backend at localhost:4000
   - Movement testnet accessible

2. Test accounts funded:
   - Customer wallet has USDC
   - Merchant registered on-chain

## Test Flow

### Step 1: Create Payment Request (Merchant)

```bash
# Via API
curl -X POST http://localhost:4000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "test-merchant",
    "amount": "5.00",
    "memo": "Test payment"
  }'
```

Expected response:
```json
{
  "id": "pay_abc123",
  "status": "pending",
  "qrCode": "TapMove://pay?id=pay_abc123"
}
```

### Step 2: Verify QR Display (Merchant Terminal)

- Navigate to merchant terminal
- Enter amount: $5.00
- Click "Create Payment"
- Verify QR code displays
- Verify payment ID shown

### Step 3: Scan/Tap Payment (Mobile App)

Option A: QR Code
- Open customer app
- Tap "Scan QR"
- Scan merchant's QR code

Option B: NFC (Android only)
- Enable NFC on device
- Tap device to NFC terminal
- App should open payment sheet

### Step 4: Verify Payment Sheet

Customer app should show:
- [ ] Merchant name
- [ ] Amount: $5.00
- [ ] Memo: "Test payment"
- [ ] Confirm button
- [ ] Cancel button

### Step 5: Confirm Payment

- Tap "Confirm with Face ID"
- Complete biometric verification
- Wait for transaction

### Step 6: Verify Settlement

**On-chain:**
```bash
# Check payment event
aptos move view \
  --function-id 'ADDR::payment::get_payment' \
  --args 'vector:pay_abc123'
```

**Merchant terminal:**
- Payment status should show ✅
- Amount should appear in today's summary

**Customer app:**
- Success animation
- Transaction in history

## Expected Timeline

| Step | Expected Duration |
|------|-------------------|
| Payment request | < 100ms |
| QR scan/NFC read | < 500ms |
| Biometric prompt | User dependent |
| Transaction sign | < 200ms |
| Movement confirmation | < 500ms |
| Webhook notification | < 1s |
| **Total** | **< 2s** (excluding user input) |

## Common Failures

| Issue | Cause | Fix |
|-------|-------|-----|
| QR not scanning | Camera permission | Check app permissions |
| Payment sheet blank | Backend unreachable | Check backend logs |
| Biometric fails | Privy config | Verify PRIVY_APP_ID |
| Transaction reverts | Insufficient balance | Fund test wallet |
| Merchant not notified | WebSocket disconnect | Restart backend |

## Success Criteria

- [ ] Payment created in < 100ms
- [ ] Customer receives payment request
- [ ] Biometric prompt appears
- [ ] Transaction settles in < 1s
- [ ] Merchant receives confirmation
- [ ] Transaction appears in history
- [ ] No errors in any logs
