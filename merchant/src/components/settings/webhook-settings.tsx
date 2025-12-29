"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Webhook, Send, Loader2, Check, X, AlertCircle } from "lucide-react";
import { MerchantProfile } from "@/types";

interface WebhookSettingsProps {
  merchant: MerchantProfile;
  onSave: (webhookUrl: string) => Promise<void>;
}

interface WebhookDelivery {
  id: string;
  timestamp: number;
  event: string;
  status: "success" | "failed";
  statusCode?: number;
}

export function WebhookSettings({ merchant, onSave }: WebhookSettingsProps) {
  const [webhookUrl, setWebhookUrl] = useState(merchant.webhookUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "failed" | null>(null);

  // Mock webhook deliveries - in production, fetch from API
  const recentDeliveries: WebhookDelivery[] = [
    { id: "1", timestamp: Date.now() / 1000 - 300, event: "payment.completed", status: "success", statusCode: 200 },
    { id: "2", timestamp: Date.now() / 1000 - 3600, event: "payment.completed", status: "success", statusCode: 200 },
    { id: "3", timestamp: Date.now() / 1000 - 7200, event: "payment.expired", status: "failed", statusCode: 500 },
  ];

  const hasChanges = webhookUrl !== (merchant.webhookUrl || "");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(webhookUrl);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!webhookUrl) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      // Mock test - in production, call backend to send test webhook
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setTestResult("success");
    } catch {
      setTestResult("failed");
    } finally {
      setIsTesting(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Math.floor(Date.now() / 1000 - timestamp);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-secondary" />
          Webhook Configuration
        </CardTitle>
        <CardDescription>
          Receive real-time notifications when payments are completed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Webhook URL</Label>
          <div className="flex gap-2">
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              className="flex-1"
            />
            <Button variant="outline" onClick={handleTest} disabled={!webhookUrl || isTesting}>
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          {testResult && (
            <p className={`flex items-center gap-1 text-sm ${testResult === "success" ? "text-green-500" : "text-destructive"}`}>
              {testResult === "success" ? (
                <>
                  <Check className="h-4 w-4" /> Test webhook sent successfully
                </>
              ) : (
                <>
                  <X className="h-4 w-4" /> Failed to send test webhook
                </>
              )}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Event Types</Label>
          <div className="space-y-2 rounded-lg bg-background p-3">
            <EventType event="payment.completed" description="When a payment is confirmed" checked />
            <EventType event="payment.expired" description="When a payment expires" checked />
            <EventType event="payment.cancelled" description="When a payment is cancelled" checked />
          </div>
        </div>

        {recentDeliveries.length > 0 && (
          <div className="space-y-2">
            <Label>Recent Deliveries</Label>
            <div className="space-y-2 rounded-lg bg-background p-3">
              {recentDeliveries.slice(0, 3).map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {delivery.status === "success" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span className="font-mono text-muted-foreground">{delivery.event}</span>
                  </div>
                  <span className="text-muted-foreground">{formatTime(delivery.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="w-full">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Webhook Settings
        </Button>
      </CardContent>
    </Card>
  );
}

function EventType({ event, description, checked }: { event: string; description: string; checked: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-mono text-sm text-foreground">{event}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className={`h-4 w-4 rounded border ${checked ? "border-green-500 bg-green-500" : "border-border"}`}>
        {checked && <Check className="h-4 w-4 text-white" />}
      </div>
    </div>
  );
}
