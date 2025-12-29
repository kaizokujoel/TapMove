// Payment Confirmation Screen - Deep link target for tapmove://pay?id=XXX
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePrivy } from '@privy-io/expo';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { usePayment } from '@/hooks/use-payment';
import { useMovementWallet, MovementError } from '@/hooks/useMovement';
import { PaymentDetails } from '@/components/pay/payment-details';
import { ConfirmButton } from '@/components/pay/confirm-button';
import { PaymentSuccess } from '@/components/pay/payment-success';
import { PaymentErrorDisplay } from '@/components/pay/payment-error';
import { formatAmount, getExplorerUrl } from '@/lib/payment-service';

export default function PaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    payment,
    isLoading,
    error,
    status,
    txHash,
    setStatus,
    setTxHash,
    setError,
    setLoading,
    refresh,
    clearError
  } = usePayment(id || null);
  const { processPayment } = useMovementWallet();
  const { user } = usePrivy();

  // Extract Aptos wallet from linked accounts
  const aptosWallet = user?.linked_accounts?.find(
    (account: any) => account.type === 'wallet' && account.chain_type === 'aptos'
  );
  const walletAddress = (aptosWallet as any)?.address;
  const publicKey = (aptosWallet as any)?.public_key;

  const handleConfirm = async () => {
    if (!payment || !walletAddress || !publicKey || !id) return;

    setLoading(true);
    setError(null);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await processPayment(
        publicKey,
        walletAddress,
        id,
        payment.merchantAddress || payment.merchant,
        payment.amount,
        payment.memo
      );

      if (result.success) {
        setTxHash(result.txHash);
        setStatus('completed');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      const movementError = err as MovementError;
      const errorCode = movementError.code || 'TRANSACTION_FAILED';

      setError({
        code: errorCode === 'INSUFFICIENT_BALANCE' ? 'INSUFFICIENT_BALANCE' :
              errorCode === 'SIGNING_FAILED' ? 'TRANSACTION_FAILED' : 'TRANSACTION_FAILED',
        message: movementError.message || 'Transaction failed',
      });
      setStatus('failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleViewReceipt = () => {
    if (txHash) {
      router.push(`/history`);
    }
  };

  const handleRetry = () => {
    clearError();
    refresh();
  };

  // Loading state
  if (isLoading && !payment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading payment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state (without payment data)
  if (error && !payment) {
    return (
      <SafeAreaView style={styles.container}>
        <PaymentErrorDisplay error={error} onRetry={handleRetry} onCancel={handleCancel} />
      </SafeAreaView>
    );
  }

  // Success state
  if (status === 'completed' && txHash && payment) {
    return (
      <SafeAreaView style={styles.container}>
        <PaymentSuccess
          amount={payment.amount}
          currency={payment.currency}
          merchantName={payment.merchantName}
          txHash={txHash}
          explorerUrl={getExplorerUrl(txHash)}
          onViewReceipt={handleViewReceipt}
          onDone={handleCancel}
        />
      </SafeAreaView>
    );
  }

  // Error state (with payment data)
  if (error && payment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleCancel}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Payment Failed</Text>
          <View style={styles.backButton} />
        </View>
        <PaymentErrorDisplay error={error} onRetry={handleRetry} onCancel={handleCancel} />
      </SafeAreaView>
    );
  }

  // Payment already completed or expired
  if (payment && (status === 'completed' || status === 'expired')) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.statusContainer}>
          <Ionicons
            name={status === 'completed' ? 'checkmark-circle' : 'time-outline'}
            size={64}
            color={status === 'completed' ? colors.success : colors.warning}
          />
          <Text style={styles.statusTitle}>
            {status === 'completed' ? 'Already Paid' : 'Payment Expired'}
          </Text>
          <Text style={styles.statusText}>
            {status === 'completed'
              ? 'This payment has already been completed'
              : 'This payment request has expired'}
          </Text>
          <Pressable style={styles.goBackButton} onPress={handleCancel}>
            <Text style={styles.goBackText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Normal payment confirmation flow
  if (!payment) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleCancel}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Confirm Payment</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Payment Details Card */}
        <PaymentDetails payment={payment} />

        {/* Payment ID */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment ID</Text>
          <Text style={styles.infoValue}>{id}</Text>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <ConfirmButton
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          amount={formatAmount(payment.amount, payment.currency)}
          disabled={isLoading}
        />

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Text style={styles.securityText}>Secured by Movement blockchain</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: spacing[4], fontSize: typography.fontSize.base, color: colors.textMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: typography.fontSize.lg, fontWeight: '600', color: colors.text },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing[4], gap: spacing[4] },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoLabel: { fontSize: typography.fontSize.sm, color: colors.textMuted },
  infoValue: { fontSize: typography.fontSize.sm, color: colors.text, fontFamily: 'monospace' },
  footer: { padding: spacing[4], paddingBottom: spacing[6] },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  securityText: { fontSize: typography.fontSize.sm, color: colors.textMuted },
  statusContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[6] },
  statusTitle: { fontSize: typography.fontSize.xl, fontWeight: '700', color: colors.text, marginTop: spacing[4] },
  statusText: {
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[6],
  },
  goBackButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.lg,
  },
  goBackText: { fontSize: typography.fontSize.base, fontWeight: '600', color: '#fff' },
});
