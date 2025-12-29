// Payment Details Component - Displays merchant info and amount
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentRequest } from '@/types';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface PaymentDetailsProps {
  payment: PaymentRequest;
}

export function PaymentDetails({ payment }: PaymentDetailsProps) {
  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return num.toFixed(2);
  };

  return (
    <View style={styles.container}>
      {/* Merchant Info */}
      <View style={styles.merchantSection}>
        <View style={styles.merchantIcon}>
          <Ionicons name="storefront" size={32} color={colors.primary} />
        </View>
        <Text style={styles.merchantName}>{payment.merchantName}</Text>
        {payment.merchantAddress && (
          <Text style={styles.merchantAddress}>{payment.merchantAddress}</Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* Amount Display */}
      <View style={styles.amountSection}>
        <Text style={styles.amountValue}>${formatAmount(payment.amount)}</Text>
        <Text style={styles.currency}>{payment.currency}</Text>
      </View>

      {/* Order Details */}
      {payment.memo && (
        <View style={styles.memoSection}>
          <Text style={styles.memoLabel}>Order Details</Text>
          <Text style={styles.memoText}>{payment.memo}</Text>
        </View>
      )}

      <View style={styles.divider} />

      {/* Network Info */}
      <View style={styles.networkSection}>
        <View style={styles.networkRow}>
          <Text style={styles.networkLabel}>Network</Text>
          <View style={styles.networkBadge}>
            <View style={styles.networkDot} />
            <Text style={styles.networkText}>Movement</Text>
          </View>
        </View>
        <View style={styles.networkRow}>
          <Text style={styles.networkLabel}>Est. Fee</Text>
          <Text style={styles.feeValue}>{payment.networkFee || '< $0.01'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.border,
  },
  merchantSection: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  merchantIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
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
    paddingVertical: spacing[2],
  },
  amountValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  currency: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
  memoSection: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginTop: spacing[4],
  },
  memoLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[2],
  },
  memoText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: 22,
  },
  networkSection: {
    gap: spacing[3],
  },
  networkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.background,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  networkText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  feeValue: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    fontWeight: '500',
  },
});
