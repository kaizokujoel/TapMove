import { useLogin } from '@privy-io/expo/ui';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

const LOGIN_METHODS = [
  { name: 'Email', icon: 'mail' },
  { name: 'Google', icon: 'logo-google' },
  { name: 'Apple', icon: 'logo-apple' },
  { name: 'Twitter', icon: 'logo-twitter' },
];

export default function PrivyUI() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { login } = useLogin();

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = () => {
    setError('');
    setIsLoading(true);

    login({
      loginMethods: ['email', 'google', 'apple', 'twitter'],
    })
      .then(() => setIsLoading(false))
      .catch((err) => {
        setError(err.error?.message || 'Failed to login. Please try again.');
        setIsLoading(false);
      });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo */}
        <Animated.View
          style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}
        >
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Ionicons name="flash" size={48} color={colors.primary} />
            </View>
          </View>
        </Animated.View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Welcome to TapMove</Text>
          <Text style={styles.subtitle}>
            Tap-to-pay crypto payments on Movement
          </Text>
        </View>

        {/* Login Button */}
        <Pressable
          style={({ pressed }) => [
            styles.loginButton,
            pressed && styles.loginButtonPressed,
            isLoading && styles.loginButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="wallet" size={22} color="#ffffff" />
            <Text style={styles.buttonText}>
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Text>
          </View>
        </Pressable>

        {/* Supported Methods */}
        <View style={styles.methodsContainer}>
          <Text style={styles.methodsTitle}>Sign in with</Text>
          <View style={styles.methodsGrid}>
            {LOGIN_METHODS.map((method, index) => (
              <View key={index} style={styles.methodTag}>
                <Ionicons
                  name={method.icon as any}
                  size={16}
                  color={colors.textMuted}
                />
                <Text style={styles.methodTagText}>{method.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={20} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
          <Text style={styles.footerText}>
            Secured by <Text style={styles.footerLink}>Privy</Text>
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingHorizontal: spacing[6],
    alignItems: 'center',
  },
  logoContainer: { marginBottom: spacing[10] },
  logoOuter: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: colors.primary + '20', justifyContent: 'center',
    alignItems: 'center', borderWidth: 2, borderColor: colors.primary + '40',
  },
  logoInner: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary + '30', justifyContent: 'center', alignItems: 'center',
  },
  titleSection: { marginBottom: spacing[12], alignItems: 'center' },
  title: {
    fontSize: typography.fontSize['3xl'], fontWeight: '700', color: colors.text,
    marginBottom: spacing[2], textAlign: 'center',
  },
  subtitle: { fontSize: typography.fontSize.base, color: colors.textMuted, textAlign: 'center' },
  loginButton: {
    width: '100%',
    marginBottom: spacing[8],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  loginButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  buttonText: {
    color: '#ffffff',
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  methodsContainer: {
    width: '100%',
    marginBottom: spacing[6],
  },
  methodsTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing[4],
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[2],
  },
  methodTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  methodTagText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: colors.error + '15',
    borderWidth: 1,
    borderColor: colors.error + '30',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: typography.fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    marginTop: spacing[8],
  },
  footerText: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
