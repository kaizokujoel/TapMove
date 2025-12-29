// Confirm Button Component - Biometric prompt with loading/success states
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

type ButtonState = 'idle' | 'authenticating' | 'processing' | 'success' | 'error';

interface ConfirmButtonProps {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  disabled?: boolean;
  amount: string;
}

export function ConfirmButton({ onConfirm, onCancel, disabled, amount }: ConfirmButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');
  const [biometricType, setBiometricType] = useState<string>('Biometrics');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkBiometricType();
  }, []);

  const checkBiometricType = async () => {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      setBiometricType('Face ID');
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      setBiometricType('Touch ID');
    }
  };

  const handlePress = async () => {
    if (disabled || state !== 'idle') return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState('authenticating');

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Proceed without biometrics if not available
        setState('processing');
        await onConfirm();
        handleSuccess();
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Pay ${amount}`,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setState('processing');
        await onConfirm();
        handleSuccess();
      } else {
        setState('idle');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      setState('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const handleSuccess = () => {
    setState('success');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(successAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const getButtonContent = () => {
    switch (state) {
      case 'authenticating':
        return (
          <>
            <Ionicons name="finger-print" size={24} color="#fff" />
            <Text style={styles.buttonText}>Authenticating...</Text>
          </>
        );
      case 'processing':
        return (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.buttonText}>Processing...</Text>
          </>
        );
      case 'success':
        return (
          <>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.buttonText}>Payment Sent!</Text>
          </>
        );
      case 'error':
        return (
          <>
            <Ionicons name="alert-circle" size={24} color="#fff" />
            <Text style={styles.buttonText}>Try Again</Text>
          </>
        );
      default:
        return (
          <>
            <Ionicons name="finger-print" size={24} color="#fff" />
            <Text style={styles.buttonText}>Confirm with {biometricType}</Text>
          </>
        );
    }
  };

  const getButtonStyle = () => {
    if (state === 'success') return [styles.button, styles.successButton];
    if (state === 'error') return [styles.button, styles.errorButton];
    if (disabled) return [styles.button, styles.disabledButton];
    return [styles.button];
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          style={getButtonStyle()}
          onPress={handlePress}
          disabled={disabled || state !== 'idle'}
        >
          {getButtonContent()}
        </Pressable>
      </Animated.View>

      <Pressable
        style={styles.cancelButton}
        onPress={onCancel}
        disabled={state === 'processing'}
      >
        <Text style={styles.cancelText}>Cancel Payment</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
    gap: spacing[2],
  },
  successButton: {
    backgroundColor: colors.success,
  },
  errorButton: {
    backgroundColor: colors.error,
  },
  disabledButton: {
    backgroundColor: colors.textMuted,
    opacity: 0.6,
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
