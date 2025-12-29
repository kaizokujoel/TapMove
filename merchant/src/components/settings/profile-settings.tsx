"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Save, Loader2 } from "lucide-react";
import { MerchantProfile, MERCHANT_CATEGORIES, MerchantCategory } from "@/types";

interface ProfileSettingsProps {
  merchant: MerchantProfile;
  onSave: (data: Partial<MerchantProfile>) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileSettings({ merchant, onSave, isLoading }: ProfileSettingsProps) {
  const [name, setName] = useState(merchant.name);
  const [category, setCategory] = useState(merchant.category);
  const [logoUrl, setLogoUrl] = useState(merchant.logoUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasChanges =
    name !== merchant.name ||
    category !== merchant.category ||
    logoUrl !== (merchant.logoUrl || "");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ name, category, logoUrl: logoUrl || undefined });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Business Profile
        </CardTitle>
        <CardDescription>Update your business information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Business Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your business name"
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {MERCHANT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Logo URL</Label>
          <Input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
          />
          <p className="text-xs text-muted-foreground">
            Enter a URL to your business logo (optional)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Wallet Address</Label>
          <Input value={merchant.address} disabled className="font-mono opacity-60" />
          <p className="text-xs text-muted-foreground">
            Your wallet address cannot be changed
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
