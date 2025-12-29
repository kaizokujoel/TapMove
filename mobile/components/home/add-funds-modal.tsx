// Add Funds Modal - Shows wallet address and QR code for receiving
import { View, Text, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import QRCodeStyled from 'react-native-qrcode-styled';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

interface AddFundsModalProps {
  visible: boolean;
  onClose: () => void;
  address: string;
}

export function AddFundsModal({ visible, onClose, address }: AddFundsModalProps) {
  const handleCopyAddress = async () => {
    await Clipboard.setStringAsync(address);
    Alert.alert('Copied!', 'Wallet address copied to clipboard');
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    if (addr.length <= 20) return addr;
    return `${addr.slice(0, 10)}...${addr.slice(-10)}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Funds</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* QR Code */}
          <View style={styles.qrContainer}>
            <QRCodeStyled
              data={address}
              style={styles.qrCode}
              pieceSize={6}
              color={colors.text}
              pieceCornerType="rounded"
              pieceBorderRadius={2}
              isPiecesGlued
            />
          </View>

          {/* Instructions */}
          <Text style={styles.instruction}>
            Send USDC on Movement to this address
          </Text>

          {/* Address Display */}
          <Pressable style={styles.addressContainer} onPress={handleCopyAddress}>
            <Text style={styles.addressLabel}>Your wallet address</Text>
            <View style={styles.addressRow}>
              <Text style={styles.address}>{formatAddress(address)}</Text>
              <View style={styles.copyButton}>
                <Ionicons name="copy-outline" size={18} color={colors.primary} />
              </View>
            </View>
          </Pressable>

          {/* Full Address (Tappable) */}
          <Pressable style={styles.fullAddressContainer} onPress={handleCopyAddress}>
            <Text style={styles.fullAddressLabel}>Full address (tap to copy)</Text>
            <Text style={styles.fullAddress} numberOfLines={2}>
              {address}
            </Text>
          </Pressable>

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
            <Text style={styles.infoText}>
              Only send USDC on the Movement network. Sending other tokens or using other
              networks may result in permanent loss of funds.
            </Text>
          </View>
        </View>

        {/* Close Button */}
        <Pressable
          style={({ pressed }) => [styles.doneButton, pressed && styles.doneButtonPressed]}
          onPress={onClose}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      </View>
    </Modal>
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
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceHover,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    alignItems: 'center',
  },
  qrContainer: {
    padding: spacing[5],
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing[5],
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  instruction: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  addressContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing[3],
  },
  addressLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing[2],
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  address: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: spacing[2],
  },
  fullAddressContainer: {
    width: '100%',
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  fullAddressLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing[1],
  },
  fullAddress: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  infoBox: {
    flexDirection: 'row',
    gap: spacing[2],
    backgroundColor: colors.warning + '10',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginTop: 'auto',
    marginBottom: spacing[4],
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  doneButton: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[6],
    backgroundColor: colors.primary,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  doneButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  doneButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
});
