import { toHex } from 'viem';
import {
  Aptos,
  AptosConfig,
  Network,
  AccountAddress,
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
  generateSigningMessageForTransaction,
  SimpleTransaction,
  Hex,
  Deserializer,
} from '@aptos-labs/ts-sdk';
import { isGasStationEnabled, sponsorAndSubmit } from '../lib/shinami.js';

// Network configuration - uses environment variables with sensible defaults
const NETWORK = process.env.NETWORK || 'testnet';

const NETWORK_CONFIG = {
  testnet: {
    nodeUrl: 'https://testnet.movementnetwork.xyz/v1',
    faucetUrl: 'https://faucet.testnet.movementnetwork.xyz/',
    explorerUrl: 'https://explorer.movementnetwork.xyz',
  },
  mainnet: {
    nodeUrl: 'https://mainnet.movementnetwork.xyz/v1',
    explorerUrl: 'https://explorer.movementnetwork.xyz',
  },
};

const config = NETWORK_CONFIG[NETWORK] || NETWORK_CONFIG.testnet;

const MOVEMENT_NODE_URL = process.env.MOVEMENT_NODE_URL || config.nodeUrl;
const FAUCET_URL = process.env.MOVEMENT_FAUCET_URL || config.faucetUrl;

// TapMove module address (deployed contract)
const TAPMOVE_MODULE_ADDRESS = process.env.TAPMOVE_MODULE_ADDRESS || '0x2b633f672b485166e89bb90903962d5ad26bbf70ce079ed484bae518d89d2dc5';

// Coin type - USDC on mainnet, AptosCoin (MOVE) for testing
const COIN_TYPE = process.env.USDC_ADDRESS || '0x1::aptos_coin::AptosCoin';

const aptosConfig = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: MOVEMENT_NODE_URL,
});

const aptos = new Aptos(aptosConfig);

/**
 * Get current network configuration
 */
export function getNetworkConfig() {
  return {
    network: NETWORK,
    nodeUrl: MOVEMENT_NODE_URL,
    explorerUrl: config.explorerUrl,
    tapmoveAddress: TAPMOVE_MODULE_ADDRESS,
    coinType: COIN_TYPE,
    gasSponsored: isGasStationEnabled(), // Indicates if transactions are gasless
  };
}

/**
 * Get Aptos client instance
 */
export function getAptosClient() {
  return aptos;
}

/**
 * Build a payment transaction using TapMove module
 * Uses tapmove::payment::pay function for on-chain payment tracking
 */
export async function buildPaymentTransaction(sender, recipient, amount, paymentId, memo = '') {
  const senderAddress = AccountAddress.from(sender);
  const recipientAddress = AccountAddress.from(recipient);

  // Convert paymentId string to bytes for on-chain storage
  const paymentIdBytes = new TextEncoder().encode(paymentId);

  // Use TapMove payment module if deployed, otherwise fallback to direct transfer
  const useTapMoveModule = TAPMOVE_MODULE_ADDRESS && !TAPMOVE_MODULE_ADDRESS.includes('YOUR_DEPLOYED');

  let txnData;
  if (useTapMoveModule) {
    // Use TapMove payment contract
    txnData = {
      function: `${TAPMOVE_MODULE_ADDRESS}::payment::pay`,
      typeArguments: [COIN_TYPE],
      functionArguments: [
        recipientAddress.toString(),
        amount.toString(),
        Array.from(paymentIdBytes),
        memo,
      ],
    };
  } else {
    // Fallback to direct coin transfer for testing
    txnData = {
      function: '0x1::aptos_account::transfer_coins',
      typeArguments: [COIN_TYPE],
      functionArguments: [recipientAddress.toString(), amount.toString()],
    };
  }

  // Build transaction with fee payer support if Shinami Gas Station is enabled
  const useGasStation = isGasStationEnabled();
  const rawTxn = await aptos.transaction.build.simple({
    sender: senderAddress,
    data: txnData,
    withFeePayer: useGasStation, // Enable fee payer for Shinami sponsorship
  });

  const message = generateSigningMessageForTransaction(rawTxn);
  const hash = toHex(message);
  const rawTxnHex = rawTxn.bcsToHex().toString();

  return {
    hash,
    rawTxnHex,
    paymentId,
    usedTapMoveModule: useTapMoveModule,
  };
}

