import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePrivy } from '@privy-io/expo';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { useTransactions } from '@/hooks/use-transactions';
import { TransactionFiltersComponent } from '@/components/history/transaction-filters';
import { TransactionGroup } from '@/components/history/transaction-group';
import { Transaction, TransactionGroup as TxGroup } from '@/types';

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <View style={styles.emptyState} accessibilityRole="text">
      <Ionicons
        name={hasFilters ? 'search-outline' : 'time-outline'}
        size={64}
        color={colors.textMuted}
        accessibilityElementsHidden
      />
      <Text style={styles.emptyTitle} accessibilityRole="header">
        {hasFilters ? 'No matching transactions' : 'No transactions yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {hasFilters
          ? 'Try adjusting your filters'
          : 'Make your first payment to see it here'}
      </Text>
    </View>
  );
}

function LoadingSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonGroup}>
          <View style={styles.skeletonHeader} />
          {[1, 2].map((j) => (
            <View key={j} style={styles.skeletonItem} />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function HistoryTab() {
  const router = useRouter();
  const { user } = usePrivy();

  const aptosWallet = user?.linked_accounts?.find(
    (account: any) => account.type === 'wallet' && account.chain_type === 'aptos'
  );
  const walletAddress = (aptosWallet as any)?.address;

  const {
    groupedTransactions,
    filters,
    setFilters,
    isLoading,
    isRefetching,
    isFetchingMore,
    hasMore,
    refresh,
    loadMore,
    totalCount,
  } = useTransactions(walletAddress);

  const hasFilters = filters.searchQuery !== '' ||
    filters.dateFilter !== 'all' ||
    filters.statusFilter !== 'all';

  const handleTransactionPress = useCallback((transaction: Transaction) => {
    router.push(`/transaction/${transaction.id}`);
  }, [router]);

  const renderGroup = useCallback(({ item }: { item: TxGroup }) => (
    <TransactionGroup
      group={item}
      onTransactionPress={handleTransactionPress}
    />
  ), [handleTransactionPress]);

  const renderFooter = useCallback(() => {
    if (!isFetchingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isFetchingMore]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isFetchingMore) {
      loadMore();
    }
  }, [hasMore, isFetchingMore, loadMore]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.header} accessibilityRole="header">
          <Text style={styles.title} accessibilityRole="header">
            Transactions
          </Text>
          {totalCount > 0 && (
            <Text
              style={styles.count}
              accessibilityLabel={`${totalCount} total transactions`}
            >
              {totalCount} total
            </Text>
          )}
        </View>

        <TransactionFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
        />

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <FlatList
            data={groupedTransactions}
            renderItem={renderGroup}
            keyExtractor={(item) => item.date}
            ListEmptyComponent={<EmptyState hasFilters={hasFilters} />}
            ListFooterComponent={renderFooter}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refresh}
                tintColor={colors.primary}
              />
            }
            contentContainerStyle={
              groupedTransactions.length === 0 ? styles.emptyContainer : styles.listContent
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.text,
  },
  count: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  listContent: {
    paddingBottom: spacing[8],
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[12],
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing[4],
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing[2],
    textAlign: 'center',
  },
  skeletonContainer: {
    flex: 1,
  },
  skeletonGroup: {
    marginBottom: spacing[4],
  },
  skeletonHeader: {
    height: 16,
    width: 100,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
    marginBottom: spacing[3],
  },
  skeletonItem: {
    height: 72,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[2],
  },
  loadingFooter: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
});
