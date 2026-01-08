/**
 * Shinami Gas Station Integration
 * Provides gasless transactions for TapMove users
 *
 * API Key must have both Gas Station and Node Service rights for Movement network
 */

import { GasStationClient } from '@shinami/clients/aptos';

// Initialize Shinami Gas Station client
const SHINAMI_KEY = process.env.SHINAMI_KEY;

let gasStationClient = null;

if (SHINAMI_KEY) {
  try {
    gasStationClient = new GasStationClient(SHINAMI_KEY);
    console.log('✅ Shinami Gas Station initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Shinami Gas Station:', error.message);
  }
} else {
  console.warn('⚠️  SHINAMI_KEY not set - transactions will require user gas');
}

/**
 * Check if Gas Station is enabled and configured
 */
export function isGasStationEnabled() {
  return !!gasStationClient;
}

/**
 * Get the Gas Station client instance
 * @returns {GasStationClient | null}
 */
export function getGasStationClient() {
  return gasStationClient;
}

/**
 * Sponsor and submit a signed transaction
 * Falls back to direct submission if Gas Station is not configured
 *
 * @param {SimpleTransaction} transaction - The transaction to sponsor
 * @param {AccountAuthenticatorEd25519} senderAuthenticator - The sender's authenticator
 * @param {Aptos} aptosClient - The Aptos client for fallback
 * @returns {Promise<{hash: string}>} The pending transaction
 */
export async function sponsorAndSubmit(transaction, senderAuthenticator, aptosClient) {
  if (gasStationClient) {
    // Use Shinami Gas Station for sponsored (gasless) submission
    console.log('🔷 Submitting via Shinami Gas Station (gasless)');
    return await gasStationClient.sponsorAndSubmitSignedTransaction(
      transaction,
      senderAuthenticator
    );
  } else {
    // Fallback to direct submission (user pays gas)
    console.log('⚡ Submitting directly (user pays gas)');
    return await aptosClient.transaction.submit.simple({
      transaction,
      senderAuthenticator,
    });
  }
}

export default {
  isGasStationEnabled,
  getGasStationClient,
  sponsorAndSubmit,
};
