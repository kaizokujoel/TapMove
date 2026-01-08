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
    name: 'Movement Testnet',
    chainId: '250',
    rpcUrl: process.env.NEXT_PUBLIC_MOVEMENT_RPC || 'https://testnet.movementnetwork.xyz/v1',
    explorerUrl: 'https://explorer.movementnetwork.xyz',
    faucetUrl: 'https://faucet.testnet.movementnetwork.xyz/',
  },
  mainnet: {
    name: 'Movement Mainnet',
    chainId: '126',
    rpcUrl: 'https://mainnet.movementnetwork.xyz/v1',
    explorerUrl: 'https://explorer.movementnetwork.xyz',
  },
};

// Contract Addresses
export const CONTRACTS = {
  // TapMove module address (deployed to Movement testnet)
  PAYMENT_MODULE: process.env.NEXT_PUBLIC_PAYMENT_MODULE || '0x2b633f672b485166e89bb90903962d5ad26bbf70ce079ed484bae518d89d2dc5::payment',
  MERCHANT_MODULE: process.env.NEXT_PUBLIC_MERCHANT_MODULE || '0x2b633f672b485166e89bb90903962d5ad26bbf70ce079ed484bae518d89d2dc5::merchant',

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
