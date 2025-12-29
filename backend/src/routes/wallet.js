import { Router } from 'express';
import { asyncHandler } from '../lib/utils.js';
import {
  buildTransaction,
  submitTransaction,
  getMoveBalance,
  getAccountInfo,
  callViewFunction,
  requestFaucet,
} from '../services/movement.js';
import { validateGenerateHash, validateTransactionSubmit, validateAddress, validate } from '../middleware/validate.js';
import { transactionLimiter, faucetLimiter } from '../middleware/rate-limit.js';

const router = Router();

/**
 * POST /generate-hash - Generate signing hash for a transaction
 */
router.post(
  '/generate-hash',
  transactionLimiter,
  validateGenerateHash,
  validate,
  asyncHandler(async (req, res) => {
    const { sender, function: func, typeArguments, functionArguments } = req.body;

    const result = await buildTransaction(
      sender,
      func,
      typeArguments || [],
      functionArguments || []
    );

    res.json({
      success: true,
      hash: result.hash,
      rawTxnHex: result.rawTxnHex,
    });
  })
);

/**
 * POST /submit-transaction - Submit a signed transaction
 */
router.post(
  '/submit-transaction',
  transactionLimiter,
  validateTransactionSubmit,
  validate,
  asyncHandler(async (req, res) => {
    const { rawTxnHex, publicKey, signature } = req.body;

    const result = await submitTransaction(rawTxnHex, publicKey, signature);

    res.json({
      success: result.success,
      transactionHash: result.hash,
      vmStatus: result.vmStatus,
    });
  })
);

/**
 * POST /faucet - Request faucet tokens
 * Rate limited more strictly
 */
router.post(
  '/faucet',
  faucetLimiter,
  asyncHandler(async (req, res) => {
    const { address, amount } = req.body;

    if (!address || !amount) {
      return res.status(400).json({ success: false, error: 'Missing address or amount' });
    }

    const data = await requestFaucet(address, amount);
    res.json({ success: true, data });
  })
);

/**
 * GET /balance/:address - Get MOVE balance
 */
router.get(
  '/balance/:address',
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const balance = await getMoveBalance(address);
    res.json({ balance });
  })
);

/**
 * GET /account-info/:address - Get account info
 */
router.get(
  '/account-info/:address',
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const info = await getAccountInfo(address);
    res.json(info);
  })
);

/**
 * POST /view - Call a view function (read-only)
 */
router.post(
  '/view',
  asyncHandler(async (req, res) => {
    const { function: func, typeArguments, functionArguments } = req.body;

    if (!func) {
      return res.status(400).json({ error: 'Missing required field: function' });
    }

    const result = await callViewFunction(func, typeArguments, functionArguments);
    res.json({ success: true, result });
  })
);

export default router;
