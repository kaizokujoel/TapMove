"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPaymentStatus } from "@/lib/api";
import type { PaymentSession } from "@/types";

interface UsePaymentStatusOptions {
  paymentId: string | null;
  enabled?: boolean;
  pollInterval?: number;
  onCompleted?: (payment: PaymentSession) => void;
  onExpired?: (payment: PaymentSession) => void;
  onError?: (error: Error) => void;
}

// Adaptive polling intervals based on time elapsed
const POLL_INTERVALS = {
  initial: 1000,     // First 30 seconds: 1 second
  standard: 2000,    // 30-60 seconds: 2 seconds
  relaxed: 3000,     // 60-120 seconds: 3 seconds
  slow: 5000,        // 120+ seconds: 5 seconds
};

function getAdaptivePollInterval(createdAt: number): number {
  const elapsed = Date.now() - createdAt;
  const elapsedSeconds = elapsed / 1000;

  if (elapsedSeconds < 30) return POLL_INTERVALS.initial;
  if (elapsedSeconds < 60) return POLL_INTERVALS.standard;
  if (elapsedSeconds < 120) return POLL_INTERVALS.relaxed;
  return POLL_INTERVALS.slow;
}

export function usePaymentStatus({
  paymentId,
  enabled = true,
  pollInterval,
  onCompleted,
  onExpired,
  onError,
}: UsePaymentStatusOptions) {
  const queryClient = useQueryClient();
  const previousStatus = useRef<string | null>(null);
  const createdAtRef = useRef<number>(Date.now());

  // Reset creation time when payment ID changes
  useEffect(() => {
    if (paymentId) {
      createdAtRef.current = Date.now();
    }
  }, [paymentId]);

  const {
    data: payment,
    isLoading,
    error,
    refetch,
  } = useQuery<PaymentSession>({
    queryKey: ["payment-status", paymentId],
    queryFn: () => {
      if (!paymentId) throw new Error("No payment ID");
      return getPaymentStatus(paymentId);
    },
    enabled: !!paymentId && enabled,
    refetchInterval: (data) => {
      // Stop polling if payment is no longer pending
      if (data.state.data?.status !== "pending") {
        return false;
      }
      // Use provided interval or adaptive polling
      return pollInterval ?? getAdaptivePollInterval(createdAtRef.current);
    },
    staleTime: 1000, // Consider data stale after 1 second
  });

  // Handle status changes
  useEffect(() => {
    if (!payment) return;

    const currentStatus = payment.status;
    const prevStatus = previousStatus.current;

    // Only trigger callbacks on status change
    if (prevStatus !== currentStatus) {
      previousStatus.current = currentStatus;

      if (currentStatus === "completed") {
        onCompleted?.(payment);
      } else if (currentStatus === "expired") {
        onExpired?.(payment);
      }
    }
  }, [payment, onCompleted, onExpired]);

  // Handle errors
  useEffect(() => {
    if (error && error instanceof Error) {
      onError?.(error);
    }
  }, [error, onError]);

  const stopPolling = useCallback(() => {
    queryClient.cancelQueries({ queryKey: ["payment-status", paymentId] });
  }, [queryClient, paymentId]);

  const resetStatus = useCallback(() => {
    previousStatus.current = null;
    queryClient.removeQueries({ queryKey: ["payment-status", paymentId] });
  }, [queryClient, paymentId]);

  return {
    payment,
    isLoading,
    error,
    refetch,
    stopPolling,
    resetStatus,
    isCompleted: payment?.status === "completed",
    isExpired: payment?.status === "expired",
    isPending: payment?.status === "pending",
  };
}
