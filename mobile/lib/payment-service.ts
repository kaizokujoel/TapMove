// Payment Service - Handles payment API interactions
import { PaymentRequest, PaymentStatus, Transaction, ApiResponse, PaymentError } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

// Error code mapping for user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  'INSUFFICIENT_BALANCE': 'You don\'t have enough balance to complete this payment.',
  'PAYMENT_EXPIRED': 'This payment request has expired.',
  'PAYMENT_NOT_FOUND': 'Payment not found. Please scan again.',
  'NETWORK_ERROR': 'Unable to connect. Please check your internet connection.',
  'TRANSACTION_FAILED': 'Transaction failed. Please try again.',
};

function createPaymentError(code: PaymentError['code'], message?: string): PaymentError {
  return {
    code,
    message: message || ERROR_MESSAGES[code] || 'An unexpected error occurred.',
  };
}

export async function fetchPaymentDetails(paymentId: string): Promise<PaymentRequest> {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw createPaymentError('UNKNOWN', 'Payment not found');
      }
      throw createPaymentError('NETWORK_ERROR');
    }

    const data: ApiResponse<PaymentRequest> = await response.json();

    if (!data.success || !data.data) {
      throw createPaymentError('UNKNOWN', data.error || 'Failed to fetch payment details');
    }

    // Check if payment is expired
    if (data.data.status === 'expired' || isPaymentExpired(data.data.expiry)) {
      throw createPaymentError('PAYMENT_EXPIRED');
    }

    return data.data;
  } catch (error) {
    if ((error as PaymentError).code) {
      throw error;
    }
    throw createPaymentError('NETWORK_ERROR', 'Unable to fetch payment details');
  }
}

export async function checkPaymentStatus(paymentId: string): Promise<{
  status: PaymentStatus;
  txHash?: string;
  confirmedAt?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/status`);

    if (!response.ok) {
      throw createPaymentError('NETWORK_ERROR');
    }

    const data = await response.json();
    return {
      status: data.status,
      txHash: data.txHash,
      confirmedAt: data.confirmedAt,
    };
  } catch (error) {
    if ((error as PaymentError).code) {
      throw error;
    }
    throw createPaymentError('NETWORK_ERROR', 'Unable to check payment status');
  }
}

export function getExplorerUrl(txHash: string, network: string = 'testnet'): string {
  const baseUrl = 'https://explorer.movementlabs.xyz';
  return `${baseUrl}/txn/${txHash}?network=${network}`;
}

export function parseTapMoveUrl(url: string): string | null {
  try {
    // Handle tapmove://pay?id=XXX format
    if (url.startsWith('tapmove://pay')) {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('id');
    }

    // Handle https://tapmove.app/pay?id=XXX format
    if (url.includes('tapmove.app/pay') || url.includes('/pay?id=')) {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('id');
    }

    return null;
  } catch {
    return null;
  }
}

export function isPaymentExpired(expiry: number): boolean {
  return Date.now() > expiry;
}

export function formatAmount(amount: string, currency: string = 'USDC'): string {
  const num = parseFloat(amount);
  return `$${num.toFixed(2)} ${currency}`;
}

export function abbreviateAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function abbreviateTxHash(hash: string, chars: number = 8): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}
