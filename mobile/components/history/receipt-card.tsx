import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-styled';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { Transaction } from '@/types';
import { TransactionStatusBadge } from './transaction-status';

interface ReceiptCardProps {
  transaction: Transaction;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(amount: string): string {
  const num = parseFloat(amount);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function truncateHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

export function ReceiptCard({ transaction }: ReceiptCardProps) {
  const explorerUrl = `https://explorer.movementlabs.xyz/txn/${transaction.txHash}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.merchantName}>{transaction.merchantName}</Text>
        {transaction.merchantAddress && (
          <Text style={styles.merchantAddress}>{transaction.merchantAddress}</Text>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>Amount Paid</Text>
        <Text style={styles.amount}>
          ${formatAmount(transaction.amount)} {transaction.currency}
        </Text>
      </View>

      <View style={styles.divider} />

      {transaction.memo && (
        <>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Details</Text>
            <Text style={styles.detailValue}>{transaction.memo}</Text>
          </View>
          <View style={styles.divider} />
        </>
      )}

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Payment ID</Text>
        <Text style={styles.detailValueMono}>{transaction.paymentId}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Transaction Hash</Text>
        <Text style={styles.detailValueMono}>{truncateHash(transaction.txHash)}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Date & Time</Text>
        <Text style={styles.detailValue}>
          {formatDate(transaction.timestamp)} at {formatTime(transaction.timestamp)}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Status</Text>
        <TransactionStatusBadge status={transaction.status} size="sm" />
      </View>

      <View style={styles.divider} />

      <View style={styles.qrSection}>
        <Text style={styles.qrLabel}>Scan to view on explorer</Text>
        <View style={styles.qrContainer}>
          <QRCode
            data={explorerUrl}
            style={{ backgroundColor: 'white' }}
            pieceSize={4}
            padding={8}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  merchantName: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  merchantAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing[1],
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing[4],
  },
  amountSection: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing[2],
  },
  amount: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '700',
    color: colors.text,
  },
  detailRow: {
    marginBottom: spacing[3],
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing[1],
  },
  detailValue: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  detailValueMono: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontFamily: typography.fontFamily.mono,
  },
  qrSection: {
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing[3],
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: spacing[2],
    borderRadius: borderRadius.lg,
  },
});
