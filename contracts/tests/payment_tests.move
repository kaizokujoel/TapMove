// TapMove Payment Tests
// Tests for payment and merchant modules
#[test_only]
module tapmove::payment_tests {
    use std::string;
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use tapmove::merchant;

    // Initialize framework for tests
    fun setup_test(aptos_framework: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
    }

    #[test(aptos_framework = @0x1, merchant_account = @0x123)]
    // Test merchant registration
    fun test_merchant_registration(aptos_framework: &signer, merchant_account: &signer) {
        setup_test(aptos_framework);

        // Setup account
        let addr = signer::address_of(merchant_account);
        account::create_account_for_test(addr);

        // Register as merchant
        merchant::register(
            merchant_account,
            string::utf8(b"Test Coffee Shop"),
            string::utf8(b"Food & Beverage"),
            string::utf8(b"https://example.com/logo.png"),
            string::utf8(b"https://example.com/webhook")
        );

        // Verify registration
        assert!(merchant::is_merchant(addr), 0);
    }

    #[test(aptos_framework = @0x1, merchant_account = @0x123)]
    // Test merchant profile update
    fun test_merchant_update(aptos_framework: &signer, merchant_account: &signer) {
        setup_test(aptos_framework);

        // Setup and register
        let addr = signer::address_of(merchant_account);
        account::create_account_for_test(addr);

        merchant::register(
            merchant_account,
            string::utf8(b"Old Name"),
            string::utf8(b"Category"),
            string::utf8(b"https://old.com/logo.png"),
            string::utf8(b"https://old.com/webhook")
        );

        // Update profile
        merchant::update_profile(
            merchant_account,
            string::utf8(b"New Name"),
            string::utf8(b"New Category"),
            string::utf8(b"https://new.com/logo.png"),
            string::utf8(b"https://new.com/webhook")
        );

        // Verify update
        let (name, category, _, _, _) = merchant::get_merchant(addr);
        assert!(name == string::utf8(b"New Name"), 1);
        assert!(category == string::utf8(b"New Category"), 2);
    }

    #[test(aptos_framework = @0x1, merchant_account = @0x123)]
    #[expected_failure(abort_code = 2, location = tapmove::merchant)]
    // Test double registration fails
    fun test_double_registration_fails(aptos_framework: &signer, merchant_account: &signer) {
        setup_test(aptos_framework);

        let addr = signer::address_of(merchant_account);
        account::create_account_for_test(addr);

        // First registration
        merchant::register(
            merchant_account,
            string::utf8(b"Shop 1"),
            string::utf8(b"Category"),
            string::utf8(b""),
            string::utf8(b"")
        );

        // Second registration should fail
        merchant::register(
            merchant_account,
            string::utf8(b"Shop 2"),
            string::utf8(b"Category"),
            string::utf8(b""),
            string::utf8(b"")
        );
    }

    #[test]
    // Test non-merchant check
    fun test_is_not_merchant() {
        assert!(!merchant::is_merchant(@0x999), 0);
    }

    #[test]
    #[expected_failure(abort_code = 1, location = tapmove::merchant)]
    // Test get merchant on non-registered address fails
    fun test_get_unregistered_merchant_fails() {
        merchant::get_merchant(@0x999);
    }
}
