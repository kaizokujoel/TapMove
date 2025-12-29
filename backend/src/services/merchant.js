// Merchant service - handles merchant registration and API key management
import crypto from 'crypto';
import { db } from '../lib/db.js';

/**
 * Generate a new API key for a merchant
 * Format: tm_{48 random hex chars}
 * Returns the plain key (show once to user) and hash (store in DB)
 */
export function generateApiKey() {
  const plainKey = `tm_${crypto.randomBytes(24).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(plainKey).digest('hex');

  return { plainKey, hash };
}

/**
 * Register a new merchant
 * Returns the merchant with API key (key is only returned once!)
 */
export async function registerMerchant(data) {
  const { name, address, category, webhookUrl, logoUrl } = data;

  // Check if merchant already exists
  const existing = db.merchants.get(address);
  if (existing) {
    throw new Error('Merchant already registered');
  }

  // Generate API key
  const { plainKey, hash } = generateApiKey();

  // Create merchant in database
  const merchant = db.merchants.create({
    name,
    address,
    category,
    webhookUrl,
    logoUrl,
    apiKeyHash: hash,
  });

  // Return merchant with plain API key (shown once)
  return {
    ...merchant,
    apiKey: plainKey,
    apiKeyHash: undefined, // Don't expose the hash
  };
}

/**
 * Get merchant by address (public info only)
 */
export function getMerchant(address) {
  const merchant = db.merchants.get(address);
  if (!merchant) return null;

  // Return without sensitive data
  return {
    address: merchant.address,
    name: merchant.name,
    category: merchant.category,
    logoUrl: merchant.logoUrl,
    verified: merchant.verified,
    totalVolume: merchant.totalVolume,
    totalTransactions: merchant.totalTransactions,
    createdAt: merchant.createdAt,
  };
}

/**
 * Update merchant info
 * Requires the merchant object from auth middleware
 */
export async function updateMerchant(address, data, authenticatedMerchant) {
  // Verify the requester owns this merchant account
  if (authenticatedMerchant.address.toLowerCase() !== address.toLowerCase()) {
    throw new Error('Unauthorized');
  }

  const { name, category, webhookUrl, logoUrl } = data;

  return db.merchants.update(address, {
    name,
    category,
    webhookUrl,
    logoUrl,
  });
}

/**
 * Regenerate API key for a merchant
 * Invalidates the old key
 */
export async function regenerateApiKey(address, authenticatedMerchant) {
  // Verify the requester owns this merchant account
  if (authenticatedMerchant.address.toLowerCase() !== address.toLowerCase()) {
    throw new Error('Unauthorized');
  }

  // Generate new API key
  const { plainKey, hash } = generateApiKey();

  // Update in database (this invalidates the old key)
  await db.raw.prepare('UPDATE merchants SET api_key_hash = ?, updated_at = ? WHERE address = ?')
    .run(hash, Date.now(), address.toLowerCase());

  return { apiKey: plainKey };
}

/**
 * Get merchant statistics
 */
export function getMerchantStats(address) {
  const merchant = db.merchants.get(address);
  if (!merchant) return null;

  // Get payment counts by status
  const paymentsResult = db.payments.findByMerchant(address, 1000, 0);
  const payments = paymentsResult.items;

  const pending = payments.filter((p) => p.status === 'pending').length;
  const completed = payments.filter((p) => p.status === 'confirmed').length;
  const failed = payments.filter((p) => p.status === 'failed').length;
  const expired = payments.filter((p) => p.status === 'expired').length;

  return {
    totalPayments: paymentsResult.total,
    pending,
    completed,
    failed,
    expired,
    totalVolume: merchant.totalVolume || '0',
    totalTransactions: merchant.totalTransactions || 0,
  };
}

/**
 * List all merchants (admin only in production)
 */
export function listMerchants() {
  const merchants = db.merchants.list();
  // Return public info only
  return merchants.map((m) => ({
    address: m.address,
    name: m.name,
    category: m.category,
    verified: m.verified,
    createdAt: m.createdAt,
  }));
}
