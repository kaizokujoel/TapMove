/**
 * SQLite database for TapMove backend
 * Persistent storage using better-sqlite3
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'tapmove.db');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');

// Run schema migrations
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
sqlite.exec(schema);

console.log(`Database initialized at ${DB_PATH}`);

// Prepared statements for payments
const paymentStmts = {
  insert: sqlite.prepare(`
    INSERT INTO payments (id, merchant_address, amount, amount_raw, memo, status, payment_uri, expires_at, created_at, updated_at)
    VALUES (@id, @merchantAddress, @amount, @amountRaw, @memo, @status, @paymentUri, @expiresAt, @createdAt, @updatedAt)
  `),
  getById: sqlite.prepare('SELECT * FROM payments WHERE id = ?'),
  update: sqlite.prepare(`
    UPDATE payments SET
      status = COALESCE(@status, status),
      sender_address = COALESCE(@senderAddress, sender_address),
      tx_hash = COALESCE(@txHash, tx_hash),
      confirmed_at = COALESCE(@confirmedAt, confirmed_at),
      updated_at = @updatedAt
    WHERE id = @id
  `),
  findByMerchant: sqlite.prepare(`
    SELECT * FROM payments
    WHERE merchant_address = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `),
  countByMerchant: sqlite.prepare('SELECT COUNT(*) as count FROM payments WHERE merchant_address = ?'),
  listAll: sqlite.prepare('SELECT * FROM payments ORDER BY created_at DESC'),
  getExpired: sqlite.prepare(`
    SELECT * FROM payments
    WHERE status = 'pending' AND expires_at < ?
  `),
  batchUpdateStatus: sqlite.prepare(`
    UPDATE payments SET status = ?, updated_at = ? WHERE id = ?
  `),
  getOldPayments: sqlite.prepare(`
    SELECT * FROM payments
    WHERE created_at < ? AND status IN ('expired', 'failed', 'confirmed')
  `),
};

// Prepared statements for merchants
const merchantStmts = {
  insert: sqlite.prepare(`
    INSERT INTO merchants (address, name, category, logo_url, webhook_url, api_key_hash, created_at, updated_at)
    VALUES (@address, @name, @category, @logoUrl, @webhookUrl, @apiKeyHash, @createdAt, @updatedAt)
  `),
  getByAddress: sqlite.prepare('SELECT * FROM merchants WHERE address = ?'),
  getByApiKeyHash: sqlite.prepare('SELECT * FROM merchants WHERE api_key_hash = ?'),
  update: sqlite.prepare(`
    UPDATE merchants SET
      name = COALESCE(@name, name),
      category = COALESCE(@category, category),
      logo_url = COALESCE(@logoUrl, logo_url),
      webhook_url = COALESCE(@webhookUrl, webhook_url),
      total_volume = COALESCE(@totalVolume, total_volume),
      total_transactions = COALESCE(@totalTransactions, total_transactions),
      verified = COALESCE(@verified, verified),
      updated_at = @updatedAt
    WHERE address = @address
  `),
  listAll: sqlite.prepare('SELECT * FROM merchants ORDER BY created_at DESC'),
};

// Prepared statements for transactions
const transactionStmts = {
  insert: sqlite.prepare(`
    INSERT INTO transactions (hash, payment_id, merchant_address, sender_address, amount, memo, vm_status, created_at)
    VALUES (@hash, @paymentId, @merchantAddress, @senderAddress, @amount, @memo, @vmStatus, @createdAt)
  `),
  getByHash: sqlite.prepare('SELECT * FROM transactions WHERE hash = ?'),
  findByMerchant: sqlite.prepare(`
    SELECT * FROM transactions
    WHERE merchant_address = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `),
  countByMerchant: sqlite.prepare('SELECT COUNT(*) as count FROM transactions WHERE merchant_address = ?'),
  findByPaymentId: sqlite.prepare('SELECT * FROM transactions WHERE payment_id = ?'),
  listAll: sqlite.prepare('SELECT * FROM transactions ORDER BY created_at DESC'),
};

// Helper to convert DB row to payment object
function rowToPayment(row) {
  if (!row) return null;
  return {
    id: row.id,
    merchantAddress: row.merchant_address,
    amount: row.amount,
    amountRaw: row.amount_raw,
    currency: row.currency,
    memo: row.memo,
    status: row.status,
    paymentUri: row.payment_uri,
    senderAddress: row.sender_address,
    txHash: row.tx_hash,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    expiresAt: row.expires_at,
    confirmedAt: row.confirmed_at ? new Date(row.confirmed_at).toISOString() : null,
  };
}

// Helper to convert DB row to merchant object
function rowToMerchant(row) {
  if (!row) return null;
  return {
    address: row.address,
    name: row.name,
    category: row.category,
    logoUrl: row.logo_url,
    webhookUrl: row.webhook_url,
    apiKeyHash: row.api_key_hash,
    totalVolume: row.total_volume,
    totalTransactions: row.total_transactions,
    verified: Boolean(row.verified),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

// Helper to convert DB row to transaction object
function rowToTransaction(row) {
  if (!row) return null;
  return {
    hash: row.hash,
    paymentId: row.payment_id,
    merchantAddress: row.merchant_address,
    senderAddress: row.sender_address,
    amount: row.amount,
    memo: row.memo,
    vmStatus: row.vm_status,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export const db = {
  payments: {
    create: (payment) => {
      const now = Date.now();
      try {
        paymentStmts.insert.run({
          id: payment.id,
          merchantAddress: payment.merchantAddress,
          amount: payment.amount,
          amountRaw: payment.amountRaw || null,
          memo: payment.memo || '',
          status: payment.status || 'pending',
          paymentUri: payment.paymentUri || null,
          expiresAt: payment.expiresAt,
          createdAt: now,
          updatedAt: now,
        });
        return rowToPayment(paymentStmts.getById.get(payment.id));
      } catch (error) {
        console.error('Error creating payment:', error);
        throw error;
      }
    },

    get: (id) => {
      const row = paymentStmts.getById.get(id);
      return rowToPayment(row);
    },

    update: (id, data) => {
      const now = Date.now();
      try {
        paymentStmts.update.run({
          id,
          status: data.status || null,
          senderAddress: data.senderAddress || null,
          txHash: data.txHash || null,
          confirmedAt: data.confirmedAt ? new Date(data.confirmedAt).getTime() : null,
          updatedAt: now,
        });
        return rowToPayment(paymentStmts.getById.get(id));
      } catch (error) {
        console.error('Error updating payment:', error);
        throw error;
      }
    },

    findByMerchant: (address, limit = 20, offset = 0) => {
      const rows = paymentStmts.findByMerchant.all(address.toLowerCase(), limit, offset);
      const countResult = paymentStmts.countByMerchant.get(address.toLowerCase());
      return {
        items: rows.map(rowToPayment),
        total: countResult.count,
      };
    },

    list: () => {
      const rows = paymentStmts.listAll.all();
      return rows.map(rowToPayment);
    },

    getExpired: () => {
      const rows = paymentStmts.getExpired.all(Date.now());
      return rows.map(rowToPayment);
    },

    batchUpdateStatus: (ids, status) => {
      const now = Date.now();
      const updateMany = sqlite.transaction((paymentIds) => {
        for (const id of paymentIds) {
          paymentStmts.batchUpdateStatus.run(status, now, id);
        }
      });
      updateMany(ids);
    },

    getOldPayments: (daysOld) => {
      const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      const rows = paymentStmts.getOldPayments.all(cutoff);
      return rows.map(rowToPayment);
    },
  },

  merchants: {
    create: (merchant) => {
      const now = Date.now();
      const address = merchant.address.toLowerCase();
      try {
        merchantStmts.insert.run({
          address,
          name: merchant.name,
          category: merchant.category || null,
          logoUrl: merchant.logoUrl || null,
          webhookUrl: merchant.webhookUrl || null,
          apiKeyHash: merchant.apiKeyHash || null,
          createdAt: now,
          updatedAt: now,
        });
        return rowToMerchant(merchantStmts.getByAddress.get(address));
      } catch (error) {
        console.error('Error creating merchant:', error);
        throw error;
      }
    },

    get: (address) => {
      const row = merchantStmts.getByAddress.get(address.toLowerCase());
      return rowToMerchant(row);
    },

    getByApiKeyHash: (apiKeyHash) => {
      const row = merchantStmts.getByApiKeyHash.get(apiKeyHash);
      return rowToMerchant(row);
    },

    update: (address, data) => {
      const now = Date.now();
      try {
        merchantStmts.update.run({
          address: address.toLowerCase(),
          name: data.name || null,
          category: data.category || null,
          logoUrl: data.logoUrl || null,
          webhookUrl: data.webhookUrl || null,
          totalVolume: data.totalVolume || null,
          totalTransactions: data.totalTransactions || null,
          verified: data.verified !== undefined ? (data.verified ? 1 : 0) : null,
          updatedAt: now,
        });
        return rowToMerchant(merchantStmts.getByAddress.get(address.toLowerCase()));
      } catch (error) {
        console.error('Error updating merchant:', error);
        throw error;
      }
    },

    list: () => {
      const rows = merchantStmts.listAll.all();
      return rows.map(rowToMerchant);
    },
  },

  transactions: {
    create: (tx) => {
      const now = Date.now();
      try {
        transactionStmts.insert.run({
          hash: tx.hash,
          paymentId: tx.paymentId || null,
          merchantAddress: tx.merchantAddress,
          senderAddress: tx.senderAddress || null,
          amount: tx.amount,
          memo: tx.memo || '',
          vmStatus: tx.vmStatus || null,
          createdAt: now,
        });
        return rowToTransaction(transactionStmts.getByHash.get(tx.hash));
      } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
      }
    },

    get: (hash) => {
      const row = transactionStmts.getByHash.get(hash);
      return rowToTransaction(row);
    },

    findByMerchant: (address, limit = 20, offset = 0) => {
      const rows = transactionStmts.findByMerchant.all(address.toLowerCase(), limit, offset);
      const countResult = transactionStmts.countByMerchant.get(address.toLowerCase());
      return {
        items: rows.map(rowToTransaction),
        total: countResult.count,
      };
    },

    findByPaymentId: (paymentId) => {
      const row = transactionStmts.findByPaymentId.get(paymentId);
      return rowToTransaction(row);
    },

    list: () => {
      const rows = transactionStmts.listAll.all();
      return rows.map(rowToTransaction);
    },
  },

  // Close database connection (for graceful shutdown)
  close: () => {
    sqlite.close();
    console.log('Database connection closed');
  },

  // Clear all data (useful for testing)
  clear: () => {
    sqlite.exec('DELETE FROM transactions');
    sqlite.exec('DELETE FROM payments');
    sqlite.exec('DELETE FROM merchants');
  },

  // Get raw sqlite instance for advanced operations
  raw: sqlite,
};
