---
description: Deploy Move contracts to Movement network
argument: <network: testnet|mainnet>
---

# Deploy Contracts

Deploys TapMove Move contracts to Movement network.

## Prerequisites

1. Load the `move-contracts` skill
2. Ensure `.env` has required keys:
   ```
   MOVEMENT_PRIVATE_KEY=0x...
   MOVEMENT_TESTNET_RPC=https://...
   MOVEMENT_MAINNET_RPC=https://...
   ```
3. Ensure all tests pass: `aptos move test`

## Deployment Steps

### 1. Compile Contracts

```bash
cd contracts
aptos move compile
```

### 2. Run Tests

```bash
aptos move test -vvv
```

**HALT if any tests fail.**

### 3. Deploy to Network

```bash
# Testnet
aptos move publish \
  --profile movement-testnet \
  --named-addresses TapMove=default

# Mainnet (requires explicit confirmation)
aptos move publish \
  --profile movement-mainnet \
  --named-addresses TapMove=default
```

### 4. Update deployment.config.json

After successful deployment, update `contracts/deployment.config.json`:

```json
{
  "network": "movement-testnet",
  "addresses": {
    "payment": "0x...",
    "merchant": "0x..."
  },
  "deployedAt": "2024-01-15T10:30:00Z",
  "deployer": "0x..."
}
```

### 5. Sync to Frontend Apps

Copy addresses to:
- `mobile/constants/addresses.ts`
- `merchant/constants/addresses.ts`
- `backend/.env`

## Verification

After deployment, verify contracts are accessible:

```bash
# Check payment module
aptos move view \
  --function-id 'DEPLOYED_ADDR::payment::get_fee_rate'

# Check merchant module
aptos move view \
  --function-id 'DEPLOYED_ADDR::merchant::is_registered' \
  --args 'address:0x...'
```

## Rollback

Move contracts are immutable. If issues found:

1. Deploy new version with fix
2. Update all configs to new address
3. Migrate any on-chain state if needed

## Success Checklist

- [ ] All tests pass locally
- [ ] Deployment transaction succeeded
- [ ] deployment.config.json updated
- [ ] Mobile app addresses updated
- [ ] Merchant terminal addresses updated
- [ ] Backend .env updated
- [ ] Verification queries work
