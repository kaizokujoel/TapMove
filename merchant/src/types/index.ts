export interface MerchantProfile {
  address: string;
  name: string;
  category: string;
  logoUrl?: string;
  webhookUrl?: string;
  verified: boolean;
}

export interface PaymentSession {
  id: string;
  amount: string;
  memo: string;
  status: "pending" | "completed" | "expired" | "cancelled";
  createdAt: number;
  expiresAt: number;
  txHash?: string;
  customerAddress?: string;
}

export interface Transaction {
  id: string;
  paymentId: string;
  amount: string;
  memo: string;
  txHash: string;
  customerAddress: string;
  timestamp: number;
  status: "confirmed" | "pending";
}

export interface CreatePaymentRequest {
  amount: string;
  memo: string;
}

export interface MerchantRegistrationData {
  name: string;
  category: string;
  logoUrl?: string;
  webhookUrl?: string;
}

export type MerchantCategory =
  | "restaurant"
  | "retail"
  | "services"
  | "entertainment"
  | "travel"
  | "other";

export const MERCHANT_CATEGORIES: { value: MerchantCategory; label: string }[] = [
  { value: "restaurant", label: "Restaurant & Food" },
  { value: "retail", label: "Retail & Shopping" },
  { value: "services", label: "Professional Services" },
  { value: "entertainment", label: "Entertainment" },
  { value: "travel", label: "Travel & Hospitality" },
  { value: "other", label: "Other" },
];
