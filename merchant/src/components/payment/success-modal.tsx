"use client";

import { useEffect, useRef } from "react";
import { CheckCircle, ExternalLink, X, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatUSDC, shortenAddress } from "@/lib/utils";
import { downloadReceipt, printReceipt } from "@/lib/receipt";
import type { PaymentSession } from "@/types";

interface SuccessModalProps {
  payment: PaymentSession;
  merchantName?: string;
  onClose: () => void;
  onNewPayment: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export function SuccessModal({
  payment,
  merchantName = "TapMove Merchant",
  onClose,
  onNewPayment,
  autoDismiss = true,
  autoDismissDelay = 10000,
}: SuccessModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play success sound on mount
  useEffect(() => {
    // Create audio context for success sound
    try {
      const audioContext = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch {
      // Audio may not be available
    }

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, []);

  // Auto-dismiss timer
  useEffect(() => {
    if (!autoDismiss) return;

    const timer = setTimeout(() => {
      onNewPayment();
    }, autoDismissDelay);

    return () => clearTimeout(timer);
  }, [autoDismiss, autoDismissDelay, onNewPayment]);

  const explorerUrl = payment.txHash
    ? `https://explorer.movementnetwork.xyz/tx/${payment.txHash}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md animate-in fade-in zoom-in rounded-2xl bg-card p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Success animation */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-green-500 opacity-20" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-6 text-center text-2xl font-bold text-foreground">
          Payment Received!
        </h2>

        {/* Payment details */}
        <div className="mb-6 space-y-3 rounded-xl bg-background p-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-bold text-green-500">
              {formatUSDC(payment.amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment ID</span>
            <span className="font-mono text-sm text-foreground">
              {payment.id.slice(0, 12)}...
            </span>
          </div>
          {payment.customerAddress && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-mono text-sm text-foreground">
                {shortenAddress(payment.customerAddress, 6)}
              </span>
            </div>
          )}
          {payment.txHash && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction</span>
              <a
                href={explorerUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-sm text-primary hover:underline"
              >
                {shortenAddress(payment.txHash, 6)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Receipt Actions */}
        <div className="mb-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadReceipt(payment, merchantName)}
            className="flex-1 gap-1"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => printReceipt(payment, merchantName)}
            className="flex-1 gap-1"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            View Details
          </Button>
          <Button onClick={onNewPayment} className="flex-1">
            New Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
