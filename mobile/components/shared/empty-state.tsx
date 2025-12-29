import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'folder-open-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container} accessibilityRole="text">
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color={colors.textMuted} />
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>

      <Text style={styles.message}>{message}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },
  iconContainer: {
    marginBottom: spacing[4],
    padding: spacing[4],
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
    marginBottom: spacing[6],
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
  },
  actionButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text,
  },
});

export default EmptyState;
