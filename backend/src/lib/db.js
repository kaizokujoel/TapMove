/**
 * In-memory database for TapMove backend
 * Replace with Postgres or other persistent storage for production
 */

const payments = new Map();
const merchants = new Map();
const transactions = new Map();

export const db = {
  payments: {
    create: (payment) => {
      payments.set(payment.id, {
        ...payment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return payments.get(payment.id);
    },

    get: (id) => {
      return payments.get(id) || null;
    },

    update: (id, data) => {
      const existing = payments.get(id);
      if (!existing) return null;
      const updated = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      payments.set(id, updated);
      return updated;
    },

    findByMerchant: (address, limit = 20, offset = 0) => {
      const merchantPayments = Array.from(payments.values())
        .filter((p) => p.merchantAddress === address)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        items: merchantPayments.slice(offset, offset + limit),
        total: merchantPayments.length,
      };
    },

    list: () => Array.from(payments.values()),
  },

  merchants: {
    create: (merchant) => {
      const record = {
        ...merchant,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      merchants.set(merchant.address.toLowerCase(), record);
      return record;
    },

    get: (address) => {
      return merchants.get(address.toLowerCase()) || null;
    },

    update: (address, data) => {
      const existing = merchants.get(address.toLowerCase());
      if (!existing) return null;
      const updated = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      merchants.set(address.toLowerCase(), updated);
      return updated;
    },

    list: () => Array.from(merchants.values()),
  },

  transactions: {
    create: (tx) => {
      const record = {
        ...tx,
        createdAt: new Date().toISOString(),
      };
      transactions.set(tx.hash, record);
      return record;
    },

    get: (hash) => {
      return transactions.get(hash) || null;
    },

    findByMerchant: (address, limit = 20, offset = 0) => {
      const merchantTxs = Array.from(transactions.values())
        .filter((tx) => tx.merchantAddress === address)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        items: merchantTxs.slice(offset, offset + limit),
        total: merchantTxs.length,
      };
    },

    findByPaymentId: (paymentId) => {
      return Array.from(transactions.values()).find(
        (tx) => tx.paymentId === paymentId
      ) || null;
    },

    list: () => Array.from(transactions.values()),
  },

  // Clear all data (useful for testing)
  clear: () => {
    payments.clear();
    merchants.clear();
    transactions.clear();
  },
};
