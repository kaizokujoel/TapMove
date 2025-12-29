// Authentication middleware
import crypto from 'crypto';
import { db } from '../lib/db.js';

/**
 * Middleware to authenticate merchant API requests
 * Requires x-api-key header with valid merchant API key
 */
export const merchantAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
    });
  }

  // Hash the provided key and compare with stored hash
  const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  const merchant = db.merchants.getByApiKeyHash(apiKeyHash);
  if (!merchant) {
    return res.status(403).json({
      success: false,
      error: 'Invalid API key',
    });
  }

  // Attach merchant to request for use in handlers
  req.merchant = merchant;
  next();
};

/**
 * Optional auth - continues even without valid key
 * Useful for routes that can work with or without auth
 */
export const optionalMerchantAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (apiKey) {
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const merchant = db.merchants.getByApiKeyHash(apiKeyHash);
    if (merchant) {
      req.merchant = merchant;
    }
  }

  next();
};

/**
 * Public route marker - no authentication required
 */
export const publicRoute = (req, res, next) => next();
