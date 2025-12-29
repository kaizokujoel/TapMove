"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { PaymentForm, ActivePayment, SuccessModal } from "@/components/payment";
import { usePaymentStatus } from "@/hooks/use-payment-status";
import { usePaymentStore } from "@/stores/payment-store";
import { useMerchant } from "@/hooks/use-merchant";
import { createPayment, cancelPayment } from "@/lib/api";
import type { PaymentSession } from "@/types";

type PaymentView = "form" | "active" | "success";

export default function PaymentPage() {
  const { merchant } = useMerchant();
  const { activePayment, setActivePayment, addToHistory } = usePaymentStore();
  const [view, setView] = useState<PaymentView>(activePayment ? "active" : "form");
  const [completedPayment, setCompletedPayment] = useState<PaymentSession | null>(null);

  // Create payment mutation
  const createMutation = useMutation({
    mutationFn: async ({ amount, memo }: { amount: string; memo: string }) => {
      if (!merchant?.address) throw new Error("Merchant not found");
      return createPayment({ amount, memo }, merchant.address);
    },
    onSuccess: (payment) => {
      setActivePayment(payment);
      setView("active");
    },
  });

  // Cancel payment mutation
  const cancelMutation = useMutation({
    mutationFn: (paymentId: string) => cancelPayment(paymentId),
    onSuccess: () => {
      setActivePayment(null);
      setView("form");
    },
  });

  // Payment status polling
  const handlePaymentCompleted = useCallback((payment: PaymentSession) => {
    setCompletedPayment(payment);
    addToHistory(payment);
    setActivePayment(null);
    setView("success");
  }, [addToHistory, setActivePayment]);

  const handlePaymentExpired = useCallback(() => {
    setActivePayment(null);
    setView("form");
  }, [setActivePayment]);

  usePaymentStatus({
    paymentId: activePayment?.id || null,
    enabled: view === "active",
    onCompleted: handlePaymentCompleted,
    onExpired: handlePaymentExpired,
  });

  // Event handlers
  const handleCreatePayment = async (amount: string, memo: string) => {
    await createMutation.mutateAsync({ amount, memo });
  };

  const handleCancelPayment = () => {
    if (activePayment) {
      cancelMutation.mutate(activePayment.id);
    }
  };

  const handleNewPayment = () => {
    setCompletedPayment(null);
    setView("form");
  };

  const handleCloseSuccess = () => {
    setView("form");
    setCompletedPayment(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Payment</h1>
        <p className="text-muted-foreground">Create a payment request for customers</p>
      </div>

      {view === "form" && (
        <PaymentForm
          onSubmit={handleCreatePayment}
          isLoading={createMutation.isPending}
        />
      )}

      {view === "active" && activePayment && (
        <ActivePayment
          payment={activePayment}
          onCancel={handleCancelPayment}
          onExpired={handlePaymentExpired}
          isCancelling={cancelMutation.isPending}
        />
      )}

      {view === "success" && completedPayment && (
        <SuccessModal
          payment={completedPayment}
          onClose={handleCloseSuccess}
          onNewPayment={handleNewPayment}
        />
      )}
    </div>
  );
}
