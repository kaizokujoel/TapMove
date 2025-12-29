// hooks/useMovement.ts - Movement Network integration with Privy wallets
import { useCallback } from "react";
import { useSignRawHash } from "@privy-io/expo/extended-chains";

// API URL from environment or default to localhost for development
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

// Error types for better error handling
export type MovementErrorCode =
  | 'NETWORK_ERROR'
  | 'INSUFFICIENT_BALANCE'
  | 'TRANSACTION_FAILED'
  | 'SIGNING_FAILED'
  | 'INVALID_RESPONSE';

export class MovementError extends Error {
  constructor(
    message: string,
    public code: MovementErrorCode,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'MovementError';
  }
}

export function useMovementWallet() {
  const { signRawHash } = useSignRawHash();

  /**
   * 🔹 Sign + Submit transaction using backend + Privy
   */
  const signAndSubmitTransaction = useCallback(
    async (
      publicKey: string,
      walletAddress: string,
      func: string,
      typeArguments: string[] = [],
      functionArguments: any[] = []
    ) => {
      try {
        // Step 1: Request hash + rawTxnHex from backend
        const hashResponse = await fetch(`${API_BASE_URL}/generate-hash`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: walletAddress,
            function: func,
            typeArguments,
            functionArguments,
          }),
        });

        if (!hashResponse.ok) {
          throw new Error("❌ Failed to generate transaction hash");
        }

        const { hash, rawTxnHex } = await hashResponse.json();

        // Step 2: Sign hash using Privy
        const { signature } = await signRawHash({
          address: walletAddress,
          chainType: "aptos",
          hash,
        });

        // Step 3: Submit signed transaction back to backend
        const submitResponse = await fetch(`${API_BASE_URL}/submit-transaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawTxnHex,
            publicKey,
            signature,
          }),
        });

        if (!submitResponse.ok) {
          throw new Error("❌ Failed to submit signed transaction");
        }

        const result = await submitResponse.json();

        if (!result.success) {
          throw new Error(`VM Error: ${result.vmStatus || "Unknown failure"}`);
        }

        return result;
      } catch (error) {
        console.error("🚨 Error in signAndSubmitTransaction:", error);
        throw error;
      }
    },
    [signRawHash]
  );

  /**
   * 🔹 Get wallet balance
   */
  const getWalletBalance = useCallback(async (walletAddress: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/balance/${walletAddress}`);
      if (!res.ok) throw new Error("❌ Failed to fetch balance");
      const { balance } = await res.json();
      return balance;
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw error;
    }
  }, []);

  /**
   * 🔹 Get account info
   */
  const getAccountInfo = useCallback(async (walletAddress: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/account-info/${walletAddress}`);
      if (!res.ok) throw new Error("❌ Failed to fetch account info");
      const info = await res.json();
      return info;
    } catch (error) {
      console.error("Error fetching account info:", error);
      throw error;
    }
  }, []);

  /**
   * 🔹 Faucet
   */
  const requestFaucet = useCallback(async (walletAddress: string, amount = 1000000000) => {
    try {
      const res = await fetch(`${API_BASE_URL}/faucet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress, amount }),
      });

      if (!res.ok) throw new Error("❌ Faucet request failed");
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error requesting faucet:", error);
      throw error;
    }
  }, []);

  const viewFunction = useCallback(async (func: string, typeArguments: string[] = [], functionArguments: any[] = []) => {
    try {
      const res = await fetch(`${API_BASE_URL}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: func,
          typeArguments,
          functionArguments,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to call view function');
      }

      const data = await res.json();
      return data.result;
    } catch (error) {
      console.error('Error calling view function:', error);
      throw error;
    }
  }, []);

  /**
   * Process a TapMove payment
   * Builds, signs, and submits the payment transaction
   */
  const processPayment = useCallback(
    async (
      publicKey: string,
      walletAddress: string,
      paymentId: string,
      merchantAddress: string,
      amount: string,
      memo: string = ''
    ) => {
      try {
        // Step 1: Get payment transaction hash from backend
        const buildResponse = await fetch(`${API_BASE_URL}/payments/${paymentId}/build`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: walletAddress,
            merchantAddress,
            amount,
            memo,
          }),
        });

        if (!buildResponse.ok) {
          const errorData = await buildResponse.json().catch(() => ({}));
          throw new MovementError(
            errorData.error || 'Failed to build payment transaction',
            'NETWORK_ERROR'
          );
        }

        const { hash, rawTxnHex } = await buildResponse.json();

        // Step 2: Sign the transaction hash with Privy
        let signature: string;
        try {
          const signResult = await signRawHash({
            address: walletAddress,
            chainType: 'aptos',
            hash,
          });
          signature = signResult.signature;
        } catch (signError) {
          throw new MovementError(
            'Failed to sign transaction',
            'SIGNING_FAILED',
            signError
          );
        }

        // Step 3: Submit the signed transaction
        const submitResponse = await fetch(`${API_BASE_URL}/payments/${paymentId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawTxnHex,
            publicKey,
            signature,
            senderAddress: walletAddress,
          }),
        });

        if (!submitResponse.ok) {
          const errorData = await submitResponse.json().catch(() => ({}));
          throw new MovementError(
            errorData.error || 'Failed to submit payment',
            'TRANSACTION_FAILED'
          );
        }

        const result = await submitResponse.json();

        if (!result.success) {
          // Check for specific error types
          const vmStatus = result.vmStatus || '';
          if (vmStatus.includes('INSUFFICIENT') || vmStatus.includes('balance')) {
            throw new MovementError('Insufficient balance', 'INSUFFICIENT_BALANCE');
          }
          throw new MovementError(
            `Transaction failed: ${vmStatus || 'Unknown error'}`,
            'TRANSACTION_FAILED'
          );
        }

        return {
          success: true,
          txHash: result.txHash,
          status: result.status,
        };
      } catch (error) {
        if (error instanceof MovementError) {
          throw error;
        }
        throw new MovementError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          'NETWORK_ERROR',
          error
        );
      }
    },
    [signRawHash]
  );

  /**
   * Get network configuration
   */
  const getNetworkConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/config`);
      if (!res.ok) throw new Error('Failed to fetch network config');
      return await res.json();
    } catch (error) {
      console.error('Error fetching network config:', error);
      // Return default testnet config
      return {
        network: 'testnet',
        explorerUrl: 'https://explorer.movementlabs.xyz',
      };
    }
  }, []);

  return {
    signAndSubmitTransaction,
    getWalletBalance,
    getAccountInfo,
    requestFaucet,
    viewFunction,
    processPayment,
    getNetworkConfig,
    MovementError,
  };
}
