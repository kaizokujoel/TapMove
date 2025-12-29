# TapMove Manual Test Checklist

## Prerequisites

- [ ] Backend running on localhost:3001
- [ ] Merchant terminal running on localhost:3000
- [ ] Mobile app running on physical Android device (for NFC)
- [ ] Contracts deployed to Movement testnet
- [ ] Test MOVE tokens in mobile wallet for gas
- [ ] USDC (or test tokens) for payment testing

## Health Checks

- [ ] `curl http://localhost:3001/health` returns status: ok
- [ ] Merchant terminal loads without errors
- [ ] Mobile app launches and shows login screen

## Merchant Registration

- [ ] Can access registration page at /register
- [ ] Form validation shows errors for invalid inputs
- [ ] Name field is required
- [ ] Wallet address validation works
- [ ] Registration returns API key (save it!)
- [ ] Redirects to dashboard after registration
- [ ] Merchant appears in merchant list

## Payment Creation (Merchant Terminal)

- [ ] Can enter payment amount (numeric input)
- [ ] Amount validation (positive numbers only)
- [ ] Can add memo/description
- [ ] "Create Payment" button generates QR code
- [ ] QR code is scannable
- [ ] Payment ID shown in URL/status
- [ ] Countdown timer shows expiry
- [ ] Payment expires after timeout (5 min default)

## QR Code Payment (Mobile App)

- [ ] Can access scan tab
- [ ] Camera permission requested
- [ ] QR scanner opens
- [ ] Can scan merchant QR code
- [ ] Payment details display correctly:
  - [ ] Merchant name
  - [ ] Amount
  - [ ] Memo
  - [ ] Network fee estimate
- [ ] Balance check works (shows insufficient if low)
- [ ] "Confirm Payment" button works
- [ ] Biometric/PIN prompt appears for signing
- [ ] Transaction submits after approval
- [ ] Loading state shown during submission
- [ ] Success screen shows:
  - [ ] Checkmark animation
  - [ ] Transaction hash
  - [ ] Amount paid
  - [ ] "View on Explorer" link works
- [ ] Merchant terminal shows success simultaneously

## NFC Payment (Android Only)

- [ ] Merchant terminal can write NFC tag
- [ ] NFC write status shows "Active"
- [ ] Mobile app detects NFC tap
- [ ] Haptic feedback on detection
- [ ] Same payment flow as QR after reading
- [ ] Payment completes successfully

## Deep Links

- [ ] `tapmove://pay?id=xxx` opens app to payment
- [ ] Works when app is closed
- [ ] Works when app is in background
- [ ] Invalid payment IDs show error

## Transaction History (Mobile)

- [ ] History tab shows recent transactions
- [ ] Latest payment appears at top
- [ ] Transaction details are correct:
  - [ ] Merchant name
  - [ ] Amount
  - [ ] Date/time
  - [ ] Status
- [ ] Can tap to view transaction details
- [ ] "View on Explorer" link works

## Merchant Dashboard

- [ ] Payment history shows
- [ ] Transaction list updates after payment
- [ ] Stats show:
  - [ ] Total payments
  - [ ] Total volume
  - [ ] Recent transactions
- [ ] Receipt download works
- [ ] Receipt print works

## Error Handling

- [ ] Insufficient balance shows clear error
- [ ] Error screen has "Try Again" button
- [ ] Expired payment shows "Payment Expired" error
- [ ] Network error shows retry option
- [ ] Invalid QR shows "Invalid Payment" error
- [ ] User cancellation handled gracefully

## Edge Cases

- [ ] Very small amount (0.01)
- [ ] Large amount (1000+)
- [ ] Long memo (256 chars)
- [ ] Special characters in memo
- [ ] Multiple payments in sequence
- [ ] Cancel mid-payment
- [ ] App backgrounding during payment
- [ ] Network disconnect during payment

## Security Tests

- [ ] API key required for merchant endpoints
- [ ] Invalid API key rejected
- [ ] Rate limiting works (try 20 rapid requests)
- [ ] Payment can only be paid once
- [ ] Expired payments cannot be paid

## Performance

- [ ] QR scan < 2 seconds
- [ ] Payment submission < 5 seconds
- [ ] Status updates < 1 second
- [ ] History loads < 2 seconds

## Notes

Use this space to note any issues found:

---

Tested by: _________________
Date: _________________
Version: _________________
