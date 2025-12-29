#!/usr/bin/env node

/**
 * Seed Test Data Script
 *
 * Creates test merchants and payments for demo/testing purposes.
 * Run with: node scripts/seed-test-data.js
 */

import { db } from '../src/lib/db.js';
import { registerMerchant } from '../src/services/merchant.js';
import { createPayment } from '../src/services/payment.js';

// Test merchant configurations
const testMerchants = [
  {
    name: 'Demo Coffee Shop',
    address: '0x' + 'a'.repeat(64),
    category: 'Food & Beverage',
    webhookUrl: null,
  },
  {
    name: 'Tech Gadgets Store',
    address: '0x' + 'b'.repeat(64),
    category: 'Retail',
    webhookUrl: null,
  },
  {
    name: 'Quick Gas Station',
    address: '0x' + 'c'.repeat(64),
    category: 'Services',
    webhookUrl: null,
  },
];

// Sample payments to create
const samplePayments = [
  { amount: '4.50', memo: 'Latte and croissant' },
  { amount: '25.00', memo: 'Lunch special' },
  { amount: '12.99', memo: 'USB-C Cable' },
];

async function seedDatabase() {
  console.log('Seeding TapMove test database...\n');

  const createdMerchants = [];

  // Create merchants
  console.log('Creating test merchants:');
  for (const merchantData of testMerchants) {
    try {
      const existing = db.merchants.get(merchantData.address);
      if (existing) {
        console.log(`  ✓ ${merchantData.name} (already exists)`);
        createdMerchants.push(existing);
      } else {
        const merchant = await registerMerchant(merchantData);
        console.log(`  ✓ ${merchantData.name}`);
        console.log(`    Address: ${merchant.address}`);
        console.log(`    API Key: ${merchant.apiKey}`);
        createdMerchants.push(merchant);
      }
    } catch (error) {
      console.error(`  ✗ Failed to create ${merchantData.name}:`, error.message);
    }
  }

  // Create sample payments for first merchant
  if (createdMerchants.length > 0) {
    const primaryMerchant = createdMerchants[0];
    console.log(`\nCreating sample payments for ${primaryMerchant.name}:`);

    for (const paymentData of samplePayments) {
      try {
        const payment = await createPayment(
          primaryMerchant.address,
          paymentData.amount,
          paymentData.memo,
          { expiresIn: 3600 } // 1 hour expiry for test data
        );
        console.log(`  ✓ $${paymentData.amount} - ${paymentData.memo}`);
        console.log(`    Payment ID: ${payment.id}`);
      } catch (error) {
        console.error(`  ✗ Failed to create payment:`, error.message);
      }
    }
  }

  console.log('\n✅ Test data seeding complete!\n');

  // Summary
  console.log('Summary:');
  console.log(`  Merchants: ${createdMerchants.length}`);
  console.log(`  Payments: ${samplePayments.length}`);

  console.log('\nTest credentials saved above. Use them for testing.');
}

// Run if executed directly
seedDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
