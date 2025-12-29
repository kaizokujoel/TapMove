import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePrivy } from '@privy-io/expo';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { useTransactions } from '@/hooks/use-transactions';
import { ReceiptCard } from '@/components/history/receipt-card';
import {
  openInExplorer,
  shareReceipt,
  copyTransactionHash,
} from '@/lib/share-receipt';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = usePrivy();
  const [isCopied, setIsCopied] = useState(false);

  const aptosWallet = user?.linked_accounts?.find(
    (account: any) => account.type === 'wallet' && account.chain_type === 'aptos'
  );
  const walletAddress = (aptosWallet as any)?.address;

  const { getTransaction } = useTransactions(walletAddress);

  const transaction = getTransaction(id || '');

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Receipt</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.notFound}>
          <Ionicons name="document-outline" size={64} color={colors.textMuted} />
          <Text style={styles.notFoundText}>Transaction not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCopyHash = async () => {
    try {
      await copyTransactionHash(transaction.txHash);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy transaction hash');
    }
  };

  const handleOpenExplorer = async () => {
    try {
      await openInExplorer(transaction.txHash);
    } catch (error) {
      Alert.alert('Error', 'Unable to open explorer');
    }
  };

  const handleShare = async () => {
    try {
      await shareReceipt(transaction);
    } catch (error) {
      Alert.alert('Error', 'Failed to share receipt');
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report Issue',
      'If you have an issue with this transaction, please contact support with your Payment ID.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receipt</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ReceiptCard transaction={transaction} />

        <View style={styles.actions}>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyHash}>
            <Ionicons
              name={isCopied ? 'checkmark' : 'copy-outline'}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.copyButtonText}>
              {isCopied ? 'Copied!' : 'Copy TX Hash'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleOpenExplorer}>
            <Ionicons name="open-outline" size={20} color={colors.text} />
            <Text style={styles.actionButtonText}>View on Explorer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
            <Ionicons name="flag-outline" size={20} color={colors.error} />
            <Text style={styles.reportButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing[2],
    marginLeft: -spacing[2],
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  shareButton: {
    padding: spacing[2],
    marginRight: -spacing[2],
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: typography.fontSize.lg,
    color: colors.textMuted,
    marginTop: spacing[4],
  },
  actions: {
    marginTop: spacing[6],
    gap: spacing[3],
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  copyButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.primary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing[2],
  },
  actionButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    color: colors.text,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  reportButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
  },
});
