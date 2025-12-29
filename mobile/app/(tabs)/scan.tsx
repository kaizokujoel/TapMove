// Scan Tab - QR Code and NFC payment options
import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { QRScanner } from '@/components/scan/qr-scanner';
import { useNfc } from '@/hooks/use-nfc';

export default function ScanTab() {
  const [showScanner, setShowScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const { isSupported, isEnabled, isActive, triggerIosScan, goToSettings } = useNfc();

  const handleScan = useCallback((paymentId: string) => {
    setShowScanner(false);
    router.push(`/pay/${paymentId}`);
  }, []);

  const handleManualSubmit = () => {
    const trimmedCode = manualCode.trim();
    if (!trimmedCode) {
      Alert.alert('Error', 'Please enter a payment code');
      return;
    }
    setShowManualEntry(false);
    setManualCode('');
    router.push(`/pay/${trimmedCode}`);
  };

  const handleTapToPay = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!isSupported) {
      Alert.alert('NFC Not Supported', 'Your device does not support NFC payments.');
      return;
    }

    if (!isEnabled) {
      Alert.alert(
        'NFC Disabled',
        'Please enable NFC in your device settings to use tap-to-pay.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: goToSettings },
        ]
      );
      return;
    }

    if (Platform.OS === 'ios') {
      // iOS requires explicit scan
      await triggerIosScan();
    } else {
      // Android - NFC should already be listening in background
      Alert.alert('Ready to Pay', 'Hold your phone near the payment terminal');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Scan to Pay</Text>
          <Text style={styles.subtitle}>
            Scan a QR code or tap your phone to pay
          </Text>
        </View>

        {/* Scan Options */}
        <View style={styles.optionsContainer}>
          <Pressable style={styles.optionCard} onPress={() => setShowScanner(true)}>
            <View style={[styles.optionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="qr-code" size={32} color={colors.primary} />
            </View>
            <Text style={styles.optionTitle}>Scan QR Code</Text>
            <Text style={styles.optionDescription}>
              Scan merchant's QR code to pay
            </Text>
          </Pressable>

          <Pressable style={styles.optionCard} onPress={handleTapToPay}>
            <View style={[styles.optionIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="phone-portrait" size={32} color={colors.secondary} />
            </View>
            <Text style={styles.optionTitle}>Tap to Pay</Text>
            <Text style={styles.optionDescription}>
              Hold your phone near the terminal
            </Text>
          </Pressable>
        </View>

        {/* NFC Status */}
        <View style={styles.nfcStatus}>
          <View style={styles.nfcIndicator}>
            <Ionicons
              name={isActive ? "radio" : isEnabled ? "radio-outline" : "radio-button-off"}
              size={20}
              color={!isSupported ? colors.textMuted : isEnabled ? colors.success : colors.warning}
            />
            <Text style={styles.nfcText}>
              {!isSupported
                ? "NFC Not Supported"
                : !isEnabled
                ? "NFC Disabled"
                : isActive
                ? "NFC Scanning..."
                : "NFC Ready"}
            </Text>
          </View>
        </View>
      </View>

      {/* QR Scanner Modal */}
      <Modal visible={showScanner} animationType="slide" presentationStyle="fullScreen">
        <QRScanner
          onScan={handleScan}
          onManualEntry={() => {
            setShowScanner(false);
            setShowManualEntry(true);
          }}
          onClose={() => setShowScanner(false)}
        />
      </Modal>

      {/* Manual Entry Modal */}
      <Modal visible={showManualEntry} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Payment Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Payment ID"
              placeholderTextColor={colors.textMuted}
              value={manualCode}
              onChangeText={setManualCode}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => {
                  setShowManualEntry(false);
                  setManualCode('');
                }}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.submitModalButton]} onPress={handleManualSubmit}>
                <Text style={styles.submitModalText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing[4] },
  header: { marginBottom: spacing[8] },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: '700', color: colors.text, marginBottom: spacing[2] },
  subtitle: { fontSize: typography.fontSize.base, color: colors.textMuted },
  optionsContainer: { gap: spacing[4] },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  optionIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  optionTitle: { fontSize: typography.fontSize.lg, fontWeight: '600', color: colors.text, marginBottom: spacing[1] },
  optionDescription: { fontSize: typography.fontSize.sm, color: colors.textMuted, textAlign: 'center' },
  nfcStatus: { marginTop: 'auto', paddingTop: spacing[6] },
  nfcIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nfcText: { fontSize: typography.fontSize.sm, color: colors.textMuted, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing[4] },
  modalContent: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing[6] },
  modalTitle: { fontSize: typography.fontSize.xl, fontWeight: '600', color: colors.text, marginBottom: spacing[4], textAlign: 'center' },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing[4],
  },
  modalActions: { flexDirection: 'row', gap: spacing[3] },
  modalButton: { flex: 1, paddingVertical: spacing[3], borderRadius: borderRadius.lg, alignItems: 'center' },
  cancelModalButton: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  cancelModalText: { fontSize: typography.fontSize.base, fontWeight: '600', color: colors.text },
  submitModalButton: { backgroundColor: colors.primary },
  submitModalText: { fontSize: typography.fontSize.base, fontWeight: '600', color: '#fff' },
});
