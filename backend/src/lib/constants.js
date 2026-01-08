/**
 * TapMove Backend Constants
 * Movement Network configuration and contract addresses
 */

// Movement Network Configuration
export const MOVEMENT_CONFIG = {
  testnet: {
    name: 'Movement Porto Testnet',
    chainId: '177',
    rpcUrl: process.env.MOVEMENT_RPC_URL || 'https://aptos.testnet.porto.movementlabs.xyz/v1',
    faucetUrl: process.env.MOVEMENT_FAUCET_URL || 'https://faucet.testnet.porto.movementlabs.xyz',
    explorerUrl: 'https://explorer.movementlabs.xyz',
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
  PAYMENT_MODULE: process.env.PAYMENT_MODULE || '0x_YOUR_DEPLOYED_ADDRESS::payment',
  MERCHANT_MODULE: process.env.MERCHANT_MODULE || '0x_YOUR_DEPLOYED_ADDRESS::merchant',

  // USDC address (using AptosCoin/MOVE for testnet)
  USDC_ADDRESS: process.env.USDC_ADDRESS || '0x1::aptos_coin::AptosCoin',
};

// Current network from environment
export const CURRENT_NETWORK = process.env.NETWORK || 'testnet';
export const NETWORK_CONFIG = MOVEMENT_CONFIG[CURRENT_NETWORK];

// API Configuration
export const API_CONFIG = {
  port: parseInt(process.env.PORT || '4001', 10),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:8081').split(','),
};

// Payment Configuration
export const PAYMENT_CONFIG = {
  defaultExpiryMinutes: parseInt(process.env.PAYMENT_EXPIRY_MINUTES || '15', 10),
  usdcDecimals: 6,
};

// Helper functions
export function getExplorerTxUrl(txHash, network = CURRENT_NETWORK) {
  return `${MOVEMENT_CONFIG[network].explorerUrl}/txn/${txHash}?network=${network}`;
}

export function getExplorerAccountUrl(address, network = CURRENT_NETWORK) {
  return `${MOVEMENT_CONFIG[network].explorerUrl}/account/${address}?network=${network}`;
}
