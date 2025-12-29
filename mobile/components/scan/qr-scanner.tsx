// QR Scanner Component with animated scan line
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { parseTapMoveUrl } from '@/lib/payment-service';

interface QRScannerProps {
  onScan: (paymentId: string) => void;
  onManualEntry: () => void;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

export function QRScanner({ onScan, onManualEntry, onClose }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false);
  const [scanned, setScanned] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate scan line up and down
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scanLineAnim]);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;

    const paymentId = parseTapMoveUrl(result.data);
    if (paymentId) {
      setScanned(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onScan(paymentId);
    }
  };

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 4],
  });

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.textMuted} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            To scan QR codes, please allow camera access
          </Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Allow Camera</Text>
          </Pressable>
          <Pressable style={styles.manualButton} onPress={onManualEntry}>
            <Text style={styles.manualButtonText}>Enter Code Manually</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={flashOn}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <Pressable style={styles.flashButton} onPress={() => setFlashOn(!flashOn)}>
            <Ionicons name={flashOn ? 'flash' : 'flash-off'} size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Scan Area */}
        <View style={styles.scanAreaContainer}>
          <View style={styles.scanArea}>
            {/* Corner indicators */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Animated scan line */}
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanLineTranslate }] },
              ]}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Point your camera at a TapMove QR code
          </Text>
          <Pressable style={styles.manualEntryButton} onPress={onManualEntry}>
            <Ionicons name="keypad" size={20} color={colors.primary} />
            <Text style={styles.manualEntryText}>Enter code manually</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: '#fff',
  },
  flashButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary,
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  footer: { paddingHorizontal: spacing[4], paddingBottom: 100, alignItems: 'center' },
  footerText: { fontSize: typography.fontSize.base, color: '#fff', marginBottom: spacing[4] },
  manualEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
  },
  manualEntryText: { fontSize: typography.fontSize.base, color: colors.primary, fontWeight: '500' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[6] },
  permissionTitle: { fontSize: typography.fontSize.xl, fontWeight: '600', color: colors.text, marginTop: spacing[4] },
  permissionText: { fontSize: typography.fontSize.base, color: colors.textMuted, textAlign: 'center', marginTop: spacing[2] },
  permissionButton: {
    marginTop: spacing[6],
    backgroundColor: colors.primary,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.lg,
  },
  permissionButtonText: { fontSize: typography.fontSize.base, fontWeight: '600', color: '#fff' },
  manualButton: { marginTop: spacing[4] },
  manualButtonText: { fontSize: typography.fontSize.base, color: colors.primary },
});
