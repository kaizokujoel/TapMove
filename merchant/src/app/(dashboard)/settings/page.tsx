"use client";

import { useMerchant } from "@/hooks/use-merchant";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { WebhookSettings } from "@/components/settings/webhook-settings";
import { Shield, Wallet, CheckCircle, Clock } from "lucide-react";
import { shortenAddress } from "@/lib/utils";

export default function SettingsPage() {
  const { merchant, update, isUpdating } = useMerchant();

  if (!merchant) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleProfileSave = async (data: Partial<typeof merchant>) => {
    await update(data);
  };

  const handleWebhookSave = async (webhookUrl: string) => {
    await update({ webhookUrl: webhookUrl || undefined });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your merchant account settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <ProfileSettings
          merchant={merchant}
          onSave={handleProfileSave}
          isLoading={isUpdating}
        />

        {/* Webhook Settings */}
        <WebhookSettings merchant={merchant} onSave={handleWebhookSave} />

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Account Status
            </CardTitle>
            <CardDescription>Your verification and account status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-background p-4">
              <div className="flex items-center gap-3">
                {merchant.verified ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-500" />
                )}
                <div>
                  <p className="font-medium text-foreground">Verification Status</p>
                  <p className="text-sm text-muted-foreground">
                    {merchant.verified
                      ? "Your account is verified"
                      : "Verification pending"}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  merchant.verified
                    ? "bg-green-500/20 text-green-500"
                    : "bg-yellow-500/20 text-yellow-500"
                }`}
              >
                {merchant.verified ? "Verified" : "Pending"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Wallet Information
            </CardTitle>
            <CardDescription>Your connected wallet details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-background p-4">
              <p className="text-sm text-muted-foreground">Connected Wallet</p>
              <p className="mt-1 font-mono text-foreground">
                {shortenAddress(merchant.address, 12)}
              </p>
            </div>
            <div className="rounded-lg bg-background p-4">
              <p className="text-sm text-muted-foreground">Network</p>
              <p className="mt-1 text-foreground">Movement Network</p>
            </div>
            <p className="text-xs text-muted-foreground">
              All payments are received directly to this wallet address on the
              Movement network.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
