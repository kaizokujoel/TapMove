"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface ExpiryTimerProps {
  expiresAt: number;
  onExpired: () => void;
}

export function ExpiryTimer({ expiresAt, onExpired }: ExpiryTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const expiryMs = expiresAt * 1000;
      return Math.max(0, Math.floor((expiryMs - now) / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = timeLeft < 60;
  const isCritical = timeLeft < 30;

  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  if (timeLeft <= 0) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <span className="font-medium">Payment Expired</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 ${
        isCritical
          ? "text-destructive"
          : isWarning
          ? "text-yellow-500"
          : "text-muted-foreground"
      }`}
    >
      <Clock className={`h-4 w-4 ${isCritical ? "animate-pulse" : ""}`} />
      <span className="font-mono font-medium">
        Expires in: {formattedTime}
      </span>
    </div>
  );
}
