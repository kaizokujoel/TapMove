/**
 * Environment configuration loader and validator
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Required environment variables (will exit if missing in production)
const required = ['MOVEMENT_RPC_URL'];

// Optional but recommended
const recommended = ['PAYMENT_MODULE', 'WEBHOOK_SECRET'];

// Validate required variables in production
if (process.env.NODE_ENV === 'production') {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('Copy .env.example to .env and fill in all required values');
    process.exit(1);
  }
}

// Warn about missing recommended variables
const missingRecommended = recommended.filter((key) => !process.env[key]);
if (missingRecommended.length > 0 && process.env.NODE_ENV !== 'test') {
  console.warn(`⚠️  Missing recommended environment variables: ${missingRecommended.join(', ')}`);
}

/**
 * Typed configuration object
 */
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '4001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Movement Network
  movement: {
    rpcUrl: process.env.MOVEMENT_RPC_URL || 'https://aptos.testnet.porto.movementlabs.xyz/v1',
    faucetUrl: process.env.MOVEMENT_FAUCET_URL || 'https://faucet.testnet.porto.movementlabs.xyz',
    paymentModule: process.env.PAYMENT_MODULE,
    merchantModule: process.env.MERCHANT_MODULE,
  },

  // Database
  database: {
    path: process.env.DATABASE_PATH || './data/tapmove.db',
  },

  // Security
  security: {
    webhookSecret: process.env.WEBHOOK_SECRET,
  },

  // CORS
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:8081')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },

  // URLs
  urls: {
    base: process.env.BASE_URL || `http://localhost:${process.env.PORT || 4001}`,
    merchant: process.env.MERCHANT_URL || 'http://localhost:3000',
  },

  // Environment helpers
  isDev: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

/**
 * Print configuration summary (for startup logs)
 */
export function printConfigSummary() {
  console.log('Configuration:');
  console.log(`  Environment: ${config.nodeEnv}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Movement RPC: ${config.movement.rpcUrl}`);
  console.log(`  Database: ${config.database.path}`);
  if (config.isDev) {
    console.log(`  CORS Origins: ${config.cors.origins.join(', ')}`);
  }
}

export default config;
