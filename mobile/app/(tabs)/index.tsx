// Home Tab - Customer wallet home screen
import { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePrivy } from '@privy-io/expo';

import { colors, spacing } from '@/constants/theme';
import { useBalance } from '@/hooks/use-balance';
import { useTransactions } from '@/hooks/use-transactions';
import {
  BalanceCard,
  ReadyToPaySection,
  TransactionList,
  AddFundsModal,
} from '@/components/home';

export default function WalletTab() {
  const router = useRouter();
  const { user } = usePrivy();
  const [showAddFunds, setShowAddFunds] = useState(false);

  // Find the Aptos wallet
  const aptosWallet = user?.linked_accounts?.find(
    (account: any) => account.type === 'wallet' && account.chain_type === 'aptos'
  );
  const walletAddress = (aptosWallet as any)?.address;

  // Fetch balance and transactions
  const {
    balance,
    isLoading: isBalanceLoading,
    isRefetching: isBalanceRefetching,
    refresh: refreshBalance,
  } = useBalance(walletAddress);

  const {
    recentTransactions,
    isLoading: isTransactionsLoading,
    isRefetching: isTransactionsRefetching,
    refresh: refreshTransactions,
  } = useTransactions(walletAddress);

  const isRefreshing = isBalanceRefetching || isTransactionsRefetching;

  const handleRefresh = useCallback(() => {
    refreshBalance();
    refreshTransactions();
  }, [refreshBalance, refreshTransactions]);

  const handleOpenSettings = () => {
    router.push('/(tabs)/settings');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header} accessibilityRole="header">
        <View
          style={styles.logoContainer}
          accessibilityLabel="TapMove"
          accessibilityRole="image"
        >
          <Ionicons name="flash" size={24} color={colors.primary} />
        </View>
        <Pressable
          onPress={handleOpenSettings}
          style={styles.settingsButton}
          accessibilityLabel="Settings"
          accessibilityRole="button"
          accessibilityHint="Opens settings screen"
        >
          <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Balance Card */}
        <BalanceCard
          balance={balance}
          isLoading={isBalanceLoading}
          address={walletAddress}
          onAddFunds={() => setShowAddFunds(true)}
        />

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Ready to Pay Section */}
        <ReadyToPaySection />

        {/* Transaction List */}
        <TransactionList
          transactions={recentTransactions}
          isLoading={isTransactionsLoading}
          isRefreshing={isTransactionsRefetching}
          onRefresh={refreshTransactions}
        />
      </ScrollView>

      {/* Add Funds Modal */}
      <AddFundsModal
        visible={showAddFunds}
        onClose={() => setShowAddFunds(false)}
        address={walletAddress || ''}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  spacer: {
    height: spacing[6],
  },
});
