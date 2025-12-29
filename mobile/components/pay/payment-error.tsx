// Payment Error Component - Error display with retry option
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentError } from '@/types';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface PaymentErrorProps {
  error: PaymentError;
  onRetry: () => void;
  onCancel: () => void;
}

const ERROR_CONFIG: Record<PaymentError['code'], { icon: string; title: string }> = {
  INSUFFICIENT_BALANCE: {
    icon: 'wallet-outline',
    title: 'Insufficient Balance',
  },
  PAYMENT_EXPIRED: {
    icon: 'time-outline',
    title: 'Payment Expired',
  },
  NETWORK_ERROR: {
    icon: 'cloud-offline-outline',
    title: 'Network Error',
  },
  TRANSACTION_FAILED: {
    icon: 'close-circle-outline',
    title: 'Transaction Failed',
  },
  UNKNOWN: {
    icon: 'alert-circle-outline',
    title: 'Something Went Wrong',
  },
};

export function PaymentErrorDisplay({ error, onRetry, onCancel }: PaymentErrorProps) {
  const config = ERROR_CONFIG[error.code] || ERROR_CONFIG.UNKNOWN;
  const canRetry = error.code !== 'PAYMENT_EXPIRED' && error.code !== 'INSUFFICIENT_BALANCE';

  return (
    <View style={styles.container}>
      {/* Error Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name={config.icon as any} size={48} color={colors.error} />
      </View>

      {/* Error Message */}
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.message}>{error.message}</Text>

      {/* Help Text */}
      {error.code === 'INSUFFICIENT_BALANCE' && (
        <View style={styles.helpContainer}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          <Text style={styles.helpText}>
            Add funds to your wallet and try again
          </Text>
        </View>
      )}

      {error.code === 'PAYMENT_EXPIRED' && (
        <View style={styles.helpContainer}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          <Text style={styles.helpText}>
            Ask the merchant for a new payment code
          </Text>
        </View>
      )}

      {error.code === 'NETWORK_ERROR' && (
        <View style={styles.helpContainer}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          <Text style={styles.helpText}>
            Check your internet connection
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {canRetry && (
          <Pressable style={styles.retryButton} onPress={onRetry}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.cancelButton, !canRetry && styles.cancelButtonFull]}
          onPress={onCancel}
        >
          <Text style={styles.cancelText}>
            {canRetry ? 'Cancel' : 'Go Back'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing[4],
    paddingHorizontal: spacing[4],
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.surface,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    flex: 1,
  },
  actions: {
    width: '100%',
    gap: spacing[3],
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  retryText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonFull: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
});
