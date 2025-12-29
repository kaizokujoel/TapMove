"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMerchant } from "@/hooks/use-merchant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MERCHANT_CATEGORIES, type MerchantCategory } from "@/types";
import { Store, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const { authenticated, ready, user } = usePrivy();
  const { merchant, register, isRegistering, registerError } = useMerchant();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    category: "" as MerchantCategory | "",
    logoUrl: "",
    webhookUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.replace("/login");
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    if (merchant) {
      router.replace("/");
    }
  }, [merchant, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Business name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Business name must be at least 2 characters";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (formData.webhookUrl && !isValidUrl(formData.webhookUrl)) {
      newErrors.webhookUrl = "Please enter a valid URL";
    }

    if (formData.logoUrl && !isValidUrl(formData.logoUrl)) {
      newErrors.logoUrl = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register({
        name: formData.name,
        category: formData.category as MerchantCategory,
        logoUrl: formData.logoUrl || undefined,
        webhookUrl: formData.webhookUrl || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  if (!ready || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="text-xl font-bold text-foreground">
              Registration Successful!
            </h2>
            <p className="mt-2 text-muted-foreground">
              Redirecting to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background p-4">
      <div className="mx-auto w-full max-w-lg">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>

        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Store className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Register Your Business
          </h1>
          <p className="mt-2 text-muted-foreground">
            Start accepting crypto payments today
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your Business Name"
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category || undefined}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      category: value as MerchantCategory,
                    })
                  }
                >
                  <SelectTrigger aria-invalid={!!errors.category}>
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
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, logoUrl: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                  aria-invalid={!!errors.logoUrl}
                />
                {errors.logoUrl && (
                  <p className="text-xs text-destructive">{errors.logoUrl}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL (optional)</Label>
                <Input
                  id="webhookUrl"
                  value={formData.webhookUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, webhookUrl: e.target.value })
                  }
                  placeholder="https://yourapi.com/webhook"
                  aria-invalid={!!errors.webhookUrl}
                />
                {errors.webhookUrl && (
                  <p className="text-xs text-destructive">{errors.webhookUrl}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  We&apos;ll notify this URL when payments are received
                </p>
              </div>

              {registerError && (
                <p className="text-sm text-destructive">
                  {registerError.message || "Registration failed"}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isRegistering}
              >
                {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Registration
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Wallet: {user?.wallet?.address?.slice(0, 10)}...
          {user?.wallet?.address?.slice(-8)}
        </p>
      </div>
    </div>
  );
}
