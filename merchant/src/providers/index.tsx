"use client";

import { ReactNode } from "react";
import { PrivyProvider } from "./privy-provider";
import { ErrorBoundary } from "@/components/shared/error-boundary";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <PrivyProvider>{children}</PrivyProvider>
    </ErrorBoundary>
  );
}
