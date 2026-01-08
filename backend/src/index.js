// Load environment variables FIRST (must be before other imports in ES modules)
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import walletRoutes from './routes/wallet.js';
import paymentRoutes from './routes/payment.js';
import merchantRoutes from './routes/merchant.js';
import { getNetworkConfig } from './services/movement.js';
import { startExpiryChecker, stopExpiryChecker, getExpiryCheckerStatus } from './services/expiry.js';
import { db } from './lib/db.js';
import { requestLogger, errorLogger } from './middleware/logger.js';
import { apiLimiter } from './middleware/rate-limit.js';

const app = express();
const port = process.env.PORT || 4001;

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration for merchant terminal and mobile app
const allowedOrigins = [
  'http://localhost:3000',      // Merchant dev
  'http://localhost:8081',      // Mobile dev (Metro)
  'http://localhost:19006',     // Expo web
  process.env.MERCHANT_URL,     // Production merchant
  process.env.CORS_ORIGIN,      // Custom origin
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc)
      if (!origin) return callback(null, true);

      // Allow all in development, check whitelist in production
      if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    credentials: true,
  })
);

// Request logging
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Rate limiting (applied to all routes)
app.use(apiLimiter);

// Mount routes
app.use('/', walletRoutes); // Backward compatibility for wallet routes
app.use('/payments', paymentRoutes);
app.use('/merchants', merchantRoutes);

// Health check
app.get('/health', (req, res) => {
  const expiryStatus = getExpiryCheckerStatus();
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    expiryChecker: expiryStatus,
  });
});

// Network configuration endpoint
app.get('/config', (req, res) => {
  res.json(getNetworkConfig());
});

// Error logging middleware
app.use(errorLogger);

// Global error handler
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, error: err.message });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, error: 'Origin not allowed' });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const server = app.listen(port, () => {
  console.log(`TapMove Backend running at http://localhost:${port}`);
  console.log('Routes:');
  console.log('  - Wallet: /generate-hash, /submit-transaction, /faucet, /balance/:address');
  console.log('  - Payments: /payments');
  console.log('  - Merchants: /merchants');

  // Start expiry checker
  startExpiryChecker();
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  // Stop expiry checker
  stopExpiryChecker();

  // Close database connection
  db.close();

  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
