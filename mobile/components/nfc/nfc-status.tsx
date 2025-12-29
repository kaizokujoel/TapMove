// NFC Status Component - Visual indicator for NFC state
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNfc } from '@/hooks/use-nfc';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import type { NfcStatus } from '@/lib/nfc';

interface NfcStatusBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  onPress?: () => void;
}

export function NfcStatusBadge({
  size = 'medium',
  showLabel = true,
  onPress,
}: NfcStatusBadgeProps) {
  const { status, isListening, goToSettings, triggerIosScan } = useNfc();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation when listening
  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
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

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (status === 'disabled') {
      goToSettings();
    } else if (Platform.OS === 'ios' && status === 'ready') {
      triggerIosScan();
    }
  };

  const config = getStatusConfig(status, isListening);
  const sizeConfig = getSizeConfig(size);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: config.bgColor },
        pressed && styles.pressed,
      ]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          { width: sizeConfig.iconSize, height: sizeConfig.iconSize },
          isListening && { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Ionicons
          name={config.icon as any}
          size={sizeConfig.iconSize * 0.6}
          color={config.color}
        />
      </Animated.View>

      {showLabel && (
        <Text
          style={[styles.label, { fontSize: sizeConfig.fontSize, color: config.color }]}
        >
          {config.label}
        </Text>
      )}

      {status === 'disabled' && (
        <Ionicons
          name="chevron-forward"
          size={sizeConfig.fontSize}
          color={config.color}
        />
      )}
    </Pressable>
  );
}

interface NfcStatusIndicatorProps {
  compact?: boolean;
}

export function NfcStatusIndicator({ compact = false }: NfcStatusIndicatorProps) {
  const { status, isListening } = useNfc();
  const config = getStatusConfig(status, isListening);

  if (compact) {
    return (
      <View style={[styles.dot, { backgroundColor: config.color }]} />
    );
  }

  return (
    <View style={[styles.indicator, { backgroundColor: config.bgColor }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.indicatorText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

function getStatusConfig(
  status: NfcStatus,
  isListening: boolean
): { icon: string; label: string; color: string; bgColor: string } {
  if (isListening) {
    return {
      icon: 'radio-outline',
      label: 'Scanning...',
      color: colors.primary,
      bgColor: colors.primary + '15',
    };
  }

  switch (status) {
    case 'ready':
      return {
        icon: 'phone-portrait-outline',
        label: 'NFC Ready',
        color: colors.success,
        bgColor: colors.success + '15',
      };
    case 'disabled':
      return {
        icon: 'phone-portrait-outline',
        label: 'Enable NFC',
        color: colors.warning,
        bgColor: colors.warning + '15',
      };
    case 'unsupported':
      return {
        icon: 'close-circle-outline',
        label: 'No NFC',
        color: colors.textMuted,
        bgColor: colors.surfaceHover,
      };
    default:
      return {
        icon: 'help-circle-outline',
        label: 'Checking...',
        color: colors.textMuted,
        bgColor: colors.surfaceHover,
      };
  }
}

function getSizeConfig(size: 'small' | 'medium' | 'large') {
  switch (size) {
    case 'small':
      return { iconSize: 24, fontSize: 12 };
    case 'large':
      return { iconSize: 40, fontSize: 16 };
    default:
      return { iconSize: 32, fontSize: 14 };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    gap: spacing[2],
  },
  pressed: {
    opacity: 0.8,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    gap: spacing[2],
  },
  indicatorText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
});
