import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log the error
    logger.error('ErrorBoundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleRestart = () => {
    // Reset state and try again
    this.handleRetry();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning" size={64} color={colors.error} />
            </View>

            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              We apologize for the inconvenience. The app encountered an unexpected error.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorText}>
                  {this.state.error.message}
                </Text>
                <Text style={styles.stackText}>
                  {this.state.error.stack?.slice(0, 500)}
                </Text>
              </ScrollView>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={this.handleRetry}
                accessibilityLabel="Try again"
                accessibilityRole="button"
              >
                <Ionicons name="refresh" size={20} color={colors.text} />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restartButton}
                onPress={this.handleRestart}
                accessibilityLabel="Restart app"
                accessibilityRole="button"
              >
                <Ionicons name="power" size={20} color={colors.text} />
                <Text style={styles.restartButtonText}>Restart App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: spacing[6],
    padding: spacing[4],
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.semibold,
    color: colors.text,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: 24,
  },
  errorDetails: {
    maxHeight: 150,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[6],
    width: '100%',
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    color: colors.error,
    marginBottom: spacing[2],
  },
  stackText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.mono,
    color: colors.textMuted,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    gap: spacing[2],
  },
  retryButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing[2],
  },
  restartButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text,
  },
});

export default ErrorBoundary;
