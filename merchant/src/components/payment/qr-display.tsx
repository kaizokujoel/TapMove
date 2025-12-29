"use client";

import QRCode from "react-qr-code";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";

interface QRDisplayProps {
  paymentId: string;
  size?: number;
}

export function QRDisplay({ paymentId, size = 200 }: QRDisplayProps) {
  const paymentUri = `tapmove://pay?id=${paymentId}`;

  const handleDownload = useCallback(() => {
    const svg = document.getElementById("payment-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, size, size);

        const link = document.createElement("a");
        link.download = `payment-${paymentId}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }, [paymentId, size]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl bg-white p-4">
        <QRCode
          id="payment-qr-code"
          value={paymentUri}
          size={size}
          level="H"
          fgColor="#0f172a"
          bgColor="#ffffff"
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Download QR
      </Button>

      <p className="text-center text-xs text-muted-foreground font-mono break-all max-w-[240px]">
        {paymentUri}
      </p>
    </div>
  );
}
