// Ready to Pay Section - Shows NFC/QR payment options
import { View, Text, StyleSheet, Pressable, Platform, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNfc } from '@/hooks/use-nfc';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

export function ReadyToPaySection() {
  const router = useRouter();
  const { isSupported, isEnabled, isListening, goToSettings, triggerIosScan } = useNfc();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation when actively listening
  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const handleScanQR = () => {
    router.push('/(tabs)/scan');
  };

  const handleNfcTap = () => {
    if (!isEnabled) {
      goToSettings();
    } else if (Platform.OS === 'ios') {
      triggerIosScan();
    }
  };

  const isNfcReady = isSupported && isEnabled;
  const statusText = isListening
    ? 'Listening for payment...'
    : isNfcReady
    ? 'Ready to pay'
    : isSupported === false
    ? 'NFC not available - use QR'
    : !isEnabled
    ? 'Enable NFC to tap & pay'
    : 'Checking NFC...';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Methods</Text>

      <View style={styles.optionsRow}>
        {/* NFC Option */}
        <Pressable
          style={({ pressed }) => [
            styles.option,
            !isNfcReady && !isListening && styles.optionDisabled,
            pressed && styles.optionPressed,
          ]}
          onPress={handleNfcTap}
          disabled={!isSupported}
        >
          <Animated.View
            style={[
              styles.iconCircle,
              (isNfcReady || isListening) && styles.iconCircleActive,
              isListening && styles.iconCircleListening,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Ionicons
              name={isListening ? 'radio-outline' : 'phone-portrait-outline'}
              size={28}
              color={isListening ? colors.primary : isNfcReady ? colors.primary : colors.textMuted}
            />
          </Animated.View>
          <Text style={styles.optionTitle}>Tap to Pay</Text>
          <Text style={styles.optionSubtitle}>
            {isListening ? 'Scanning...' : isNfcReady ? 'NFC Ready' : !isEnabled ? 'Tap to Enable' : 'Unavailable'}
          </Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* QR Option */}
        <Pressable
          style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
          onPress={handleScanQR}
        >
          <View style={[styles.iconCircle, styles.iconCircleActive]}>
            <Ionicons name="qr-code-outline" size={28} color={colors.primary} />
          </View>
          <Text style={styles.optionTitle}>Scan QR</Text>
          <Text style={styles.optionSubtitle}>Camera ready</Text>
        </Pressable>
      </View>

      {/* Status Bar */}
      <View style={[
        styles.statusBar,
        isNfcReady && styles.statusBarActive,
        isListening && styles.statusBarListening,
      ]}>
        <View style={[
          styles.statusDot,
          isNfcReady && styles.statusDotActive,
          isListening && styles.statusDotListening,
        ]} />
        <Text style={[
          styles.statusText,
          isNfcReady && styles.statusTextActive,
          isListening && styles.statusTextListening,
        ]}>
          {statusText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing[4],
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionPressed: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  iconCircleActive: {
    backgroundColor: colors.primary + '15',
  },
  iconCircleListening: {
    backgroundColor: colors.primary + '25',
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  optionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  optionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing[1],
  },
  divider: {
    alignItems: 'center',
    paddingHorizontal: spacing[3],
  },
  dividerLine: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    paddingVertical: spacing[1],
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
  },
  statusBarActive: {
    backgroundColor: colors.success + '15',
  },
  statusBarListening: {
    backgroundColor: colors.primary + '15',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.textMuted,
  },
  statusDotActive: {
    backgroundColor: colors.success,
  },
  statusDotListening: {
    backgroundColor: colors.primary,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextListening: {
    color: colors.primary,
  },
});
