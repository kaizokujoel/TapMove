-- TapMove Database Schema
-- SQLite schema for persistent payment storage

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  merchant_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  amount_raw TEXT,
  currency TEXT DEFAULT 'USDC',
  memo TEXT,
  status TEXT DEFAULT 'pending',
  payment_uri TEXT,
  sender_address TEXT,
  tx_hash TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER,
  expires_at INTEGER NOT NULL,
  confirmed_at INTEGER
);

-- Merchants table
CREATE TABLE IF NOT EXISTS merchants (
  address TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  logo_url TEXT,
  webhook_url TEXT,
  api_key_hash TEXT,
  total_volume TEXT DEFAULT '0',
  total_transactions INTEGER DEFAULT 0,
  verified INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  hash TEXT PRIMARY KEY,
  payment_id TEXT,
  merchant_address TEXT NOT NULL,
  sender_address TEXT,
  amount TEXT NOT NULL,
  memo TEXT,
  vm_status TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (payment_id) REFERENCES payments(id),
  FOREIGN KEY (merchant_address) REFERENCES merchants(address)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_merchant ON payments(merchant_address);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_expires ON payments(expires_at);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_address);
CREATE INDEX IF NOT EXISTS idx_transactions_payment ON transactions(payment_id);
