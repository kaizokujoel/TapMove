// TapMove Core Type Definitions

export interface PaymentRequest {
  id: string;
  merchant: string;
  merchantName: string;
  merchantAddress?: string;
  amount: string;
  currency: string;
  memo: string;
  expiry: number;
  status: PaymentStatus;
  networkFee?: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'expired' | 'cancelled' | 'failed';

export interface PaymentError {
  code: PaymentErrorCode;
  message: string;
  details?: {
    required?: string;
    available?: string;
    expiredAt?: number;
    txHash?: string;
  };
}

export type PaymentErrorCode =
  | 'INSUFFICIENT_BALANCE'
  | 'PAYMENT_EXPIRED'
  | 'NETWORK_ERROR'
  | 'TRANSACTION_FAILED'
  | 'SIGNING_REJECTED'
  | 'TIMEOUT'
  | 'UNKNOWN';

export interface Transaction {
  id: string;
  paymentId: string;
  payer: string;
  merchant: string;
  merchantName: string;
  merchantAddress?: string;
  amount: string;
  currency: string;
  memo: string;
  timestamp: number;
  txHash: string;
  status: TransactionStatus;
}

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export type TransactionDateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

export interface TransactionFilters {
  dateFilter: TransactionDateFilter;
  statusFilter: TransactionStatus | 'all';
  searchQuery: string;
  customDateRange?: {
    start: Date;
    end: Date;
  };
}

export interface TransactionGroup {
  date: string;
  dateLabel: string;
  totalSpent: number;
  transactions: Transaction[];
}

export interface Merchant {
  address: string;
  name: string;
  category: string;
  logoUrl?: string;
  verified: boolean;
}

// Wallet types
export interface WalletInfo {
  address: string;
  publicKey: string;
  balance: number;
  chainType: 'aptos';
}

// NFC types
export interface NFCPaymentData {
  paymentId: string;
  scheme: 'tapmove';
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Navigation types
export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
  'pay/[id]': { id: string };
};

export type TabParamList = {
  index: undefined;
  scan: undefined;
  history: undefined;
  settings: undefined;
};
