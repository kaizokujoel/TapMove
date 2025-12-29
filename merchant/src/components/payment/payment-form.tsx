"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AmountInput } from "./amount-input";
import { Loader2, QrCode } from "lucide-react";

interface PaymentFormProps {
  onSubmit: (amount: string, memo: string) => Promise<void>;
  isLoading: boolean;
}

export function PaymentForm({ onSubmit, isLoading }: PaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amountNum < 0.01) {
      setError("Minimum amount is $0.01");
      return;
    }

    try {
      await onSubmit(amountNum.toFixed(2), memo.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create payment");
    }
  };

  const isValid = parseFloat(amount) > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          New Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Amount</Label>
            <AmountInput
              value={amount}
              onChange={setAmount}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Memo (optional)</Label>
            <Input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Order description..."
              disabled={isLoading}
              maxLength={100}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Payment...
              </>
            ) : (
              "Create Payment"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
