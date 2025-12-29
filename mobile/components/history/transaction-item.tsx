import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { Transaction } from '@/types';
import { TransactionStatusIcon } from './transaction-status';

interface TransactionItemProps {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
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

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const isPending = transaction.status === 'pending';
  const isFailed = transaction.status === 'failed';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(transaction)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name="storefront-outline"
          size={20}
          color={colors.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.merchantName} numberOfLines={1}>
          {transaction.merchantName}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.time}>{formatTime(transaction.timestamp)}</Text>
          {transaction.memo && (
            <>
              <View style={styles.dot} />
              <Text style={styles.memo} numberOfLines={1}>
                {transaction.memo}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={[
          styles.amount,
          isFailed && styles.amountFailed
        ]}>
          -${formatAmount(transaction.amount)}
        </Text>
        <View style={styles.statusRow}>
          <TransactionStatusIcon status={transaction.status} size="sm" />
          <Text style={[
            styles.statusText,
            { color: isFailed ? colors.error : isPending ? colors.warning : colors.success }
          ]}>
            {transaction.status === 'confirmed' ? 'Done' :
             transaction.status === 'pending' ? 'Pending' : 'Failed'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  content: {
    flex: 1,
  },
  merchantName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing[1],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginHorizontal: spacing[2],
  },
  memo: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing[1],
  },
  amountFailed: {
    color: colors.error,
    textDecorationLine: 'line-through',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
  },
});
