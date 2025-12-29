import type {
  MerchantProfile,
  PaymentSession,
  Transaction,
  CreatePaymentRequest,
  MerchantRegistrationData,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Error code mappings for user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  'NETWORK_ERROR': 'Unable to connect to server. Please check your connection.',
  'PAYMENT_EXPIRED': 'This payment request has expired.',
  'INVALID_AMOUNT': 'Please enter a valid amount.',
  'UNAUTHORIZED': 'Please log in to continue.',
};

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new ApiError(
        error.message || error.error || "Request failed",
        response.status,
        error.code
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      'NETWORK_ERROR'
    );
  }
}

// Network configuration
export interface NetworkConfig {
  network: string;
  nodeUrl: string;
  explorerUrl: string;
  tapmoveAddress: string;
  coinType: string;
}

export async function getNetworkConfig(): Promise<NetworkConfig> {
  return fetchApi<NetworkConfig>("/config");
}

export function getExplorerTxUrl(txHash: string): string {
  return `https://explorer.movementlabs.xyz/txn/${txHash}?network=testnet`;
}

export async function createPayment(
  data: CreatePaymentRequest,
  merchantAddress: string
): Promise<PaymentSession> {
  return fetchApi<PaymentSession>("/api/payments", {
    method: "POST",
    body: JSON.stringify({ ...data, merchantAddress }),
  });
}

export async function getPaymentStatus(id: string): Promise<PaymentSession> {
  return fetchApi<PaymentSession>(`/api/payments/${id}`);
}

export async function cancelPayment(id: string): Promise<void> {
  await fetchApi(`/api/payments/${id}/cancel`, { method: "POST" });
}

export async function getTransactions(
  merchantAddress: string,
  limit = 20,
  offset = 0
): Promise<Transaction[]> {
  return fetchApi<Transaction[]>(
    `/api/merchants/${merchantAddress}/transactions?limit=${limit}&offset=${offset}`
  );
}

export async function registerMerchant(
  address: string,
  data: MerchantRegistrationData
): Promise<MerchantProfile> {
  return fetchApi<MerchantProfile>("/api/merchants", {
    method: "POST",
    body: JSON.stringify({ address, ...data }),
  });
}

export async function getMerchantProfile(
  address: string
): Promise<MerchantProfile | null> {
  try {
    return await fetchApi<MerchantProfile>(`/api/merchants/${address}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function updateMerchantProfile(
  address: string,
  data: Partial<MerchantRegistrationData>
): Promise<MerchantProfile> {
  return fetchApi<MerchantProfile>(`/api/merchants/${address}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
