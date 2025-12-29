// Transactions Hook - React Query for fetching transaction history
import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { Transaction, TransactionFilters, TransactionGroup } from '@/types';
import { useWalletStore } from '@/stores/wallet-store';

const API_BASE_URL = 'https://privy-backend-1.onrender.com';
const PAGE_SIZE = 10;

const defaultFilters: TransactionFilters = {
  dateFilter: 'all',
  statusFilter: 'all',
  searchQuery: '',
};

interface TransactionsResponse {
  transactions: Transaction[];
  hasMore: boolean;
  nextPage: number | null;
}

function isToday(timestamp: number): boolean {
  const today = new Date();
  const date = new Date(timestamp);
  return date.toDateString() === today.toDateString();
}

function isThisWeek(timestamp: number): boolean {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return timestamp >= startOfWeek.getTime();
}

function isThisMonth(timestamp: number): boolean {
  const now = new Date();
  const date = new Date(timestamp);
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function getDateLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getDateKey(timestamp: number): string {
  return new Date(timestamp).toDateString();
}

async function fetchTransactions(
  address: string,
  page: number = 1
): Promise<TransactionsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/transactions/${address}?page=${page}&limit=${PAGE_SIZE}`
  );

  if (!response.ok) {
    // Return empty for 404 (no transactions yet)
    if (response.status === 404) {
      return { transactions: [], hasMore: false, nextPage: null };
    }
    throw new Error('Failed to fetch transactions');
  }

  const data = await response.json();
  return {
    transactions: data.transactions || [],
    hasMore: data.hasMore || false,
    nextPage: data.nextPage || null,
  };
}

export function useTransactions(address: string | undefined) {
  const setTransactions = useWalletStore((state) => state.setTransactions);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);

  const query = useInfiniteQuery({
    queryKey: ['transactions', address],
    queryFn: async ({ pageParam = 1 }) => {
      if (!address) throw new Error('No address provided');
      return fetchTransactions(address, pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!address,
    staleTime: 30 * 1000,
  });

  const allTransactions = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((page) => page.transactions);
  }, [query.data?.pages]);

  useMemo(() => {
    if (allTransactions.length > 0) setTransactions(allTransactions);
  }, [allTransactions, setTransactions]);

  const filteredTransactions = useMemo(() => {
    let result = [...allTransactions];
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter((tx) =>
        tx.merchantName.toLowerCase().includes(q) || tx.memo?.toLowerCase().includes(q)
      );
    }
    if (filters.statusFilter !== 'all') {
      result = result.filter((tx) => tx.status === filters.statusFilter);
    }
    if (filters.dateFilter !== 'all') {
      result = result.filter((tx) => {
        if (filters.dateFilter === 'today') return isToday(tx.timestamp);
        if (filters.dateFilter === 'week') return isThisWeek(tx.timestamp);
        if (filters.dateFilter === 'month') return isThisMonth(tx.timestamp);
        return true;
      });
    }
    return result;
  }, [allTransactions, filters]);

  const groupedTransactions = useMemo((): TransactionGroup[] => {
    const groups = new Map<string, Transaction[]>();
    filteredTransactions.forEach((tx) => {
      const key = getDateKey(tx.timestamp);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(tx);
    });
    return Array.from(groups.entries()).map(([date, txs]) => ({
      date,
      dateLabel: getDateLabel(txs[0].timestamp),
      totalSpent: txs.reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
      transactions: txs,
    }));
  }, [filteredTransactions]);

  const refresh = useCallback(() => {
    if (address) queryClient.invalidateQueries({ queryKey: ['transactions', address] });
  }, [address, queryClient]);

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
  }, [query]);

  const getTransaction = useCallback(
    (id: string) => allTransactions.find((tx) => tx.id === id),
    [allTransactions]
  );

  return {
    transactions: filteredTransactions,
    groupedTransactions,
    recentTransactions: allTransactions.slice(0, 5),
    filters,
    setFilters,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isFetchingMore: query.isFetchingNextPage,
    hasMore: query.hasNextPage ?? false,
    error: query.error?.message ?? null,
    refresh,
    loadMore,
    getTransaction,
    totalCount: filteredTransactions.length,
  };
}

// Format relative time for transaction display
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
  if (days > 1) return `${days} days ago`;
  if (days === 1) return 'Yesterday';
  if (hours > 1) return `${hours} hours ago`;
  if (hours === 1) return '1 hour ago';
  if (minutes > 1) return `${minutes} minutes ago`;
  if (minutes === 1) return '1 minute ago';
  return 'Just now';
}

// Get merchant category emoji
export function getMerchantEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    food: '🍔',
    coffee: '☕',
    shopping: '🛍️',
    transport: '🚗',
    entertainment: '🎬',
    services: '💼',
    other: '🏪',
  };
  return emojiMap[category.toLowerCase()] || emojiMap.other;
}
