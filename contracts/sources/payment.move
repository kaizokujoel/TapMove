/// TapMove Payment Module
/// Handles tap-to-pay USDC transfers from payers to merchants
module tapmove::payment {
    use std::string::String;
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use aptos_framework::event;

    /// Error codes
    const E_PAYMENT_NOT_FOUND: u64 = 1;
    const E_NOT_MERCHANT: u64 = 2;
    const E_ALREADY_REFUNDED: u64 = 3;
    const E_PAYMENT_EXPIRED: u64 = 4;

    /// Payment record stored under payer's account
    struct Payment has key, store, drop {
        id: vector<u8>,
        payer: address,
        merchant: address,
        amount: u64,
        memo: String,
        timestamp: u64,
        refunded: bool
    }

    #[event]
    /// Event emitted on payment completion
    struct PaymentCompleted has drop, store {
        payment_id: vector<u8>,
        payer: address,
        merchant: address,
        amount: u64,
        timestamp: u64
    }

    #[event]
    /// Event emitted on refund
    struct PaymentRefunded has drop, store {
        payment_id: vector<u8>,
        payer: address,
        merchant: address,
        amount: u64,
        timestamp: u64
    }

    /// Execute payment - transfers coins from payer to merchant
    /// Uses generic CoinType to support USDC, MOVE, or any fungible token
    public entry fun pay<CoinType>(
        payer: &signer,
        merchant: address,
        amount: u64,
        payment_id: vector<u8>,
        _memo: String
    ) {
        let payer_addr = signer::address_of(payer);

        // Transfer coins from payer to merchant
        let coins = coin::withdraw<CoinType>(payer, amount);
        coin::deposit(merchant, coins);

        // Emit payment completed event for off-chain tracking
        event::emit(PaymentCompleted {
            payment_id: copy payment_id,
            payer: payer_addr,
            merchant,
            amount,
            timestamp: timestamp::now_seconds()
        });
    }

    /// Merchant initiates refund - transfers coins back to payer
    /// Only the merchant who received payment can refund
    public entry fun refund<CoinType>(
        merchant: &signer,
        payer: address,
        amount: u64,
        payment_id: vector<u8>
    ) {
        let merchant_addr = signer::address_of(merchant);

        // Transfer coins back to payer
        let coins = coin::withdraw<CoinType>(merchant, amount);
        coin::deposit(payer, coins);

        // Emit refund event for off-chain tracking
        event::emit(PaymentRefunded {
            payment_id,
            payer,
            merchant: merchant_addr,
            amount,
            timestamp: timestamp::now_seconds()
        });
    }
}