/**
 * Build a generic transaction
 */
export async function buildTransaction(sender, func, typeArguments, functionArguments) {
  const senderAddress = AccountAddress.from(sender);

  // Build with fee payer support if Shinami Gas Station is enabled
  const useGasStation = isGasStationEnabled();
  const rawTxn = await aptos.transaction.build.simple({
    sender: senderAddress,
    data: {
      function: func,
      typeArguments: typeArguments || [],
      functionArguments,
    },
    withFeePayer: useGasStation,
  });

  const message = generateSigningMessageForTransaction(rawTxn);
  const hash = toHex(message);
  const rawTxnHex = rawTxn.bcsToHex().toString();

  return { hash, rawTxnHex, gasSponsored: useGasStation };
}

/**
 * Process public key for Ed25519 format
 */
function processPublicKey(publicKey) {
  let processed = publicKey;

  if (processed.toLowerCase().startsWith('0x')) {
    processed = processed.slice(2);
  }

  if (processed.length === 66 && processed.startsWith('00')) {
    processed = processed.substring(2);
  }

  if (processed.length !== 64) {
    throw new Error(
      `Invalid public key length: expected 64 characters, got ${processed.length}`
    );
  }

  return processed;
}

/**
 * Submit a signed transaction
 * Uses Shinami Gas Station for sponsored (gasless) transactions if configured
 */
export async function submitTransaction(rawTxnHex, publicKey, signature) {
  const processedPublicKey = processPublicKey(publicKey);

  const senderAuthenticator = new AccountAuthenticatorEd25519(
    new Ed25519PublicKey(processedPublicKey),
    new Ed25519Signature(signature)
  );

  const rawTxn = SimpleTransaction.deserialize(
    new Deserializer(Hex.fromHexInput(rawTxnHex).toUint8Array())
  );

  // Use Shinami Gas Station if enabled, otherwise direct submission
  const pendingTxn = await sponsorAndSubmit(rawTxn, senderAuthenticator, aptos);

  const executedTxn = await aptos.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });

  return {
    success: executedTxn.success,
    hash: executedTxn.hash,
    vmStatus: executedTxn.vm_status,
    sponsored: isGasStationEnabled(), // Indicate if transaction was sponsored
  };
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(txHash) {
  try {
    const txn = await aptos.getTransactionByHash({ transactionHash: txHash });
    return {
      exists: true,
      success: txn.success,
      vmStatus: txn.vm_status,
      timestamp: txn.timestamp,
    };
  } catch (error) {
    if (error.message?.includes('not found')) {
      return { exists: false };
    }
    throw error;
  }
}

/**
 * Get MOVE balance for an address
 */
export async function getMoveBalance(address) {
  const accountAddress = AccountAddress.from(address);
  const balance = await aptos.getAccountAPTAmount({ accountAddress });
  return balance;
}

/**
 * Get coin balance for an address (USDC or MOVE depending on config)
 */
export async function getCoinBalance(address) {
  const accountAddress = AccountAddress.from(address);
  try {
    const resources = await aptos.getAccountResources({ accountAddress });
    const coinStore = resources.find(
      (r) => r.type === `0x1::coin::CoinStore<${COIN_TYPE}>`
    );
    return coinStore ? BigInt(coinStore.data.coin.value) : BigInt(0);
  } catch (error) {
    console.error('Error fetching coin balance:', error);
    return BigInt(0);
  }
}

// Alias for backward compatibility
export const getUSDCBalance = getCoinBalance;

/**
 * Get account info
 */
export async function getAccountInfo(address) {
  const accountAddress = AccountAddress.from(address);
  return await aptos.getAccountInfo({ accountAddress });
}

/**
 * Call view function (read-only)
 */
export async function callViewFunction(func, typeArguments, functionArguments) {
  const result = await aptos.view({
    payload: {
      function: func,
      typeArguments: typeArguments || [],
      functionArguments: functionArguments || [],
    },
  });
  return result;
}

/**
 * Request faucet tokens
 */
export async function requestFaucet(address, amount) {
  const response = await fetch(`${FAUCET_URL}?amount=${amount}&address=${address}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Faucet request failed: ${response.status} ${errorText}`);
  }

  return await response.json();
}
