// Balance Card - Displays wallet balance with gradient and actions
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { formatBalance } from '@/hooks/use-balance';

interface BalanceCardProps {
  balance: string;
  isLoading: boolean;
  address?: string;
  onAddFunds: () => void;
}

export function BalanceCard({ balance, isLoading, address, onAddFunds }: BalanceCardProps) {
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <LinearGradient
      colors={[colors.surface, colors.surfaceElevated]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
      accessibilityRole="summary"
      accessibilityLabel={
        isLoading
          ? 'Loading balance'
          : `Available balance: ${formatBalance(balance)} USDC`
      }
    >
      <View style={styles.header}>
        <View style={styles.iconContainer} accessibilityElementsHidden>
          <Ionicons name="wallet" size={24} color={colors.primary} />
        </View>
        <Text style={styles.label}>Available Balance</Text>
      </View>

      <View style={styles.balanceContainer}>
        {isLoading ? (
          <View style={styles.skeletonRow} accessibilityLabel="Loading balance">
            <View style={styles.skeletonLarge} />
            <View style={styles.skeletonSmall} />
          </View>
        ) : (
          <View style={styles.balanceRow} accessibilityElementsHidden>
            <Text style={styles.currency}>$</Text>
            <Text style={styles.amount}>{formatBalance(balance)}</Text>
            <Text style={styles.currencyLabel}>USDC</Text>
          </View>
        )}
      </View>

      {address && (
        <Pressable
          style={styles.addressRow}
          accessibilityLabel={`Wallet address: ${formatAddress(address)}. Tap to copy.`}
          accessibilityRole="button"
        >
          <Ionicons name="copy-outline" size={14} color={colors.textMuted} />
          <Text style={styles.addressText}>{formatAddress(address)}</Text>
        </Pressable>
      )}

      <Pressable
        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        onPress={onAddFunds}
        accessibilityLabel="Add Funds"
        accessibilityRole="button"
        accessibilityHint="Opens add funds modal"
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
        <Text style={styles.addButtonText}>Add Funds</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius['2xl'],
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  balanceContainer: {
    marginBottom: spacing[4],
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: spacing[1],
  },
  amount: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '700',
    color: colors.text,
  },
  currencyLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: spacing[2],
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  skeletonLarge: {
    width: 120,
    height: 36,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
  },
  skeletonSmall: {
    width: 50,
    height: 24,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing[4],
  },
  addressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary + '15',
    paddingVertical: spacing[3],
    borderRadius: borderRadius.xl,
  },
  addButtonPressed: {
    backgroundColor: colors.primary + '25',
  },
  addButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.primary,
  },
});
