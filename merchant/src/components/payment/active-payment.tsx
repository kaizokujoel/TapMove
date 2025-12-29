"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRDisplay } from "./qr-display";
import { NFCBroadcast } from "./nfc-broadcast";
import { ExpiryTimer } from "./expiry-timer";
import { formatUSDC } from "@/lib/utils";
import { X, Loader2, CreditCard } from "lucide-react";
import type { PaymentSession } from "@/types";

interface ActivePaymentProps {
  payment: PaymentSession;
  onCancel: () => void;
  onExpired: () => void;
  isCancelling: boolean;
}

export function ActivePayment({
  payment,
  onCancel,
  onExpired,
  isCancelling,
}: ActivePaymentProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Active Payment
        </CardTitle>
        <ExpiryTimer expiresAt={payment.expiresAt} onExpired={onExpired} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
          {/* QR Code */}
          <QRDisplay paymentId={payment.id} size={200} />

          {/* Payment Details */}
          <div className="flex flex-1 flex-col items-center gap-4 lg:items-start">
            {/* Status */}
            <div className="flex items-center gap-2 text-lg text-foreground">
              <div className="h-3 w-3 animate-pulse rounded-full bg-yellow-500" />
              Waiting for customer...
            </div>

            {/* Amount */}
            <div className="text-center lg:text-left">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-3xl font-bold text-primary">
                {formatUSDC(payment.amount)}
              </p>
            </div>

            {/* Payment ID */}
            <div className="text-center lg:text-left">
              <p className="text-sm text-muted-foreground">Payment ID</p>
              <p className="font-mono text-sm text-foreground">{payment.id}</p>
            </div>

            {/* Memo if present */}
            {payment.memo && (
              <div className="text-center lg:text-left">
                <p className="text-sm text-muted-foreground">Memo</p>
                <p className="text-foreground">{payment.memo}</p>
              </div>
            )}

            {/* NFC Status */}
            <NFCBroadcast paymentId={payment.id} />

            {/* Cancel button */}
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isCancelling}
              className="mt-4 w-full gap-2 border-destructive text-destructive hover:bg-destructive hover:text-white lg:w-auto"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  Cancel Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
