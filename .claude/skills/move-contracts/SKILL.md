---
name: move-contracts
description: Writing Move modules, testing, and deployment on Movement Network. Use for smart contract development. (project)
---

# Move Contracts Skill

## Step 1: Check Known Issues (MANDATORY)

1. **Check `docs/issues/move/README.md`** for known pitfalls
2. **Use Context7 for documentation** - verify Move syntax and patterns before coding

## Movement Network Context

Movement is an Aptos-based L2 with fast finality. Move is the smart contract language.

### Key Differences from Solidity

| Aspect | Solidity | Move |
|--------|----------|------|
| Resources | Mappings | Structs stored under accounts |
| Ownership | Implicit | Explicit resource ownership |
| Reentrancy | Major concern | Prevented by design |
| Generics | Limited | First-class support |
| Testing | Foundry/Hardhat | Aptos CLI |

## Project Structure

```
contracts/
├── Move.toml           # Package manifest
├── sources/
│   ├── payment.move    # Payment logic
│   └── merchant.move   # Merchant registry
├── tests/
│   └── payment_tests.move
└── deployment.config.json
```

## Move Patterns

### Module Declaration
```move
module tapmove::payment {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::event;

    // Error codes as constants
    const E_NOT_FOUND: u64 = 1;

    // Structs with abilities
    struct Payment has key, store, drop {
        id: vector<u8>,
        amount: u64
    }

    // Entry functions (callable from outside)
    public entry fun pay(payer: &signer, amount: u64) { }

    // View functions (read-only)
    #[view]
    public fun get_balance(addr: address): u64 { }
}
```

### Resource Management
```move
// Store under account
move_to(account, Resource { ... });

// Borrow mutable
let resource = borrow_global_mut<Resource>(addr);

// Check existence
exists<Resource>(addr)
```

### Events
```move
#[event]
public entry fun do_something() {
    event::emit(MyEvent { ... });
}
```

### Generics for Coins
```move
public entry fun transfer<CoinType>(
    from: &signer,
    to: address,
    amount: u64
) {
    let coins = coin::withdraw<CoinType>(from, amount);
    coin::deposit(to, coins);
}
```

## CLI Commands

```bash
# Compile
aptos move compile

# Test
aptos move test

# Publish (requires profile)
aptos move publish --profile movement-testnet

# Initialize profile
aptos init --profile movement-testnet --network custom --rest-url https://aptos.testnet.porto.movementlabs.xyz/v1

# Call function
aptos move run \
  --function-id 'ADDR::module::function' \
  --args TYPE:VALUE \
  --profile movement-testnet
```

## Testing

```move
#[test_only]
module tapmove::payment_tests {
    use tapmove::payment;

    #[test(account = @0x1)]
    fun test_payment(account: &signer) {
        // Setup
        // Execute
        // Assert
    }

    #[test(account = @0x1)]
    #[expected_failure(abort_code = E_NOT_FOUND)]
    fun test_failure_case(account: &signer) {
        // Should abort
    }
}
```

## File Size Limits

- Each Move module: max 300 lines
- Split large modules into separate files
- Use helper modules for shared logic

## Security Checklist

- [ ] All abort codes documented
- [ ] Access control on sensitive functions
- [ ] No integer overflow (checked math)
- [ ] Resource cleanup (no orphaned resources)
- [ ] Event emission for off-chain tracking
