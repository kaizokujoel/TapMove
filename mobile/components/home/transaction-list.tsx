// Transaction List - Shows recent transactions with refresh
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { Transaction } from '@/types';
import { TransactionItem } from './transaction-item';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  showViewAll?: boolean;
}

export function TransactionList({
  transactions,
  isLoading,
  isRefreshing,
  onRefresh,
  showViewAll = true,
}: TransactionListProps) {
  const router = useRouter();

  const handleViewAll = () => {
    router.push('/(tabs)/history');
  };

  const handleTransactionPress = (transaction: Transaction) => {
    // Could navigate to transaction details in the future
    console.log('Transaction pressed:', transaction.id);
  };

  if (isLoading && transactions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recent Transactions</Text>
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonItem}>
              <View style={styles.skeletonIcon} />
              <View style={styles.skeletonContent}>
                <View style={styles.skeletonLine} />
                <View style={styles.skeletonLineShort} />
              </View>
              <View style={styles.skeletonAmount} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recent Transactions</Text>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap to pay at any merchant to get started
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Transactions</Text>
        {showViewAll && transactions.length > 0 && (
          <Pressable onPress={handleViewAll} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </Pressable>
        )}
      </View>

      <View style={styles.listContainer}>
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onPress={() => handleTransactionPress(transaction)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.primary,
  },
  listContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  // Empty state styles
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  emptyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  // Skeleton styles
  skeletonContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[2],
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceHover,
    marginRight: spacing[3],
  },
  skeletonContent: {
    flex: 1,
    gap: spacing[2],
  },
  skeletonLine: {
    height: 14,
    width: '70%',
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.sm,
  },
  skeletonLineShort: {
    height: 12,
    width: '40%',
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.sm,
  },
  skeletonAmount: {
    width: 60,
    height: 16,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.sm,
  },
});
