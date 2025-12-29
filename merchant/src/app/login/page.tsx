"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Wallet } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.replace("/");
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Store className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">TapMove</h1>
        <p className="mt-1 text-muted-foreground">Merchant Terminal</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome Back</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to access your merchant dashboard
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={login} className="w-full" size="lg">
            <Wallet className="mr-2 h-5 w-5" />
            Sign In with Privy
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              New to TapMove?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline"
              >
                Register as Merchant
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
