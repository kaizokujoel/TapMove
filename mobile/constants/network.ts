// TapMove Network Configuration
// Movement Network settings and contract addresses

export type NetworkType = 'testnet' | 'mainnet';

export interface NetworkConfig {
  name: string;
  chainId: string;
  nodeUrl: string;
  explorerUrl: string;
  faucetUrl?: string;
  contracts: {
    tapmove: string;
    usdc: string;
  };
}

export const NETWORKS: Record<NetworkType, NetworkConfig> = {
  testnet: {
    name: 'Movement Porto Testnet',
    chainId: '177',
    nodeUrl: 'https://aptos.testnet.porto.movementlabs.xyz/v1',
    explorerUrl: 'https://explorer.movementlabs.xyz',
    faucetUrl: 'https://faucet.testnet.porto.movementlabs.xyz',
    contracts: {
      tapmove: process.env.EXPO_PUBLIC_TAPMOVE_ADDRESS || '0x_YOUR_DEPLOYED_ADDRESS',
      usdc: '0x1::aptos_coin::AptosCoin', // Using MOVE for testing
    },
  },
  mainnet: {
    name: 'Movement Mainnet',
    chainId: '126',
    nodeUrl: 'https://mainnet.movementnetwork.xyz/v1',
    explorerUrl: 'https://explorer.movementlabs.xyz',
    contracts: {
      tapmove: '',
      usdc: '', // Will be set when USDC is deployed
    },
  },
};

// Current network from environment
export const CURRENT_NETWORK: NetworkType =
  (process.env.EXPO_PUBLIC_NETWORK as NetworkType) || 'testnet';

export const NETWORK_CONFIG = NETWORKS[CURRENT_NETWORK];

// Helper functions
export function getExplorerTxUrl(txHash: string, network: NetworkType = CURRENT_NETWORK): string {
  return `${NETWORKS[network].explorerUrl}/txn/${txHash}?network=${network}`;
}

export function getExplorerAccountUrl(address: string, network: NetworkType = CURRENT_NETWORK): string {
  return `${NETWORKS[network].explorerUrl}/account/${address}?network=${network}`;
}

export function isTestnet(): boolean {
  return CURRENT_NETWORK === 'testnet';
}

// API configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

// Deep link scheme
export const DEEP_LINK_SCHEME = 'tapmove';
export const PAYMENT_PATH = 'pay';

export function buildPaymentDeepLink(paymentId: string): string {
  return `${DEEP_LINK_SCHEME}://${PAYMENT_PATH}?id=${paymentId}`;
}

export function parsePaymentDeepLink(url: string): string | null {
  try {
    if (url.startsWith(`${DEEP_LINK_SCHEME}://`)) {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('id');
    }
    return null;
  } catch {
    return null;
  }
}
