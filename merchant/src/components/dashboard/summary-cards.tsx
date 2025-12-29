"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, ShoppingCart, Receipt } from "lucide-react";
import { formatUSDC } from "@/lib/utils";

interface SummaryCardsProps {
  todayCount: number;
  todayVolume: number;
  weekVolume: number;
  averageTransaction: number;
  percentChange: number;
  isLoading?: boolean;
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-28 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

export function SummaryCards({
  todayCount,
  todayVolume,
  weekVolume,
  averageTransaction,
  percentChange,
  isLoading,
}: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  const isPositiveChange = percentChange >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Today&apos;s Sales
          </CardTitle>
          <ShoppingCart className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">{todayCount}</p>
          <p className="text-xs text-muted-foreground">transactions today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Today&apos;s Volume
          </CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">
            {formatUSDC(todayVolume.toString())}
          </p>
          <div className="flex items-center gap-1 text-xs">
            {isPositiveChange ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+{percentChange.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-destructive" />
                <span className="text-destructive">{percentChange.toFixed(1)}%</span>
              </>
            )}
            <span className="text-muted-foreground">vs yesterday</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Weekly Volume
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">
            {formatUSDC(weekVolume.toString())}
          </p>
          <p className="text-xs text-muted-foreground">last 7 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Transaction
          </CardTitle>
          <Receipt className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-foreground">
            {formatUSDC(averageTransaction.toString())}
          </p>
          <p className="text-xs text-muted-foreground">per sale today</p>
        </CardContent>
      </Card>
    </div>
  );
}
