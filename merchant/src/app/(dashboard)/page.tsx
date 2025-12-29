"use client";

import { useMerchant } from "@/hooks/use-merchant";
import { useMerchantStats } from "@/hooks/use-merchant-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import Link from "next/link";
import { shortenAddress } from "@/lib/utils";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { VolumeChart } from "@/components/dashboard/volume-chart";

export default function DashboardPage() {
  const { merchant } = useMerchant();
  const { stats, dailyVolumes, isLoading } = useMerchantStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {merchant?.name || "Merchant"}
          </p>
        </div>
        <Link href="/payment">
          <Button size="lg">
            <QrCode className="mr-2 h-5 w-5" />
            Create Payment
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        todayCount={stats.todayCount}
        todayVolume={stats.todayVolume}
        weekVolume={stats.weekVolume}
        averageTransaction={stats.averageTransaction}
        percentChange={stats.percentChange}
        isLoading={isLoading}
      />

      {/* Charts and Info Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Volume Chart */}
        <VolumeChart data={dailyVolumes} isLoading={isLoading} />

        {/* Merchant Info */}
        <Card>
          <CardHeader>
            <CardTitle>Merchant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Business Name</p>
                <p className="text-foreground">{merchant?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-foreground capitalize">{merchant?.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wallet Address</p>
                <p className="font-mono text-foreground">
                  {merchant?.address ? shortenAddress(merchant.address, 8) : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verification Status</p>
                <p
                  className={
                    merchant?.verified ? "text-green-500" : "text-yellow-500"
                  }
                >
                  {merchant?.verified ? "Verified" : "Pending Verification"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
