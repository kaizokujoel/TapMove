// Balance Hook - React Query hook for fetching USDC balance
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useWalletStore } from '@/stores/wallet-store';

const API_BASE_URL = 'https://privy-backend-1.onrender.com';

interface BalanceResponse {
  balance: string;
  formattedBalance: string;
}

async function fetchBalance(address: string): Promise<BalanceResponse> {
  const response = await fetch(`${API_BASE_URL}/balance/${address}`);

  if (!response.ok) {
    throw new Error('Failed to fetch balance');
  }

  const data = await response.json();

  // Balance from API is in octas (8 decimals for APT, 6 for USDC)
  // For now assume it's APT with 8 decimals
  const rawBalance = data.balance || '0';
  const balanceNum = parseFloat(rawBalance) / 1e8;

  return {
    balance: rawBalance,
    formattedBalance: balanceNum.toFixed(2),
  };
}

export function useBalance(address: string | undefined) {
  const setBalance = useWalletStore((state) => state.setBalance);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['balance', address],
    queryFn: async () => {
      if (!address) throw new Error('No address provided');
      const result = await fetchBalance(address);
      setBalance(result.formattedBalance);
      return result;
    },
    enabled: !!address,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  const refresh = useCallback(() => {
    if (address) {
      queryClient.invalidateQueries({ queryKey: ['balance', address] });
    }
  }, [address, queryClient]);

  return {
    balance: query.data?.formattedBalance ?? '0.00',
    rawBalance: query.data?.balance ?? '0',
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error?.message ?? null,
    refresh,
  };
}

// Format balance with proper decimal places
export function formatBalance(balance: string, decimals = 2): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0.00';

  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Format USDC amount (6 decimals)
export function formatUSDC(rawAmount: string): string {
  const num = parseFloat(rawAmount) / 1e6;
  return num.toFixed(2);
}
