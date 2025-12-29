import { Router } from 'express';
import { db } from '../lib/db.js';
import { asyncHandler, isValidAddress, normalizeAddress } from '../lib/utils.js';
import { merchantAuth, optionalMerchantAuth } from '../middleware/auth.js';
import { validateMerchantRegister, validateAddress, validate } from '../middleware/validate.js';
import { paymentLimiter } from '../middleware/rate-limit.js';
import { registerMerchant, getMerchantStats, regenerateApiKey } from '../services/merchant.js';

const router = Router();

/**
 * POST /merchants/register - Register a new merchant
 * Public - no auth required, returns API key on success
 */
router.post(
  '/register',
  paymentLimiter,
  validateMerchantRegister,
  validate,
  asyncHandler(async (req, res) => {
    const { address, name, category, logoUrl, webhookUrl } = req.body;

    try {
      const result = await registerMerchant({
        address: normalizeAddress(address),
        name,
        category: category || 'general',
        logoUrl,
        webhookUrl,
      });

      res.status(201).json({
        success: true,
        merchant: result,
        message: 'Save your API key! It will not be shown again.',
      });
    } catch (error) {
      if (error.message === 'Merchant already registered') {
        return res.status(409).json({
          success: false,
          error: 'Merchant already registered',
        });
      }
      throw error;
    }
  })
);

/**
 * GET /merchants/:address - Get merchant info
 */
router.get(
  '/:address',
  asyncHandler(async (req, res) => {
    const { address } = req.params;

    if (!isValidAddress(address)) {
      return res.status(400).json({
        error: 'Invalid address format',
      });
    }

    const merchant = db.merchants.get(address);

    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    res.json(merchant);
  })
);

/**
 * PATCH /merchants/:address - Update merchant info
 * Protected - requires API key auth
 */
router.patch(
  '/:address',
  merchantAuth,
  validateAddress,
  validate,
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const { name, category, logoUrl, webhookUrl } = req.body;

    // Verify the authenticated merchant owns this account
    if (req.merchant.address.toLowerCase() !== address.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own merchant account',
      });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (logoUrl !== undefined) updates.logoUrl = logoUrl;
    if (webhookUrl !== undefined) updates.webhookUrl = webhookUrl;

    const updated = db.merchants.update(address, updates);

    res.json({
      success: true,
      merchant: updated,
    });
  })
);

/**
 * GET /merchants/:address/stats - Get merchant statistics
 * Protected - requires API key auth
 */
router.get(
  '/:address/stats',
  merchantAuth,
  validateAddress,
  validate,
  asyncHandler(async (req, res) => {
    const { address } = req.params;

    // Verify the authenticated merchant owns this account
    if (req.merchant.address.toLowerCase() !== address.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own statistics',
      });
    }

    const stats = getMerchantStats(address);
    if (!stats) {
      return res.status(404).json({ success: false, error: 'Merchant not found' });
    }

    res.json({ success: true, stats });
  })
);

/**
 * POST /merchants/:address/regenerate-key - Generate new API key
 * Protected - requires current API key auth
 */
router.post(
  '/:address/regenerate-key',
  merchantAuth,
  validateAddress,
  validate,
  asyncHandler(async (req, res) => {
    const { address } = req.params;

    try {
      const result = await regenerateApiKey(address, req.merchant);

      res.json({
        success: true,
        apiKey: result.apiKey,
        message: 'Save your new API key! The old key is now invalid.',
      });
    } catch (error) {
      if (error.message === 'Unauthorized') {
        return res.status(403).json({
          success: false,
          error: 'You can only regenerate your own API key',
        });
      }
      throw error;
    }
  })
);

/**
 * GET /merchants/:address/transactions - Get merchant transaction history
 * Protected - requires API key auth
 */
router.get(
  '/:address/transactions',
  merchantAuth,
  validateAddress,
  validate,
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    // Verify the authenticated merchant owns this account
    if (req.merchant.address.toLowerCase() !== address.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own transactions',
      });
    }

    const result = db.transactions.findByMerchant(address, limit, offset);

    res.json({
      success: true,
      transactions: result.items,
      total: result.total,
      limit,
      offset,
    });
  })
);

/**
 * GET /merchants - List all merchants
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const merchants = db.merchants.list();
    res.json({ merchants, total: merchants.length });
  })
);

export default router;
