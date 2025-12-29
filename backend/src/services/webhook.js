import { db } from '../lib/db.js';

/**
 * Notify merchant when payment is confirmed
 */
export async function notifyMerchant(merchantAddress, payment) {
  const merchant = db.merchants.get(merchantAddress);

  if (!merchant || !merchant.webhookUrl) {
    console.log(`No webhook configured for merchant ${merchantAddress}`);
    return { sent: false, reason: 'no_webhook' };
  }

  const payload = {
    event: 'payment.completed',
    timestamp: new Date().toISOString(),
    payment: {
      id: payment.id,
      amount: payment.amount,
      txHash: payment.txHash,
      senderAddress: payment.senderAddress,
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
        'X-TapMove-Event': 'payment.completed',
        'X-TapMove-Timestamp': payload.timestamp,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        `Webhook delivery failed for ${merchantAddress}: ${response.status}`
      );
      return {
        sent: false,
        reason: 'delivery_failed',
        status: response.status,
      };
    }

    console.log(`Webhook delivered to ${merchant.webhookUrl}`);
    return { sent: true };
  } catch (error) {
    console.error(`Webhook delivery error for ${merchantAddress}:`, error.message);
    return { sent: false, reason: 'network_error', error: error.message };
  }
}

/**
 * Notify merchant of payment status change
 */
export async function notifyPaymentStatus(merchantAddress, paymentId, status) {
  const merchant = db.merchants.get(merchantAddress);

  if (!merchant || !merchant.webhookUrl) {
    return { sent: false, reason: 'no_webhook' };
  }

  const payload = {
    event: 'payment.status_changed',
    timestamp: new Date().toISOString(),
    paymentId,
    status,
  };

  try {
    const response = await fetch(merchant.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TapMove-Event': 'payment.status_changed',
      },
      body: JSON.stringify(payload),
    });

    return { sent: response.ok, status: response.status };
  } catch (error) {
    return { sent: false, reason: 'network_error', error: error.message };
  }
}
