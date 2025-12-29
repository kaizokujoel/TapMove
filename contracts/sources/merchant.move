/// TapMove Merchant Registry Module
/// Manages merchant profiles and verification status
module tapmove::merchant {
    use std::string::String;
    use std::signer;
    use aptos_framework::event;
    use aptos_framework::timestamp;

    /// Error codes
    const E_NOT_REGISTERED: u64 = 1;
    const E_ALREADY_REGISTERED: u64 = 2;
    const E_NOT_ADMIN: u64 = 3;

    /// Merchant profile stored under merchant's account
    struct Merchant has key {
        name: String,
        category: String,
        logo_url: String,
        webhook_url: String,
        total_volume: u64,
        total_transactions: u64,
        verified: bool
    }

    #[event]
    /// Event for merchant registration
    struct MerchantRegistered has drop, store {
        merchant: address,
        name: String,
        category: String,
        timestamp: u64
    }

    #[event]
    /// Event for merchant profile update
    struct MerchantUpdated has drop, store {
        merchant: address,
        name: String,
        timestamp: u64
    }

    /// Register as a merchant
    /// Creates a Merchant resource under the signer's account
    public entry fun register(
        account: &signer,
        name: String,
        category: String,
        logo_url: String,
        webhook_url: String
    ) {
        let addr = signer::address_of(account);

        // Ensure not already registered
        assert!(!exists<Merchant>(addr), E_ALREADY_REGISTERED);

        // Create merchant profile
        let merchant = Merchant {
            name: copy name,
            category: copy category,
            logo_url,
            webhook_url,
            total_volume: 0,
            total_transactions: 0,
            verified: false
        };

        // Store under merchant's account
        move_to(account, merchant);

        // Emit registration event
        event::emit(MerchantRegistered {
            merchant: addr,
            name,
            category,
            timestamp: timestamp::now_seconds()
        });
    }

    /// Update merchant profile
    /// Only the merchant can update their own profile
    public entry fun update_profile(
        account: &signer,
        name: String,
        category: String,
        logo_url: String,
        webhook_url: String
    ) acquires Merchant {
        let addr = signer::address_of(account);
        assert!(exists<Merchant>(addr), E_NOT_REGISTERED);

        let merchant = borrow_global_mut<Merchant>(addr);
        merchant.name = copy name;
        merchant.category = category;
        merchant.logo_url = logo_url;
        merchant.webhook_url = webhook_url;

        event::emit(MerchantUpdated {
            merchant: addr,
            name,
            timestamp: timestamp::now_seconds()
        });
    }

    #[view]
    /// Get merchant info
    /// Returns: (name, category, total_volume, total_transactions, verified)
    public fun get_merchant(addr: address): (String, String, u64, u64, bool) acquires Merchant {
        assert!(exists<Merchant>(addr), E_NOT_REGISTERED);
        let merchant = borrow_global<Merchant>(addr);
        (
            merchant.name,
            merchant.category,
            merchant.total_volume,
            merchant.total_transactions,
            merchant.verified
        )
    }

    #[view]
    /// Check if address is registered merchant
    public fun is_merchant(addr: address): bool {
        exists<Merchant>(addr)
    }

    /// Internal function to update merchant stats after payment
    /// Called by payment module
    public(friend) fun record_payment(merchant_addr: address, amount: u64) acquires Merchant {
        if (exists<Merchant>(merchant_addr)) {
            let merchant = borrow_global_mut<Merchant>(merchant_addr);
            merchant.total_volume = merchant.total_volume + amount;
            merchant.total_transactions = merchant.total_transactions + 1;
        }
    }
}
