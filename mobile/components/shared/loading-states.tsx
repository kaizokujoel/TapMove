import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius } from '@/constants/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

export function LoadingSpinner({
  size = 'large',
  color = colors.primary,
  style,
}: LoadingSpinnerProps) {
  return (
    <View style={[styles.spinnerContainer, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

function SkeletonBase({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.md,
  style,
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  style?: ViewStyle;
}

export function SkeletonCard({
  lines = 3,
  showAvatar = false,
  style,
}: SkeletonCardProps) {
  return (
    <View style={[styles.skeletonCard, style]}>
      {showAvatar && (
        <View style={styles.skeletonHeader}>
          <SkeletonBase
            width={48}
            height={48}
            borderRadius={borderRadius.full}
          />
          <View style={styles.skeletonHeaderText}>
            <SkeletonBase width="60%" height={16} />
            <SkeletonBase width="40%" height={12} style={styles.mt2} />
          </View>
        </View>
      )}
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBase
          key={index}
          width={index === lines - 1 ? '60%' : '100%'}
          height={14}
          style={index > 0 ? styles.mt3 : undefined}
        />
      ))}
    </View>
  );
}

interface SkeletonTextProps {
  lines?: number;
  style?: ViewStyle;
}

export function SkeletonText({ lines = 1, style }: SkeletonTextProps) {
  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBase
          key={index}
          width={index === lines - 1 ? '75%' : '100%'}
          height={14}
          style={index > 0 ? styles.mt2 : undefined}
        />
      ))}
    </View>
  );
}

// Balance skeleton for home screen
export function BalanceSkeleton() {
  return (
    <View style={styles.balanceSkeleton}>
      <SkeletonBase width={120} height={14} />
      <SkeletonBase width={180} height={40} style={styles.mt3} />
      <SkeletonBase width={100} height={14} style={styles.mt2} />
    </View>
  );
}

// Transaction skeleton for lists
export function TransactionSkeleton() {
  return (
    <View style={styles.transactionSkeleton}>
      <SkeletonBase width={40} height={40} borderRadius={borderRadius.full} />
      <View style={styles.transactionSkeletonContent}>
        <SkeletonBase width="70%" height={16} />
        <SkeletonBase width="40%" height={12} style={styles.mt2} />
      </View>
      <SkeletonBase width={60} height={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  skeleton: {
    backgroundColor: colors.surface,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  skeletonHeaderText: {
    flex: 1,
    marginLeft: spacing[3],
  },
  mt2: {
    marginTop: spacing[2],
  },
  mt3: {
    marginTop: spacing[3],
  },
  balanceSkeleton: {
    alignItems: 'center',
    padding: spacing[6],
  },
  transactionSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    gap: spacing[3],
  },
  transactionSkeletonContent: {
    flex: 1,
  },
});
