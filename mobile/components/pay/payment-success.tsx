// Payment Success Screen - Animated checkmark with transaction details
import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { abbreviateTxHash } from '@/lib/payment-service';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface PaymentSuccessProps {
  amount: string;
  currency: string;
  merchantName: string;
  txHash: string;
  explorerUrl: string;
  onViewReceipt: () => void;
  onDone: () => void;
}

export function PaymentSuccess({
  amount,
  currency,
  merchantName,
  txHash,
  explorerUrl,
  onViewReceipt,
  onDone
}: PaymentSuccessProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in sequence
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(onDone, 5000);
    return () => clearTimeout(timer);
  }, [scaleAnim, checkAnim, fadeAnim, onDone]);

  const formatAmountDisplay = (amt: string) => {
    const num = parseFloat(amt);
    return `$${num.toFixed(2)}`;
  };

  const handleCopyHash = async () => {
    await Clipboard.setStringAsync(txHash);
  };

  const handleViewOnExplorer = () => {
    Linking.openURL(explorerUrl);
  };

  return (
    <View style={styles.container}>
      {/* Animated Success Icon */}
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Animated.View style={{ opacity: checkAnim }}>
          <Ionicons name="checkmark" size={64} color="#fff" />
        </Animated.View>
      </Animated.View>

      {/* Success Message */}
      <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.amount}>{formatAmountDisplay(amount)}</Text>
        <Text style={styles.merchant}>Paid to {merchantName}</Text>
      </Animated.View>

      {/* Transaction Details */}
      <Animated.View style={[styles.detailsContainer, { opacity: fadeAnim }]}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Transaction ID</Text>
          <View style={styles.hashContainer}>
            <Text style={styles.hashText}>
              {abbreviateTxHash(txHash)}
            </Text>
            <Pressable style={styles.copyButton} onPress={handleCopyHash}>
              <Ionicons name="copy-outline" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.detailRow} onPress={handleViewOnExplorer}>
          <Text style={styles.detailLabel}>View on Explorer</Text>
          <Ionicons name="open-outline" size={16} color={colors.primary} />
        </Pressable>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <Pressable style={styles.receiptButton} onPress={onViewReceipt}>
          <Ionicons name="receipt-outline" size={20} color={colors.primary} />
          <Text style={styles.receiptText}>View Receipt</Text>
        </Pressable>

        <Pressable style={styles.doneButton} onPress={onDone}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing[2],
  },
  amount: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.success,
    marginBottom: spacing[2],
  },
  merchant: {
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  hashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  hashText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: spacing[1],
  },
  actions: {
    width: '100%',
    gap: spacing[3],
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  receiptText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.primary,
  },
  doneButton: {
    alignItems: 'center',
    paddingVertical: spacing[4],
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  doneText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: '#fff',
  },
});
