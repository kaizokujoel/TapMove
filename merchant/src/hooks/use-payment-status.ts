"use client";

import { useEffect, useCallback, useRef } from "react";
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

export function usePaymentStatus({
  paymentId,
  enabled = true,
  pollInterval = 2000,
  onCompleted,
  onExpired,
  onError,
}: UsePaymentStatusOptions) {
  const queryClient = useQueryClient();
  const previousStatus = useRef<string | null>(null);

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
      return pollInterval;
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
