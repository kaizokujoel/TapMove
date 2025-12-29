"use client";

import { create } from "zustand";
import type { PaymentSession, MerchantProfile } from "@/types";

interface PaymentStore {
  // Current active payment
  activePayment: PaymentSession | null;
  setActivePayment: (payment: PaymentSession | null) => void;

  // Payment history (recent payments for this session)
  recentPayments: PaymentSession[];
  addToHistory: (payment: PaymentSession) => void;
  clearHistory: () => void;

  // UI state
  isCreating: boolean;
  setIsCreating: (value: boolean) => void;

  // Merchant profile (cached)
  merchantProfile: MerchantProfile | null;
  setMerchantProfile: (profile: MerchantProfile | null) => void;

  // NFC status
  nfcSupported: boolean;
  nfcActive: boolean;
  setNfcSupported: (value: boolean) => void;
  setNfcActive: (value: boolean) => void;

  // Reset state
  reset: () => void;
}

const initialState = {
  activePayment: null,
  recentPayments: [],
  isCreating: false,
  merchantProfile: null,
  nfcSupported: false,
  nfcActive: false,
};

export const usePaymentStore = create<PaymentStore>((set) => ({
  ...initialState,

  setActivePayment: (payment) => set({ activePayment: payment }),

  addToHistory: (payment) =>
    set((state) => ({
      recentPayments: [payment, ...state.recentPayments].slice(0, 10),
    })),

  clearHistory: () => set({ recentPayments: [] }),

  setIsCreating: (value) => set({ isCreating: value }),

  setMerchantProfile: (profile) => set({ merchantProfile: profile }),

  setNfcSupported: (value) => set({ nfcSupported: value }),

  setNfcActive: (value) => set({ nfcActive: value }),

  reset: () => set(initialState),
}));
