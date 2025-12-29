import { Router } from 'express';
import { asyncHandler, isValidAddress, parseAmount } from '../lib/utils.js';
import {
  createPayment,
  getPayment,
  getPaymentStatus,
  processPayment,
} from '../services/payment.js';
import { buildPaymentTransaction } from '../services/movement.js';

const router = Router();

/**
 * POST /payments - Create a new payment request
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { merchantAddress, amount, memo } = req.body;

    if (!merchantAddress || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: merchantAddress, amount',
      });
    }

    if (!isValidAddress(merchantAddress)) {
      return res.status(400).json({
        error: 'Invalid merchant address format',
      });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        error: 'Amount must be a positive number',
      });
    }

    const payment = await createPayment(merchantAddress, amount, memo, {
      baseUrl: process.env.BASE_URL,
    });

    res.status(201).json(payment);
  })
);

/**
 * GET /payments/:id - Get payment details
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const payment = getPayment(id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ success: true, data: payment });
  })
);

/**
 * POST /payments/:id/build - Build payment transaction for signing
 */
router.post(
  '/:id/build',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { sender } = req.body;

    if (!sender) {
      return res.status(400).json({ error: 'Missing required field: sender' });
    }

    const payment = getPayment(id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        error: `Payment is not pending. Current status: ${payment.status}`
      });
    }

    // Convert amount to raw units (assuming 8 decimals for AptosCoin)
    const amountRaw = parseAmount(payment.amount);

    const txnData = await buildPaymentTransaction(
      sender,
      payment.merchantAddress,
      amountRaw,
      id,
      payment.memo
    );

    res.json({
      hash: txnData.hash,
      rawTxnHex: txnData.rawTxnHex,
      paymentId: id,
    });
  })
);

/**
 * POST /payments/:id/submit - Submit signed transaction for payment
 */
router.post(
  '/:id/submit',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rawTxnHex, publicKey, signature, senderAddress } = req.body;

    if (!rawTxnHex || !publicKey || !signature) {
      return res.status(400).json({
        error: 'Missing required fields: rawTxnHex, publicKey, signature',
      });
    }

    const result = await processPayment(
      id,
      rawTxnHex,
      publicKey,
      signature,
      senderAddress
    );

    res.json(result);
  })
);

/**
 * GET /payments/:id/status - Check payment status
 */
router.get(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const status = await getPaymentStatus(id);

    if (!status) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(status);
  })
);

export default router;
