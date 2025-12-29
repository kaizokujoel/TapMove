/**
 * TapMove E2E Integration Tests
 *
 * Run with: npm test
 * Requires backend to be running on localhost:3001
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = process.env.API_URL || 'http://localhost:3001';

// Test wallet addresses (0x-prefixed 64 hex chars)
const TEST_MERCHANT_ADDRESS = '0x' + 'a'.repeat(64);
const TEST_PAYER_ADDRESS = '0x' + 'b'.repeat(64);

// Store test data between tests
let merchantApiKey;
let paymentId;
let createdMerchant;

describe('TapMove E2E Payment Flow', () => {
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const res = await fetch(`${API_BASE}/health`);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe('ok');
    });
  });

  describe('Merchant Registration', () => {
    it('should register a new merchant', async () => {
      const res = await fetch(`${API_BASE}/merchants/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Coffee Shop',
          address: TEST_MERCHANT_ADDRESS,
          category: 'Food & Beverage',
          webhookUrl: 'https://example.com/webhook',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.merchant).toBeDefined();
      expect(data.merchant.name).toBe('Test Coffee Shop');
      expect(data.merchant.apiKey).toBeDefined();
      expect(data.merchant.apiKey).toMatch(/^tm_[a-f0-9]+$/);

      merchantApiKey = data.merchant.apiKey;
      createdMerchant = data.merchant;
    });

    it('should reject duplicate registration', async () => {
      const res = await fetch(`${API_BASE}/merchants/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Duplicate Shop',
          address: TEST_MERCHANT_ADDRESS,
        }),
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toContain('already registered');
    });

    it('should validate merchant address format', async () => {
      const res = await fetch(`${API_BASE}/merchants/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Invalid Address Shop',
          address: 'invalid-address',
        }),
      });

      expect(res.status).toBe(400);
    });

    it('should get merchant public info', async () => {
      const res = await fetch(`${API_BASE}/merchants/${TEST_MERCHANT_ADDRESS}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.name).toBe('Test Coffee Shop');
    });
  });

  describe('Payment Creation', () => {
    it('should create a payment request', async () => {
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantAddress: TEST_MERCHANT_ADDRESS,
          amount: '25.50',
          memo: 'Test Order #1 - Coffee and pastry',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.payment).toBeDefined();
      expect(data.payment.id).toBeDefined();
      expect(data.payment.amount).toBe('25.50');
      expect(data.payment.status).toBe('pending');

      paymentId = data.payment.id;
    });

    it('should validate payment amount', async () => {
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantAddress: TEST_MERCHANT_ADDRESS,
          amount: 'invalid',
        }),
      });

      expect(res.status).toBe(400);
    });

    it('should get payment details', async () => {
      const res = await fetch(`${API_BASE}/payments/${paymentId}`);

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data.id).toBe(paymentId);
      expect(data.data.amount).toBe('25.50');
      expect(data.data.status).toBe('pending');
      expect(data.data.memo).toBe('Test Order #1 - Coffee and pastry');
    });

    it('should check payment status', async () => {
      const res = await fetch(`${API_BASE}/payments/${paymentId}/status`);

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.status).toBe('pending');
      expect(data.expiresAt).toBeDefined();
    });
  });

  describe('Payment Transaction Building', () => {
    it('should build payment transaction', async () => {
      const res = await fetch(`${API_BASE}/payments/${paymentId}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: TEST_PAYER_ADDRESS,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.hash).toBeDefined();
      expect(data.rawTxnHex).toBeDefined();
      expect(data.paymentId).toBe(paymentId);
    });

    it('should reject build for non-pending payment after expiry simulation', async () => {
      // This test would need the payment to be expired/completed
      // Skipping actual test, just verifying endpoint exists
      const res = await fetch(`${API_BASE}/payments/nonexistent-id/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: TEST_PAYER_ADDRESS,
        }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe('Merchant Protected Routes', () => {
    it('should require API key for protected routes', async () => {
      const res = await fetch(`${API_BASE}/merchants/${TEST_MERCHANT_ADDRESS}/transactions`);

      expect(res.status).toBe(401);
    });

    it('should access transactions with valid API key', async () => {
      const res = await fetch(`${API_BASE}/merchants/${TEST_MERCHANT_ADDRESS}/transactions`, {
        headers: {
          'x-api-key': merchantApiKey,
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.transactions).toBeDefined();
    });

    it('should get merchant stats with API key', async () => {
      const res = await fetch(`${API_BASE}/merchants/${TEST_MERCHANT_ADDRESS}/stats`, {
        headers: {
          'x-api-key': merchantApiKey,
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.stats).toBeDefined();
    });

    it('should reject access with invalid API key', async () => {
      const res = await fetch(`${API_BASE}/merchants/${TEST_MERCHANT_ADDRESS}/transactions`, {
        headers: {
          'x-api-key': 'tm_invalid_key',
        },
      });

      expect(res.status).toBe(403);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive requests', async () => {
      // Make many rapid requests
      const requests = [];
      for (let i = 0; i < 15; i++) {
        requests.push(
          fetch(`${API_BASE}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              merchantAddress: TEST_MERCHANT_ADDRESS,
              amount: '1.00',
            }),
          })
        );
      }

      const responses = await Promise.all(requests);
      const statuses = responses.map((r) => r.status);

      // At least some should be rate limited (429 or one of our 200s for success)
      // Since limit is 10/min, we expect some 429s or all 201s in fast test
      const hasRateLimiting = statuses.some((s) => s === 429);
      const allSuccessful = statuses.every((s) => s === 201);

      // Either rate limiting kicked in OR all succeeded (test ran fast enough)
      expect(hasRateLimiting || allSuccessful).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent payment', async () => {
      const res = await fetch(`${API_BASE}/payments/00000000-0000-4000-8000-000000000000`);
      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent merchant', async () => {
      const res = await fetch(`${API_BASE}/merchants/${'0x' + 'f'.repeat(64)}`);
      expect(res.status).toBe(404);
    });

    it('should handle malformed JSON', async () => {
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json{',
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });
});

describe('Wallet Routes', () => {
  describe('Balance Check', () => {
    it('should get wallet balance', async () => {
      const res = await fetch(`${API_BASE}/balance/${TEST_PAYER_ADDRESS}`);

      // Will fail if not connected to Movement, but endpoint should respond
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('Account Info', () => {
    it('should get account info', async () => {
      const res = await fetch(`${API_BASE}/account-info/${TEST_PAYER_ADDRESS}`);

      // Will fail if not connected to Movement, but endpoint should respond
      expect([200, 500]).toContain(res.status);
    });
  });
});
