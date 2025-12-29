"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMerchantProfile, registerMerchant, updateMerchantProfile } from "@/lib/api";
import type { MerchantProfile, MerchantRegistrationData } from "@/types";

export function useMerchant() {
  const { user, authenticated } = usePrivy();
  const queryClient = useQueryClient();

  const address = user?.wallet?.address;

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
    isLoading,
    error,
    isRegistered: !!merchant,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    refetch,
  };
}
