// TapMove Merchant Theme
export const theme = {
  colors: {
    // Primary - Movement Orange
    primary: "#FF6B00",
    primaryDark: "#E55A00",
    primaryLight: "#FF8533",

    // Secondary - Purple accent
    secondary: "#5b21b6",
    secondaryDark: "#4c1d95",

    // Status colors
    success: "#10b981",
    successDark: "#059669",
    warning: "#f59e0b",
    warningDark: "#d97706",
    error: "#ef4444",
    errorDark: "#dc2626",

    // Dark theme (default)
    background: "#0f172a",
    surface: "#1e293b",
    surfaceHover: "#334155",
    surfaceActive: "#475569",

    // Text
    text: "#f8fafc",
    textSecondary: "#cbd5e1",
    textMuted: "#94a3b8",
    textDisabled: "#64748b",

    // Borders
    border: "#334155",
    borderLight: "#475569",
    borderFocus: "#FF6B00",
  },

  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
    "3xl": "64px",
  },

  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
} as const;

export type Theme = typeof theme;
