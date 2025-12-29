/**
 * Receipt Generation Utilities for Merchant Terminal
 */

import type { PaymentSession } from "@/types";

export interface ReceiptData {
  merchantName: string;
  merchantAddress: string;
  paymentId: string;
  amount: string;
  customerAddress?: string;
  txHash?: string;
  timestamp: Date;
  memo?: string;
}

/**
 * Generate receipt text for printing
 */
export function generateReceiptText(data: ReceiptData): string {
  const divider = "=".repeat(40);
  const subDivider = "-".repeat(40);

  const lines = [
    divider,
    centerText("PAYMENT RECEIPT"),
    divider,
    "",
    `Merchant: ${data.merchantName}`,
    `Date: ${data.timestamp.toLocaleDateString()}`,
    `Time: ${data.timestamp.toLocaleTimeString()}`,
    "",
    subDivider,
    "",
    `Amount: ${data.amount}`,
    "",
    subDivider,
    "",
    `Payment ID: ${data.paymentId}`,
  ];

  if (data.customerAddress) {
    lines.push(`Customer: ${shortenAddress(data.customerAddress)}`);
  }

  if (data.txHash) {
    lines.push(`Tx Hash: ${shortenAddress(data.txHash)}`);
  }

  if (data.memo) {
    lines.push("", `Memo: ${data.memo}`);
  }

  lines.push(
    "",
    subDivider,
    "",
    centerText("Powered by TapMove"),
    centerText("on Movement Network"),
    "",
    divider
  );

  return lines.join("\n");
}

/**
 * Generate receipt HTML for download/print
 */
export function generateReceiptHTML(data: ReceiptData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt - ${data.paymentId}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Courier New', monospace;
      max-width: 350px;
      margin: 0 auto;
      padding: 20px;
      background: white;
      color: black;
    }
    .header {
      text-align: center;
      border-top: 2px solid black;
      border-bottom: 2px solid black;
      padding: 10px 0;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 18px;
    }
    .info {
      margin-bottom: 10px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
    }
    .amount-section {
      border-top: 1px dashed black;
      border-bottom: 1px dashed black;
      padding: 15px 0;
      margin: 15px 0;
      text-align: center;
    }
    .amount {
      font-size: 24px;
      font-weight: bold;
    }
    .details {
      font-size: 12px;
      margin: 15px 0;
    }
    .details p {
      margin: 5px 0;
      word-break: break-all;
    }
    .footer {
      text-align: center;
      border-top: 2px solid black;
      padding-top: 10px;
      margin-top: 15px;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>PAYMENT RECEIPT</h1>
  </div>

  <div class="info">
    <div class="info-row">
      <span>Merchant:</span>
      <span>${escapeHtml(data.merchantName)}</span>
    </div>
    <div class="info-row">
      <span>Date:</span>
      <span>${data.timestamp.toLocaleDateString()}</span>
    </div>
    <div class="info-row">
      <span>Time:</span>
      <span>${data.timestamp.toLocaleTimeString()}</span>
    </div>
  </div>

  <div class="amount-section">
    <div class="amount">${escapeHtml(data.amount)}</div>
  </div>

  <div class="details">
    <p><strong>Payment ID:</strong><br>${escapeHtml(data.paymentId)}</p>
    ${data.customerAddress ? `<p><strong>Customer:</strong><br>${escapeHtml(data.customerAddress)}</p>` : ""}
    ${data.txHash ? `<p><strong>Transaction:</strong><br>${escapeHtml(data.txHash)}</p>` : ""}
    ${data.memo ? `<p><strong>Memo:</strong><br>${escapeHtml(data.memo)}</p>` : ""}
  </div>

  <div class="footer">
    <p>Powered by TapMove</p>
    <p>on Movement Network</p>
  </div>
</body>
</html>`;
}

/**
 * Download receipt as HTML file
 */
export function downloadReceipt(payment: PaymentSession, merchantName: string): void {
  const data: ReceiptData = {
    merchantName,
    merchantAddress: payment.merchantAddress,
    paymentId: payment.id,
    amount: formatUSDC(payment.amount),
    customerAddress: payment.customerAddress,
    txHash: payment.txHash,
    timestamp: new Date(payment.completedAt || Date.now()),
    memo: payment.memo,
  };

  const html = generateReceiptHTML(data);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${payment.id.slice(0, 8)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Print receipt (opens print dialog)
 */
export function printReceipt(payment: PaymentSession, merchantName: string): void {
  const data: ReceiptData = {
    merchantName,
    merchantAddress: payment.merchantAddress,
    paymentId: payment.id,
    amount: formatUSDC(payment.amount),
    customerAddress: payment.customerAddress,
    txHash: payment.txHash,
    timestamp: new Date(payment.completedAt || Date.now()),
    memo: payment.memo,
  };

  const html = generateReceiptHTML(data);
  const printWindow = window.open("", "_blank");

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}

// Helper functions
function centerText(text: string, width: number = 40): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return " ".repeat(padding) + text;
}

function shortenAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

function escapeHtml(text: string): string {
  const div = typeof document !== "undefined" ? document.createElement("div") : null;
  if (div) {
    div.textContent = text;
    return div.innerHTML;
  }
  return text.replace(/[&<>"']/g, (m) => {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return map[m] || m;
  });
}

function formatUSDC(amount: string): string {
  const num = parseFloat(amount) / 1e6;
  return `$${num.toFixed(2)} USDC`;
}
