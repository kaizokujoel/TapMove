import { useState, useEffect, useMemo } from 'react';
import { usePrivy } from '@privy-io/expo';
import { useCreateWallet } from '@privy-io/expo/extended-chains';
import { createMovementWallet, getMovementWallet } from '@/lib/privy-movement';

/**
 * Hook to manage Privy wallet state and auto-create Movement wallet
 */
export function useWallet() {
  const { user, isReady } = usePrivy();
  const { createWallet } = useCreateWallet();
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Get Movement wallet from linked accounts
  const movementWallet = useMemo(() => getMovementWallet(user), [user]);

  // Auto-create wallet if authenticated but no Movement wallet
  useEffect(() => {
    const ensureWallet = async () => {
      if (isReady && user && !movementWallet && !isCreatingWallet) {
        setIsCreatingWallet(true);
        setWalletError(null);
        try {
          await createMovementWallet(user, createWallet);
        } catch (error) {
          console.error('Error auto-creating wallet:', error);
          setWalletError(
            error instanceof Error ? error.message : 'Failed to create wallet'
          );
        } finally {
          setIsCreatingWallet(false);
        }
      }
    };
    ensureWallet();
  }, [isReady, user, movementWallet, createWallet, isCreatingWallet]);

  return {
    walletAddress: movementWallet?.address || null,
    publicKey: movementWallet?.publicKey || null,
    isCreatingWallet,
    walletError,
    hasWallet: !!movementWallet,
  };
}
