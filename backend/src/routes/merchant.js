import { Router } from 'express';
import { db } from '../lib/db.js';
import { asyncHandler, isValidAddress, normalizeAddress } from '../lib/utils.js';

const router = Router();

/**
 * POST /merchants/register - Register a new merchant
 */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { address, name, category, logoUrl, webhookUrl } = req.body;

    if (!address || !name) {
      return res.status(400).json({
        error: 'Missing required fields: address, name',
      });
    }

    if (!isValidAddress(address)) {
      return res.status(400).json({
        error: 'Invalid address format',
      });
    }

    // Check if merchant already exists
    const existing = db.merchants.get(address);
    if (existing) {
      return res.status(409).json({
        error: 'Merchant already registered',
        merchant: existing,
      });
    }

    const merchant = db.merchants.create({
      address: normalizeAddress(address),
      name,
      category: category || 'general',
      logoUrl: logoUrl || null,
      webhookUrl: webhookUrl || null,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      merchant,
    });
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
 */
router.patch(
  '/:address',
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const { name, category, logoUrl, webhookUrl, isActive } = req.body;

    if (!isValidAddress(address)) {
      return res.status(400).json({
        error: 'Invalid address format',
      });
    }

    const merchant = db.merchants.get(address);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (logoUrl !== undefined) updates.logoUrl = logoUrl;
    if (webhookUrl !== undefined) updates.webhookUrl = webhookUrl;
    if (isActive !== undefined) updates.isActive = isActive;

    const updated = db.merchants.update(address, updates);

    res.json({
      success: true,
      merchant: updated,
    });
  })
);

/**
 * GET /merchants/:address/transactions - Get merchant transaction history
 */
router.get(
  '/:address/transactions',
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    if (!isValidAddress(address)) {
      return res.status(400).json({
        error: 'Invalid address format',
      });
    }

    const merchant = db.merchants.get(address);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }

    const result = db.transactions.findByMerchant(address, limit, offset);

    res.json({
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
