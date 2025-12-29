import crypto from 'crypto';

/**
 * Generate a short, URL-safe payment ID
 * Format: pay_<random alphanumeric>
 */
export function generatePaymentId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'pay_';
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

/**
 * Calculate expiry timestamp (default 15 minutes from now)
 */
export function calculateExpiry(minutes = 15) {
  return Date.now() + minutes * 60 * 1000;
}

/**
 * Check if a payment has expired
 */
export function isExpired(expiresAt) {
  return Date.now() > expiresAt;
}

/**
 * Generate QR data for payment
 */
export function generateQrData(paymentId, baseUrl = '') {
  const uri = `tapmove://pay?id=${paymentId}`;
  return {
    uri,
    deepLink: uri,
    webUrl: baseUrl ? `${baseUrl}/pay/${paymentId}` : null,
  };
}

/**
 * Validate Movement address format
 */
export function isValidAddress(address) {
  if (!address) return false;
  // Movement/Aptos addresses are 64 hex chars (with or without 0x prefix)
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  return /^[0-9a-fA-F]{64}$/.test(cleanAddress);
}

/**
 * Normalize address to lowercase with 0x prefix
 */
export function normalizeAddress(address) {
  if (!address) return null;
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  return `0x${cleanAddress.toLowerCase()}`;
}

/**
 * Parse amount string to bigint (assumes 6 decimals for USDC)
 */
export function parseAmount(amountStr, decimals = 6) {
  const [whole, fraction = ''] = amountStr.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

/**
 * Format bigint amount to string (assumes 6 decimals for USDC)
 */
export function formatAmount(amountBigInt, decimals = 6) {
  const str = amountBigInt.toString().padStart(decimals + 1, '0');
  const whole = str.slice(0, -decimals) || '0';
  const fraction = str.slice(-decimals).replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole;
}

/**
 * Payment status enum
 */
export const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUBMITTED: 'submitted',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  EXPIRED: 'expired',
  REFUNDED: 'refunded',
};

/**
 * Create async handler wrapper for Express routes
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
