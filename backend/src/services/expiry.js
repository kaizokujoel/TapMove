/**
 * Payment expiry and cleanup service
 * Runs periodic checks for expired payments and notifies merchants
 */

import { db } from '../lib/db.js';
import { PaymentStatus } from '../lib/utils.js';

const EXPIRY_CHECK_INTERVAL = 30000; // 30 seconds
const CLEANUP_AGE_DAYS = 7;

let expiryIntervalId = null;
let cleanupIntervalId = null;

/**
 * Check for expired payments and update their status
 */
export async function checkExpiredPayments() {
  try {
    const expiredPayments = db.payments.getExpired();

    if (expiredPayments.length === 0) {
      return { processed: 0 };
    }

    console.log(`Found ${expiredPayments.length} expired payments`);

    const expiredIds = expiredPayments.map((p) => p.id);
    db.payments.batchUpdateStatus(expiredIds, PaymentStatus.EXPIRED);

    // Notify merchants of expired payments
    for (const payment of expiredPayments) {
      await notifyPaymentExpired(payment);
    }

    return { processed: expiredPayments.length };
  } catch (error) {
    console.error('Error checking expired payments:', error);
    return { processed: 0, error: error.message };
  }
}

/**
 * Notify merchant that a payment has expired
 */
async function notifyPaymentExpired(payment) {
  const merchant = db.merchants.get(payment.merchantAddress);

  if (!merchant || !merchant.webhookUrl) {
    return { sent: false, reason: 'no_webhook' };
  }

  const payload = {
    event: 'payment.expired',
    timestamp: new Date().toISOString(),
    payment: {
      id: payment.id,
      amount: payment.amount,
      expiredAt: Date.now(),
      createdAt: payment.createdAt,
    },
    merchant: {
      address: merchant.address,
      name: merchant.name,
    },
  };

  try {
    const response = await fetch(merchant.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TapMove-Event': 'payment.expired',
        'X-TapMove-Timestamp': payload.timestamp,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Expiry webhook failed for ${payment.id}: ${response.status}`);
      return { sent: false, reason: 'delivery_failed', status: response.status };
    }

    console.log(`Expiry notification sent for payment ${payment.id}`);
    return { sent: true };
  } catch (error) {
    console.error(`Expiry webhook error for ${payment.id}:`, error.message);
    return { sent: false, reason: 'network_error', error: error.message };
  }
}

/**
 * Clean up old payments (archive/remove from active queries)
 * For MVP, we just log them - in production you might archive to cold storage
 */
export async function cleanupOldPayments() {
  try {
    const oldPayments = db.payments.getOldPayments(CLEANUP_AGE_DAYS);

    if (oldPayments.length === 0) {
      return { cleaned: 0 };
    }

    console.log(`Found ${oldPayments.length} old payments for potential cleanup`);

    // For MVP, just log - don't actually delete
    // In production, you might archive these to a separate table or cold storage
    return { cleaned: 0, candidates: oldPayments.length };
  } catch (error) {
    console.error('Error cleaning up old payments:', error);
    return { cleaned: 0, error: error.message };
  }
}

/**
 * Start the expiry checker interval
 */
export function startExpiryChecker() {
  if (expiryIntervalId) {
    console.log('Expiry checker already running');
    return;
  }

  console.log(`Starting expiry checker (interval: ${EXPIRY_CHECK_INTERVAL}ms)`);

  // Run immediately on startup
  checkExpiredPayments();

  // Then run on interval
  expiryIntervalId = setInterval(checkExpiredPayments, EXPIRY_CHECK_INTERVAL);

  // Run cleanup once per hour
  cleanupIntervalId = setInterval(cleanupOldPayments, 60 * 60 * 1000);
}

/**
 * Stop the expiry checker interval
 */
export function stopExpiryChecker() {
  if (expiryIntervalId) {
    clearInterval(expiryIntervalId);
    expiryIntervalId = null;
    console.log('Expiry checker stopped');
  }

  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
    console.log('Cleanup checker stopped');
  }
}

/**
 * Get expiry checker status
 */
export function getExpiryCheckerStatus() {
  return {
    running: expiryIntervalId !== null,
    intervalMs: EXPIRY_CHECK_INTERVAL,
    cleanupAgeDays: CLEANUP_AGE_DAYS,
  };
}
