import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { TransactionGroup as TxGroup, Transaction } from '@/types';
import { TransactionItem } from './transaction-item';

interface TransactionGroupProps {
  group: TxGroup;
  onTransactionPress: (transaction: Transaction) => void;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function TransactionGroup({ group, onTransactionPress }: TransactionGroupProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateLabel}>{group.dateLabel}</Text>
        <Text style={styles.totalSpent}>
          ${formatCurrency(group.totalSpent)}
        </Text>
      </View>

      <View style={styles.transactions}>
        {group.transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onPress={onTransactionPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  dateLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalSpent: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  transactions: {
    gap: spacing[2],
  },
});
