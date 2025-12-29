"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { History, Search, Download, Filter } from "lucide-react";
import { useMerchantTransactions, TransactionFilters } from "@/hooks/use-merchant-transactions";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { TransactionDetail } from "@/components/dashboard/transaction-detail";
import { Transaction } from "@/types";
import { formatUSDC } from "@/lib/utils";

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    transactions,
    allTransactions,
    isLoading,
    totalCount,
    stats,
  } = useMerchantTransactions({ page, limit: 10, filters });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchQuery }));
    setPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? undefined : (status as "confirmed" | "pending"),
    }));
    setPage(1);
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Payment ID", "Amount", "Customer", "Status", "TX Hash"];
    const rows = allTransactions.map((tx) => [
      new Date(tx.timestamp * 1000).toISOString(),
      tx.paymentId,
      tx.amount,
      tx.customerAddress,
      tx.status,
      tx.txHash,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">
            {totalCount} transactions • {formatUSDC(stats.weekVolume.toString())} this week
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} disabled={allTransactions.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="Search by payment ID or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select
              value={filters.status || "all"}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        page={page}
        totalCount={totalCount}
        limit={10}
        onPageChange={setPage}
        onViewDetails={setSelectedTransaction}
      />

      {/* Transaction Detail Modal */}
      <TransactionDetail
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
