// TapMove Theme Constants
// Movement orange as primary, dark theme support

export const colors = {
  // Primary - Movement Orange
  primary: '#FF6B00',
  primaryDark: '#E55A00',
  primaryLight: '#FF8533',

  // Secondary - Purple accent
  secondary: '#5b21b6',
  secondaryDark: '#4c1d95',
  secondaryLight: '#7c3aed',

  // Status colors
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  error: '#ef4444',
  errorLight: '#f87171',

  // Dark theme
  background: '#0f172a',
  backgroundSecondary: '#1e293b',
  surface: '#1e293b',
  surfaceHover: '#334155',
  surfaceElevated: '#334155',

  // Light theme
  backgroundLight: '#f8fafc',
  surfaceLight: '#ffffff',
  surfaceHoverLight: '#f1f5f9',

  // Text - Dark theme
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textInverse: '#0f172a',

  // Text - Light theme
  textLight: '#0f172a',
  textSecondaryLight: '#475569',
  textMutedLight: '#64748b',

  // Borders
  border: '#334155',
  borderLight: '#e2e8f0',

  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export const typography = {
  // Font families
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_600SemiBold', // Using semibold as bold
    mono: 'monospace',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  primary: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// Dark theme object for easy reference
export const darkTheme = {
  background: colors.background,
  surface: colors.surface,
  surfaceHover: colors.surfaceHover,
  text: colors.text,
  textSecondary: colors.textSecondary,
  textMuted: colors.textMuted,
  border: colors.border,
  primary: colors.primary,
  secondary: colors.secondary,
} as const;

// Light theme object for easy reference
export const lightTheme = {
  background: colors.backgroundLight,
  surface: colors.surfaceLight,
  surfaceHover: colors.surfaceHoverLight,
  text: colors.textLight,
  textSecondary: colors.textSecondaryLight,
  textMuted: colors.textMutedLight,
  border: colors.borderLight,
  primary: colors.primary,
  secondary: colors.secondary,
} as const;
