import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { TransactionStatus as TxStatus } from '@/types';

interface TransactionStatusProps {
  status: TxStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const statusConfig = {
  pending: {
    color: colors.warning,
    icon: null,
    label: 'Pending',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  confirmed: {
    color: colors.success,
    icon: 'checkmark-circle' as const,
    label: 'Confirmed',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  failed: {
    color: colors.error,
    icon: 'close-circle' as const,
    label: 'Failed',
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
};

const sizeConfig = {
  sm: { icon: 14, text: typography.fontSize.xs, padding: spacing[1] },
  md: { icon: 18, text: typography.fontSize.sm, padding: spacing[2] },
  lg: { icon: 24, text: typography.fontSize.base, padding: spacing[3] },
};

export function TransactionStatusBadge({
  status,
  size = 'md',
  showLabel = true
}: TransactionStatusProps) {
  const config = statusConfig[status];
  const sizeStyle = sizeConfig[size];

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: config.bgColor,
        paddingHorizontal: sizeStyle.padding * 1.5,
        paddingVertical: sizeStyle.padding,
      }
    ]}>
      {status === 'pending' ? (
        <ActivityIndicator size="small" color={config.color} />
      ) : (
        <Ionicons name={config.icon!} size={sizeStyle.icon} color={config.color} />
      )}
      {showLabel && (
        <Text style={[
          styles.label,
          { color: config.color, fontSize: sizeStyle.text, marginLeft: spacing[1] }
        ]}>
          {config.label}
        </Text>
      )}
    </View>
  );
}

export function TransactionStatusIcon({ status, size = 'md' }: TransactionStatusProps) {
  const config = statusConfig[status];
  const sizeStyle = sizeConfig[size];

  if (status === 'pending') {
    return <ActivityIndicator size="small" color={config.color} />;
  }

  return <Ionicons name={config.icon!} size={sizeStyle.icon} color={config.color} />;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  label: {
    fontWeight: '600',
  },
});
