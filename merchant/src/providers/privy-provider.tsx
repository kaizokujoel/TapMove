"use client";

import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";

interface PrivyProviderProps {
  children: ReactNode;
}

function MissingConfigWarning() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4">
      <div className="max-w-md text-center">
        <div className="mb-4 text-4xl">⚠️</div>
        <h1 className="mb-2 text-xl font-bold text-[#f8fafc]">
          Configuration Required
        </h1>
        <p className="text-[#94a3b8]">
          Please set NEXT_PUBLIC_PRIVY_APP_ID in your .env.local file to enable
          authentication.
        </p>
      </div>
    </div>
  );
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const isValidAppId = appId && appId.length > 10 && !appId.includes("placeholder");

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or before mounting, return children wrapped in QueryClientProvider only
  if (!mounted) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
        </div>
      </QueryClientProvider>
    );
  }

  // If no valid app ID, show warning
  if (!isValidAppId) {
    return (
      <QueryClientProvider client={queryClient}>
        <MissingConfigWarning />
      </QueryClientProvider>
    );
  }

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#FF6B00",
          logo: "/logo.png",
          showWalletLoginFirst: false,
        },
        loginMethods: ["email", "wallet", "google"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "all-users",
          },
          showWalletUIs: true,
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BasePrivyProvider>
  );
}
