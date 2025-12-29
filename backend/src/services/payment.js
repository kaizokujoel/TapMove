import { db } from '../lib/db.js';
import {
  generatePaymentId,
  calculateExpiry,
  isExpired,
  generateQrData,
  PaymentStatus,
  parseAmount,
} from '../lib/utils.js';
import { submitTransaction, getTransactionStatus } from './movement.js';
import { notifyMerchant } from './webhook.js';

/**
 * Create a new payment request
 */
export async function createPayment(merchantAddress, amount, memo, options = {}) {
  const id = generatePaymentId();
  const expiresAt = calculateExpiry(options.expiryMinutes || 15);
  const qrData = generateQrData(id, options.baseUrl);

  const payment = db.payments.create({
    id,
    merchantAddress,
    amount,
    amountRaw: parseAmount(amount).toString(),
    memo: memo || '',
    status: PaymentStatus.PENDING,
    expiresAt,
    paymentUri: qrData.uri,
    txHash: null,
    senderAddress: null,
  });

  return {
    id: payment.id,
    paymentUri: payment.paymentUri,
    qrData,
    expiresAt,
    status: payment.status,
  };
}

/**
 * Get payment by ID
 */
export function getPayment(id) {
  const payment = db.payments.get(id);
  if (!payment) return null;

  // Check if expired
  if (payment.status === PaymentStatus.PENDING && isExpired(payment.expiresAt)) {
    db.payments.update(id, { status: PaymentStatus.EXPIRED });
    payment.status = PaymentStatus.EXPIRED;
  }

  return payment;
}

/**
 * Get payment status
 */
export async function getPaymentStatus(id) {
  const payment = getPayment(id);
  if (!payment) return null;

  // If submitted, check on-chain status
  if (payment.status === PaymentStatus.SUBMITTED && payment.txHash) {
    const txStatus = await getTransactionStatus(payment.txHash);
    if (txStatus.exists && txStatus.success) {
      await updatePaymentStatus(id, PaymentStatus.CONFIRMED, payment.txHash);
      payment.status = PaymentStatus.CONFIRMED;
      payment.confirmedAt = txStatus.timestamp;
    } else if (txStatus.exists && !txStatus.success) {
      await updatePaymentStatus(id, PaymentStatus.FAILED, payment.txHash);
      payment.status = PaymentStatus.FAILED;
    }
  }

  return {
    status: payment.status,
    txHash: payment.txHash,
    confirmedAt: payment.confirmedAt,
  };
}

/**
 * Process a payment submission
 */
export async function processPayment(id, rawTxnHex, publicKey, signature, senderAddress) {
  const payment = getPayment(id);

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status !== PaymentStatus.PENDING) {
    throw new Error(`Payment is not pending. Current status: ${payment.status}`);
  }

  if (isExpired(payment.expiresAt)) {
    db.payments.update(id, { status: PaymentStatus.EXPIRED });
    throw new Error('Payment has expired');
  }

  // Update status to submitted
  db.payments.update(id, {
    status: PaymentStatus.SUBMITTED,
    senderAddress,
  });

  try {
    // Submit transaction to Movement
    const result = await submitTransaction(rawTxnHex, publicKey, signature);

    if (result.success) {
      await updatePaymentStatus(id, PaymentStatus.CONFIRMED, result.hash);

      // Record transaction
      db.transactions.create({
        hash: result.hash,
        paymentId: id,
        merchantAddress: payment.merchantAddress,
        senderAddress,
        amount: payment.amount,
        memo: payment.memo,
        vmStatus: result.vmStatus,
      });

      // Notify merchant via webhook
      await notifyMerchant(payment.merchantAddress, {
        id,
        amount: payment.amount,
        txHash: result.hash,
        senderAddress,
      });

      return {
        success: true,
        txHash: result.hash,
        status: PaymentStatus.CONFIRMED,
      };
    } else {
      await updatePaymentStatus(id, PaymentStatus.FAILED, result.hash);
      return {
        success: false,
        txHash: result.hash,
        status: PaymentStatus.FAILED,
        vmStatus: result.vmStatus,
      };
    }
  } catch (error) {
    await updatePaymentStatus(id, PaymentStatus.FAILED);
    throw error;
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(id, status, txHash = null) {
  const updateData = { status };
  if (txHash) updateData.txHash = txHash;
  if (status === PaymentStatus.CONFIRMED) {
    updateData.confirmedAt = new Date().toISOString();
  }

  return db.payments.update(id, updateData);
}

/**
 * Get payments for a merchant
 */
export function getMerchantPayments(merchantAddress, limit = 20, offset = 0) {
  return db.payments.findByMerchant(merchantAddress, limit, offset);
}
