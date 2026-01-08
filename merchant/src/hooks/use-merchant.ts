"use client";

import { useEffect, useState } from "react";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { useCreateWallet } from "@privy-io/react-auth/extended-chains";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMerchantProfile, registerMerchant, updateMerchantProfile } from "@/lib/api";
import { createMovementWallet, getMovementWallet } from "@/lib/privy-movement";
import type { MerchantProfile, MerchantRegistrationData } from "@/types";

export function useMerchant() {
  const { user, authenticated } = usePrivy();
  const { createWallet } = useCreateWallet();
  const queryClient = useQueryClient();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  // Get Movement wallet from linked accounts
  const movementWallet = getMovementWallet(user);
  const address = movementWallet?.address;

  // Auto-create wallet if authenticated but no Movement wallet
  useEffect(() => {
    const ensureWallet = async () => {
      if (authenticated && user && !movementWallet && !isCreatingWallet) {
        setIsCreatingWallet(true);
        try {
          await createMovementWallet(user, createWallet);
        } catch (error) {
          console.error("Error auto-creating wallet:", error);
        } finally {
          setIsCreatingWallet(false);
        }
      }
    };
    ensureWallet();
  }, [authenticated, user, movementWallet, createWallet, isCreatingWallet]);

  const {
    data: merchant,
    isLoading,
    error,
    refetch,
  } = useQuery<MerchantProfile | null>({
    queryKey: ["merchant", address],
    queryFn: () => (address ? getMerchantProfile(address) : null),
    enabled: !!address && authenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const registerMutation = useMutation({
    mutationFn: (data: MerchantRegistrationData) => {
      if (!address) throw new Error("No wallet address");
      return registerMerchant(address, data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["merchant", address], data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<MerchantRegistrationData>) => {
      if (!address) throw new Error("No wallet address");
      return updateMerchantProfile(address, data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["merchant", address], data);
    },
  });

  return {
    merchant,
    isLoading: isLoading || isCreatingWallet,
    error,
    isRegistered: !!merchant,
    walletAddress: address,
    isCreatingWallet,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    refetch,
  };
}
