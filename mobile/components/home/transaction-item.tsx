// Transaction Item - Single transaction row display
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { Transaction } from '@/types';
import { formatRelativeTime, getMerchantEmoji } from '@/hooks/use-transactions';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const { merchantName, amount, timestamp, status, memo } = transaction;

  // Format amount (assuming 6 decimals for USDC)
  const formattedAmount = (parseFloat(amount) / 1e6).toFixed(2);
  const isPayment = true; // All transactions in customer app are payments out

  // Get emoji based on merchant category or name
  const emoji = getMerchantEmoji(memo?.toLowerCase() || 'other');

  // Status indicator color
  const statusColor =
    status === 'confirmed'
      ? colors.success
      : status === 'pending'
      ? colors.warning
      : colors.error;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* Merchant Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.merchantName} numberOfLines={1}>
          {merchantName || 'Unknown Merchant'}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.time}>{formatRelativeTime(timestamp)}</Text>
          {status !== 'confirmed' && (
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {status === 'pending' ? 'Pending' : 'Failed'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, isPayment && styles.amountNegative]}>
          {isPayment ? '-' : '+'}${formattedAmount}
        </Text>
        <Text style={styles.currency}>USDC</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.lg,
  },
  pressed: {
    backgroundColor: colors.surfaceHover,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  emoji: {
    fontSize: 22,
  },
  details: {
    flex: 1,
    marginRight: spacing[3],
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
    gap: spacing[2],
  },
  time: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  amountNegative: {
    color: colors.text,
  },
  currency: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
