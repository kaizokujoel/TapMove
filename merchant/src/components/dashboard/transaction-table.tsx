"use client";

import { Transaction } from "@/types";
import { shortenAddress, formatUSDC, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  page: number;
  totalCount: number;
  limit: number;
  onPageChange: (page: number) => void;
  onViewDetails: (transaction: Transaction) => void;
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded bg-muted" />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: "confirmed" | "pending" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
        status === "confirmed"
          ? "bg-green-500/20 text-green-500"
          : "bg-yellow-500/20 text-yellow-500"
      }`}
    >
      {status}
    </span>
  );
}

export function TransactionTable({
  transactions,
  isLoading,
  page,
  totalCount,
  limit,
  onPageChange,
  onViewDetails,
}: TransactionTableProps) {
  const totalPages = Math.ceil(totalCount / limit);

  if (isLoading) {
    return (
      <Card className="p-4">
        <TableSkeleton />
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="flex h-40 items-center justify-center p-4">
        <p className="text-muted-foreground">No transactions found</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead className="border-b border-border bg-background/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                Payment ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-accent/30">
                <td className="px-4 py-3 text-sm text-foreground">
                  {formatDate(tx.timestamp)}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                  {shortenAddress(tx.paymentId, 6)}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {formatUSDC(tx.amount)}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                  {shortenAddress(tx.customerAddress, 4)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(tx)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-border md:hidden">
        {transactions.map((tx) => (
          <div key={tx.id} className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{formatUSDC(tx.amount)}</span>
              <StatusBadge status={tx.status} />
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-muted-foreground">{formatDate(tx.timestamp)}</p>
              <p className="font-mono text-muted-foreground">
                Customer: {shortenAddress(tx.customerAddress, 4)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(tx)}
              className="mt-2 w-full text-muted-foreground hover:text-foreground"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
