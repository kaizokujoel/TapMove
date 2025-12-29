"use client";

import { useEffect, useState, useCallback } from "react";
import { Wifi, WifiOff, AlertCircle, CheckCircle2, RefreshCw, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePaymentStore } from "@/stores/payment-store";

interface NFCBroadcastProps {
  paymentId: string;
  showWriteButton?: boolean;
}

type NFCStatus = "unsupported" | "inactive" | "writing" | "active" | "error" | "waiting";

// Type declarations for Web NFC API
declare global {
  interface Window {
    NDEFReader?: new () => NDEFReader;
  }
  interface NDEFReader {
    write(message: NDEFMessageInit): Promise<void>;
  }
  interface NDEFMessageInit {
    records: NDEFRecordInit[];
  }
  interface NDEFRecordInit {
    recordType: string;
    data: string;
  }
}

export function NFCBroadcast({ paymentId, showWriteButton = false }: NFCBroadcastProps) {
  const [status, setStatus] = useState<NFCStatus>("inactive");
  const [error, setError] = useState<string | null>(null);
  const [writeAttempts, setWriteAttempts] = useState(0);
  const { setNfcSupported, setNfcActive } = usePaymentStore();

  const isNFCSupported = typeof window !== "undefined" && "NDEFReader" in window;

  useEffect(() => {
    setNfcSupported(isNFCSupported);
    if (!isNFCSupported) {
      setStatus("unsupported");
    }
  }, [isNFCSupported, setNfcSupported]);

  const writeNfcTag = useCallback(async () => {
    if (!isNFCSupported || !window.NDEFReader) {
      setStatus("unsupported");
      return;
    }

    try {
      setStatus("writing");
      setError(null);
      setWriteAttempts((prev) => prev + 1);

      const ndef = new window.NDEFReader();

      // The write method prompts user to tap a tag
      await ndef.write({
        records: [
          {
            recordType: "url",
            data: `tapmove://pay?id=${paymentId}`,
          },
        ],
      });

      setStatus("active");
      setNfcActive(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "NFC write failed";

      // Check if user cancelled the operation
      if (errorMessage.includes("cancelled") || errorMessage.includes("abort")) {
        setStatus("inactive");
        setNfcActive(false);
        return;
      }

      // Check if waiting for user to tap
      if (errorMessage.includes("timeout")) {
        setStatus("waiting");
        setNfcActive(false);
        return;
      }

      setStatus("error");
      setNfcActive(false);
      setError(errorMessage);
    }
  }, [paymentId, isNFCSupported, setNfcActive]);

  // Auto-start NFC when supported
  useEffect(() => {
    if (isNFCSupported && status === "inactive") {
      writeNfcTag();
    }
  }, [isNFCSupported, status, writeNfcTag]);

  if (status === "unsupported") {
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-muted p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <WifiOff className="h-4 w-4" />
          <span>NFC not available</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Use QR code for payment. NFC requires Chrome on Android.
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-destructive/20 p-3">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>NFC Error</span>
        </div>
        <p className="text-xs text-destructive/80">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={writeNfcTag}
          className="mt-1 gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Try Again
        </Button>
      </div>
    );
  }

  if (status === "writing" || status === "waiting") {
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-blue-500/20 p-3">
        <div className="flex items-center gap-2 text-sm text-blue-400">
          <Smartphone className="h-4 w-4 animate-bounce" />
          <span>Waiting for NFC tag...</span>
        </div>
        <p className="text-xs text-blue-400/80">
          Hold an NFC tag near this device to write payment data
        </p>
      </div>
    );
  }

  if (status === "inactive" && showWriteButton) {
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-muted p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wifi className="h-4 w-4" />
          <span>NFC Ready</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={writeNfcTag}
          className="mt-1 gap-1"
        >
          <Smartphone className="h-3 w-3" />
          Write to NFC Tag
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-green-500/20 p-3">
      <div className="flex items-center gap-2 text-sm text-green-400">
        <CheckCircle2 className="h-4 w-4" />
        <span>NFC Active</span>
      </div>
      <p className="text-xs text-green-400/80">
        Tag ready for customer to tap
      </p>
      {showWriteButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={writeNfcTag}
          className="mt-1 gap-1 text-green-400 hover:text-green-300"
        >
          <RefreshCw className="h-3 w-3" />
          Re-write Tag
        </Button>
      )}
    </div>
  );
}
