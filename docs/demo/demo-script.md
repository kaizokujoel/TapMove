# TapMove Demo Script

## Before the Demo (Setup)

### 15 Minutes Before

1. Start all services:
   ```bash
   # Terminal 1: Backend
   cd backend && npm start

   # Terminal 2: Merchant
   cd merchant && npm run dev

   # Terminal 3: Mobile (on connected device)
   cd mobile && npx expo start
   ```

2. Verify services are running:
   - Backend: http://localhost:3001/health
   - Merchant: http://localhost:3000
   - Mobile: App opens on device

3. Pre-fund test wallet:
   - Ensure mobile wallet has test MOVE for gas
   - Ensure wallet has USDC/test tokens for payments

4. Create test merchant (if needed):
   - Register a "Demo Coffee Shop" in merchant terminal
   - Save the API key

5. Test the full flow once silently

### Equipment Check

- [ ] Laptop with merchant terminal open
- [ ] Android phone with TapMove app
- [ ] NFC tag (optional, for tap demo)
- [ ] Internet connection stable
- [ ] Phone charged (>50%)

## Demo Flow (3-5 Minutes)

### Opening Hook (30 seconds)

> "What if paying with crypto was as easy as tapping your phone?"

**Show the Problem:**
> "Today, paying with crypto means: opening a wallet, scanning a QR, confirming details, signing a transaction, waiting for confirmation... it's too many steps."

*[Optional: Show a complicated crypto payment flow]*

### The Solution (30 seconds)

> "We built TapMove - tap-to-pay crypto payments on Movement Network. One tap, instant settlement."

### Demo Part 1: Merchant Creates Payment (45 seconds)

*[On laptop, show merchant terminal]*

> "A coffee shop wants to accept crypto. They enter the order amount..."

1. Open merchant terminal
2. Enter amount: **$4.50**
3. Add memo: **"Latte and croissant"**
4. Click "Create Payment"

> "The QR code is ready. That's it for the merchant."

*[Point to the QR code on screen]*

### Demo Part 2: Customer Pays (60 seconds)

*[Pick up phone, show the mobile app]*

> "The customer opens TapMove and scans the code..."

1. Open scan tab
2. Point at QR code

> "They see the payment details - amount, merchant, what they're buying..."

*[Show payment confirmation screen]*

> "One tap to confirm, Face ID to authorize..."

3. Tap "Confirm Payment"
4. Authenticate with Face ID

*[Wait for success screen]*

> "And done. Sub-second settlement on Movement."

*[Show success on both phone and laptop]*

### Demo Part 3: NFC Option (30 seconds, optional)

> "But it gets even better. Merchants can program NFC tags..."

*[Hold phone near NFC tag if available]*

> "Customers just tap their phone - no scanning needed. Like Apple Pay, but for crypto."

### Key Technical Points (45 seconds)

> "Let me highlight what makes this possible:"

1. **Privy Embedded Wallets**
   > "No seed phrases. Users sign up with email or social login, and they get a secure wallet automatically."

2. **Movement Network**
   > "Sub-second finality means instant confirmation. No waiting for block confirmations."

3. **Low Fees**
   > "0.5% transaction fee versus 3% for credit cards. That's huge savings for merchants."

### Closing (30 seconds)

> "TapMove makes crypto payments as simple as Apple Pay - but with blockchain transparency and lower fees."

> "Built on Movement Network with Privy for the best user experience."

## Key Talking Points

### If Asked About Security
> "Privy provides bank-grade security for the embedded wallets. Users authenticate with biometrics for every transaction."

### If Asked About Scale
> "Movement Network handles thousands of transactions per second with sub-second finality."

### If Asked About Adoption
> "We're targeting merchants who want lower fees than credit cards, and crypto-native users who want easier payments."

### If Transaction Fails
> "Movement testnet can be unstable. In production, this would be on mainnet with higher reliability."

*[Have a backup video recording of successful flow]*

## Troubleshooting

### Backend Not Responding
```bash
# Check if running
curl http://localhost:3001/health

# Restart
cd backend && npm start
```

### Mobile App Crashes
- Clear app cache
- Restart Expo
- Use backup device

### NFC Not Working
- Ensure NFC is enabled in phone settings
- Skip NFC demo, use QR code only

### Transaction Stuck
- Check Movement explorer
- If testnet is down, show pre-recorded video
- Explain: "Testnet can be unstable, production would be more reliable"

## Post-Demo

- Offer to show code/architecture
- Mention open source / hackathon context
- Exchange contact info for follow-ups
