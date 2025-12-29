// Request validation middleware
import { body, param, validationResult } from 'express-validator';

// Movement address regex - 64 hex chars prefixed with 0x
const MOVEMENT_ADDRESS_REGEX = /^0x[a-fA-F0-9]{64}$/;
// UUID v4 regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validation chain for payment creation
 */
export const validatePaymentCreate = [
  body('merchantAddress')
    .isString()
    .matches(MOVEMENT_ADDRESS_REGEX)
    .withMessage('Invalid merchant address format'),
  body('amount')
    .isString()
    .matches(/^\d+(\.\d{1,6})?$/)
    .withMessage('Invalid amount format (use decimal string with up to 6 decimals)'),
  body('currency')
    .optional()
    .isString()
    .isLength({ max: 10 })
    .withMessage('Invalid currency'),
  body('memo')
    .optional()
    .isString()
    .isLength({ max: 256 })
    .trim()
    .withMessage('Memo must be 256 characters or less'),
  body('expiresIn')
    .optional()
    .isInt({ min: 60, max: 3600 })
    .withMessage('Expires must be between 60 and 3600 seconds'),
];

/**
 * Validation chain for merchant registration
 */
export const validateMerchantRegister = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name required (max 100 characters)'),
  body('address')
    .isString()
    .matches(MOVEMENT_ADDRESS_REGEX)
    .withMessage('Invalid merchant address format'),
  body('category')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .trim()
    .withMessage('Category must be 50 characters or less'),
  body('webhookUrl')
    .optional()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Invalid webhook URL'),
];

/**
 * Validation chain for payment ID parameter
 */
export const validatePaymentId = [
  param('paymentId')
    .matches(UUID_REGEX)
    .withMessage('Invalid payment ID format'),
];

/**
 * Validation chain for address parameter
 */
export const validateAddress = [
  param('address')
    .matches(MOVEMENT_ADDRESS_REGEX)
    .withMessage('Invalid address format'),
];

/**
 * Validation chain for transaction submission
 */
export const validateTransactionSubmit = [
  body('rawTxnHex')
    .isString()
    .isLength({ min: 10 })
    .withMessage('Invalid raw transaction'),
  body('publicKey')
    .isString()
    .isLength({ min: 64, max: 66 })
    .withMessage('Invalid public key'),
  body('signature')
    .isString()
    .isLength({ min: 128, max: 130 })
    .withMessage('Invalid signature'),
  body('senderAddress')
    .isString()
    .matches(MOVEMENT_ADDRESS_REGEX)
    .withMessage('Invalid sender address'),
];

/**
 * Validation chain for hash generation
 */
export const validateGenerateHash = [
  body('sender')
    .isString()
    .matches(MOVEMENT_ADDRESS_REGEX)
    .withMessage('Invalid sender address'),
  body('function')
    .isString()
    .matches(/^0x[a-fA-F0-9]+::\w+::\w+$/)
    .withMessage('Invalid function format (expected: address::module::function)'),
  body('typeArguments')
    .optional()
    .isArray()
    .withMessage('Type arguments must be an array'),
  body('functionArguments')
    .optional()
    .isArray()
    .withMessage('Function arguments must be an array'),
];

/**
 * Process validation results
 * Call this after validation chain to check for errors
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};
