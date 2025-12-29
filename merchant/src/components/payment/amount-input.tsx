"use client";

import { Button } from "@/components/ui/button";
import { Delete, DollarSign } from "lucide-react";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const QUICK_AMOUNTS = ["5", "10", "25", "50"];

export function AmountInput({ value, onChange, disabled }: AmountInputProps) {
  const handleDigit = (digit: string) => {
    if (disabled) return;

    // Handle decimal point
    if (digit === ".") {
      if (value.includes(".")) return;
      onChange(value === "" ? "0." : value + ".");
      return;
    }

    // Limit to 2 decimal places
    const parts = value.split(".");
    if (parts[1] && parts[1].length >= 2) return;

    // Max amount validation
    const newValue = value + digit;
    if (parseFloat(newValue) > 999999.99) return;

    onChange(newValue);
  };

  const handleBackspace = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled) return;
    onChange("");
  };

  const handleQuickAmount = (amount: string) => {
    if (disabled) return;
    onChange(amount);
  };

  const formattedValue = value === "" ? "0.00" : parseFloat(value || "0").toFixed(2);

  return (
    <div className="space-y-6">
      {/* Display */}
      <div className="flex items-center justify-center rounded-xl bg-background p-6">
        <DollarSign className="h-8 w-8 text-primary" />
        <span className="text-5xl font-bold text-foreground tabular-nums">
          {formattedValue}
        </span>
      </div>

      {/* Quick amounts */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            onClick={() => handleQuickAmount(amount)}
            disabled={disabled}
            className="h-12 text-lg font-medium"
          >
            ${amount}
          </Button>
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((key) => (
          <Button
            key={key}
            variant="ghost"
            onClick={() => handleDigit(key)}
            disabled={disabled}
            className="h-14 text-2xl font-medium text-foreground hover:bg-accent"
          >
            {key}
          </Button>
        ))}
        <Button
          variant="ghost"
          onClick={handleBackspace}
          onDoubleClick={handleClear}
          disabled={disabled}
          className="h-14 text-foreground hover:bg-accent"
        >
          <Delete className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
