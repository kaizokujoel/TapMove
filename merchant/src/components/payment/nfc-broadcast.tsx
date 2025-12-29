"use client";

import { useEffect, useState, useCallback } from "react";
import { Wifi, WifiOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { usePaymentStore } from "@/stores/payment-store";

interface NFCBroadcastProps {
  paymentId: string;
}

type NFCStatus = "unsupported" | "inactive" | "writing" | "active" | "error";

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

export function NFCBroadcast({ paymentId }: NFCBroadcastProps) {
  const [status, setStatus] = useState<NFCStatus>("inactive");
  const [error, setError] = useState<string | null>(null);
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

      const ndef = new window.NDEFReader();
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
      setStatus("error");
      setNfcActive(false);
      setError(err instanceof Error ? err.message : "NFC write failed");
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
      <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        <WifiOff className="h-4 w-4" />
        <span>NFC not supported on this device</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-destructive/20 p-3 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        <div className="flex-1">
          <span>NFC Error: {error}</span>
          <button
            onClick={writeNfcTag}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (status === "writing") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-blue-500/20 p-3 text-sm text-blue-400">
        <Wifi className="h-4 w-4 animate-pulse" />
        <span>Setting up NFC...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-green-500/20 p-3 text-sm text-green-400">
      <CheckCircle2 className="h-4 w-4" />
      <span>NFC Active: Ready to receive tap</span>
    </div>
  );
}
