import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import walletRoutes from './routes/wallet.js';
import paymentRoutes from './routes/payment.js';
import merchantRoutes from './routes/merchant.js';
import { getNetworkConfig } from './services/movement.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration for merchant terminal (different origin)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Mount routes
app.use('/', walletRoutes); // Backward compatibility for wallet routes
app.use('/payments', paymentRoutes);
app.use('/merchants', merchantRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Network configuration endpoint
app.get('/config', (req, res) => {
  res.json(getNetworkConfig());
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`TapMove Backend running at http://localhost:${port}`);
  console.log('Routes:');
  console.log('  - Wallet: /generate-hash, /submit-transaction, /faucet, /balance/:address');
  console.log('  - Payments: /payments');
  console.log('  - Merchants: /merchants');
});
