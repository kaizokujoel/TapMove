"use client";

import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getTransactions } from "@/lib/api";
import type { Transaction } from "@/types";
import { useState, useMemo } from "react";

export interface TransactionFilters {
  status?: "confirmed" | "pending" | "all";
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface UseMerchantTransactionsOptions {
  limit?: number;
  page?: number;
  filters?: TransactionFilters;
}

export function useMerchantTransactions(options: UseMerchantTransactionsOptions = {}) {
  const { limit = 20, page = 1, filters } = options;
  const { user } = usePrivy();
  const address = user?.wallet?.address;

  const offset = (page - 1) * limit;

  const {
    data: transactions = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Transaction[]>({
    queryKey: ["transactions", address, limit, offset],
    queryFn: () => (address ? getTransactions(address, limit, offset) : []),
    enabled: !!address,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Real-time-ish updates
  });

  // Client-side filtering
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    if (filters?.status && filters.status !== "all") {
      result = result.filter((tx) => tx.status === filters.status);
    }

    if (filters?.startDate) {
      const start = filters.startDate.getTime() / 1000;
      result = result.filter((tx) => tx.timestamp >= start);
    }

    if (filters?.endDate) {
      const end = filters.endDate.getTime() / 1000;
      result = result.filter((tx) => tx.timestamp <= end);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.paymentId.toLowerCase().includes(search) ||
          tx.txHash.toLowerCase().includes(search) ||
          tx.customerAddress.toLowerCase().includes(search)
      );
    }

    return result;
  }, [transactions, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
    const yesterdayStart = todayStart - 86400;
    const weekStart = todayStart - 7 * 86400;

    const todayTxs = transactions.filter((tx) => tx.timestamp >= todayStart);
    const yesterdayTxs = transactions.filter(
      (tx) => tx.timestamp >= yesterdayStart && tx.timestamp < todayStart
    );
    const weekTxs = transactions.filter((tx) => tx.timestamp >= weekStart);

    const sumAmount = (txs: Transaction[]) =>
      txs.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    const todayVolume = sumAmount(todayTxs);
    const yesterdayVolume = sumAmount(yesterdayTxs);
    const weekVolume = sumAmount(weekTxs);

    return {
      todayCount: todayTxs.length,
      todayVolume,
      yesterdayVolume,
      weekVolume,
      averageTransaction: todayTxs.length > 0 ? todayVolume / todayTxs.length : 0,
      percentChange: yesterdayVolume > 0
        ? ((todayVolume - yesterdayVolume) / yesterdayVolume) * 100
        : 0,
    };
  }, [transactions]);

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    isLoading,
    error,
    refetch,
    stats,
    totalCount: transactions.length,
  };
}

export function useMerchantStats() {
  const { transactions, isLoading, stats } = useMerchantTransactions({ limit: 100 });

  // Calculate daily volume for chart (last 7 days)
  const dailyVolumes = useMemo(() => {
    const days: { date: string; volume: number; count: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 1000;
      const dayEnd = dayStart + 86400;

      const dayTxs = transactions.filter((tx) => tx.timestamp >= dayStart && tx.timestamp < dayEnd);
      const volume = dayTxs.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

      days.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        volume,
        count: dayTxs.length,
      });
    }

    return days;
  }, [transactions]);

  return {
    isLoading,
    stats,
    dailyVolumes,
    totalTransactions: transactions.length,
  };
}
