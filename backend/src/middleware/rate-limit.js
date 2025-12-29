// Rate limiting middleware
import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Payment creation rate limiter
 * 10 payment creations per minute per IP
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    error: 'Too many payment requests, please wait before creating more',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Transaction submission rate limiter
 * More restrictive - 5 transactions per minute per IP
 */
export const transactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    error: 'Too many transaction submissions, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Faucet rate limiter
 * 3 requests per hour per IP
 */
export const faucetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    error: 'Faucet limit reached, please try again in an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
