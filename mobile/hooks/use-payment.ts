// Payment Hook - Manages payment state and provides data for payment flow
// Note: Transaction submission is handled by useMovement.processPayment
import { useState, useEffect, useCallback } from 'react';
import { PaymentRequest, PaymentStatus, PaymentError } from '@/types';
import {
  fetchPaymentDetails,
  checkPaymentStatus,
  isPaymentExpired,
} from '@/lib/payment-service';

interface UsePaymentReturn {
  payment: PaymentRequest | null;
  isLoading: boolean;
  error: PaymentError | null;
  status: PaymentStatus | null;
  txHash: string | null;
  setStatus: (status: PaymentStatus) => void;
  setTxHash: (hash: string) => void;
  setError: (error: PaymentError | null) => void;
  setLoading: (loading: boolean) => void;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export function usePayment(paymentId: string | null): UsePaymentReturn {
  const [payment, setPayment] = useState<PaymentRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<PaymentError | null>(null);
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const loadPayment = useCallback(async () => {
    if (!paymentId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const paymentData = await fetchPaymentDetails(paymentId);

      if (isPaymentExpired(paymentData.expiry)) {
        setError({
          code: 'PAYMENT_EXPIRED',
          message: 'This payment has expired',
        });
        setPayment(paymentData);
        setStatus('expired');
      } else if (paymentData.status !== 'pending') {
        setPayment(paymentData);
        setStatus(paymentData.status);
      } else {
        setPayment(paymentData);
        setStatus('pending');
      }
    } catch (err) {
      const paymentError = err as PaymentError;
      if (paymentError.code) {
        setError(paymentError);
      } else {
        setError({
          code: 'NETWORK_ERROR',
          message: err instanceof Error ? err.message : 'Failed to load payment',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

  // Polling for status updates when payment is submitted
  useEffect(() => {
    if (!paymentId || status !== 'pending') return;

    const pollStatus = async () => {
      try {
        const result = await checkPaymentStatus(paymentId);
        if (result.status !== 'pending') {
          setStatus(result.status);
          if (result.txHash) {
            setTxHash(result.txHash);
          }
        }
      } catch {
        // Ignore polling errors
      }
    };

    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [paymentId, status]);

  const refresh = useCallback(async () => {
    await loadPayment();
  }, [loadPayment]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    payment,
    isLoading,
    error,
    status,
    txHash,
    setStatus,
    setTxHash,
    setError,
    setLoading: setIsLoading,
    refresh,
    clearError,
  };
}
