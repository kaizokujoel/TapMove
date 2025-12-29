import { Share, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Transaction } from '@/types';

const EXPLORER_BASE_URL = 'https://explorer.movementlabs.xyz/txn';

export function getExplorerUrl(txHash: string): string {
  return `${EXPLORER_BASE_URL}/${txHash}`;
}

export async function openInExplorer(txHash: string): Promise<void> {
  const url = getExplorerUrl(txHash);
  const canOpen = await Linking.canOpenURL(url);

  if (canOpen) {
    await Linking.openURL(url);
  } else {
    throw new Error('Unable to open explorer URL');
  }
}

export async function copyTransactionHash(txHash: string): Promise<void> {
  await Clipboard.setStringAsync(txHash);
}

export async function copyPaymentId(paymentId: string): Promise<void> {
  await Clipboard.setStringAsync(paymentId);
}

function formatReceiptText(transaction: Transaction): string {
  const date = new Date(transaction.timestamp);
  const formattedDate = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const amount = parseFloat(transaction.amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `
TapMove Payment Receipt
========================

Merchant: ${transaction.merchantName}
${transaction.merchantAddress ? `Address: ${transaction.merchantAddress}\n` : ''}
Amount: $${amount} ${transaction.currency}
${transaction.memo ? `Order: ${transaction.memo}\n` : ''}
Date: ${formattedDate} at ${formattedTime}
Status: ${transaction.status === 'confirmed' ? 'Confirmed' : transaction.status === 'pending' ? 'Pending' : 'Failed'}

Payment ID: ${transaction.paymentId}
Transaction: ${transaction.txHash}

View on Explorer:
${getExplorerUrl(transaction.txHash)}

Powered by TapMove on Movement
  `.trim();
}

export async function shareReceipt(transaction: Transaction): Promise<void> {
  const message = formatReceiptText(transaction);

  try {
    await Share.share({
      message,
      title: `Payment to ${transaction.merchantName}`,
    });
  } catch (error) {
    console.error('Error sharing receipt:', error);
    throw error;
  }
}

export async function shareExplorerLink(txHash: string): Promise<void> {
  const url = getExplorerUrl(txHash);

  try {
    await Share.share({
      message: `View my transaction on Movement Explorer: ${url}`,
      url,
      title: 'Transaction on Movement',
    });
  } catch (error) {
    console.error('Error sharing explorer link:', error);
    throw error;
  }
}
