"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

interface VolumeChartProps {
  data: { date: string; volume: number; count: number }[];
  isLoading?: boolean;
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Weekly Volume
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

export function VolumeChart({ data, isLoading }: VolumeChartProps) {
  if (isLoading) {
    return <ChartSkeleton />;
  }

  const hasData = data.some((d) => d.volume > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Weekly Volume
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No transaction data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value, name) => {
                  const numValue = typeof value === "number" ? value : 0;
                  return [
                    name === "volume" ? `$${numValue.toFixed(2)}` : numValue,
                    name === "volume" ? "Volume" : "Transactions",
                  ];
                }}
              />
              <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
