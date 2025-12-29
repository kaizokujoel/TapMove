/**
 * TapMove Merchant Terminal Constants
 * Movement Network configuration and contract addresses
 */

export type NetworkType = 'testnet' | 'mainnet';

export interface NetworkConfig {
  name: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  faucetUrl?: string;
}

export const NETWORKS: Record<NetworkType, NetworkConfig> = {
  testnet: {
    name: 'Movement Porto Testnet',
    chainId: '177',
    rpcUrl: process.env.NEXT_PUBLIC_MOVEMENT_RPC || 'https://aptos.testnet.porto.movementlabs.xyz/v1',
    explorerUrl: 'https://explorer.movementlabs.xyz',
    faucetUrl: 'https://faucet.testnet.porto.movementlabs.xyz',
  },
  mainnet: {
    name: 'Movement Mainnet',
    chainId: '126',
    rpcUrl: 'https://mainnet.movementnetwork.xyz/v1',
    explorerUrl: 'https://explorer.movementlabs.xyz',
  },
};

// Contract Addresses
export const CONTRACTS = {
  // TapMove module address (update after deployment)
  PAYMENT_MODULE: process.env.NEXT_PUBLIC_PAYMENT_MODULE || '0x_YOUR_DEPLOYED_ADDRESS::payment',
  MERCHANT_MODULE: process.env.NEXT_PUBLIC_MERCHANT_MODULE || '0x_YOUR_DEPLOYED_ADDRESS::merchant',

  // USDC address (using AptosCoin/MOVE for testnet)
  USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x1::aptos_coin::AptosCoin',
};

// Current network
export const CURRENT_NETWORK: NetworkType =
  (process.env.NEXT_PUBLIC_NETWORK as NetworkType) || 'testnet';
export const NETWORK_CONFIG = NETWORKS[CURRENT_NETWORK];

// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper functions
export function getExplorerTxUrl(txHash: string, network: NetworkType = CURRENT_NETWORK): string {
  return `${NETWORKS[network].explorerUrl}/txn/${txHash}?network=${network}`;
}

export function getExplorerAccountUrl(address: string, network: NetworkType = CURRENT_NETWORK): string {
  return `${NETWORKS[network].explorerUrl}/account/${address}?network=${network}`;
}
