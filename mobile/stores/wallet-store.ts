// Wallet Store - Zustand state management for wallet data
import { create } from 'zustand';
import { Transaction } from '@/types';

interface WalletState {
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  transactions: Transaction[];
  lastRefresh: number | null;

  // Actions
  setBalance: (balance: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransactionStatus: (id: string, status: Transaction['status']) => void;
  reset: () => void;
}

const initialState = {
  balance: null,
  isLoading: false,
  error: null,
  transactions: [],
  lastRefresh: null,
};

export const useWalletStore = create<WalletState>((set) => ({
  ...initialState,

  setBalance: (balance) => set({ balance, lastRefresh: Date.now() }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setTransactions: (transactions) => set({ transactions }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),

  updateTransactionStatus: (id, status) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, status } : tx
      ),
    })),

  reset: () => set(initialState),
}));

// Selectors for optimized re-renders
export const selectBalance = (state: WalletState) => state.balance;
export const selectTransactions = (state: WalletState) => state.transactions;
export const selectRecentTransactions = (state: WalletState) =>
  state.transactions.slice(0, 5);
export const selectIsLoading = (state: WalletState) => state.isLoading;
export const selectError = (state: WalletState) => state.error;
