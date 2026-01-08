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
    name: 'Movement Testnet',
    chainId: '250',
    nodeUrl: 'https://testnet.movementnetwork.xyz/v1',
    explorerUrl: 'https://explorer.movementnetwork.xyz',
    faucetUrl: 'https://faucet.testnet.movementnetwork.xyz/',
    contracts: {
      tapmove: process.env.EXPO_PUBLIC_TAPMOVE_ADDRESS || '0x2b633f672b485166e89bb90903962d5ad26bbf70ce079ed484bae518d89d2dc5',
      usdc: '0x1::aptos_coin::AptosCoin', // Using MOVE for testing
    },
  },
  mainnet: {
    name: 'Movement Mainnet',
    chainId: '126',
    nodeUrl: 'https://mainnet.movementnetwork.xyz/v1',
    explorerUrl: 'https://explorer.movementnetwork.xyz',
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
