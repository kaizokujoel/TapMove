"use client";

import { Transaction } from "@/types";
import { shortenAddress, formatUSDC, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";

interface TransactionDetailProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const EXPLORER_URL = "https://explorer.movementnetwork.xyz/txn";

export function TransactionDetail({ transaction, onClose }: TransactionDetailProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!transaction) return null;

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="ml-2 text-muted-foreground hover:text-foreground"
    >
      {copied === field ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount */}
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">
              {formatUSDC(transaction.amount)}
            </p>
            <p className="text-sm text-muted-foreground">USDC</p>
          </div>

          {/* Status */}
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                transaction.status === "confirmed"
                  ? "bg-green-500/20 text-green-500"
                  : "bg-yellow-500/20 text-yellow-500"
              }`}
            >
              {transaction.status === "confirmed" ? "Confirmed" : "Pending"}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-3 rounded-lg bg-background p-4">
            <DetailRow label="Date" value={formatDate(transaction.timestamp)} />
            <DetailRow label="Memo" value={transaction.memo || "-"} />
            <DetailRow
              label="Payment ID"
              value={shortenAddress(transaction.paymentId, 8)}
              copyable
              fullValue={transaction.paymentId}
            />
            <DetailRow
              label="Customer"
              value={shortenAddress(transaction.customerAddress, 8)}
              copyable
              fullValue={transaction.customerAddress}
            />
            <DetailRow
              label="TX Hash"
              value={shortenAddress(transaction.txHash, 8)}
              copyable
              fullValue={transaction.txHash}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(`${EXPLORER_URL}/${transaction.txHash}`, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({
  label,
  value,
  copyable,
  fullValue,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  fullValue?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullValue || value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center">
        <span className="font-mono text-sm text-foreground">{value}</span>
        {copyable && (
          <button onClick={handleCopy} className="ml-2 text-muted-foreground hover:text-foreground">
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
