// NFC Hook - Provides NFC functionality to components
// This is a convenience wrapper around the NFC context

import { useNfcContext } from '@/providers/nfc-provider';

/**
 * Hook to access NFC functionality
 *
 * Usage:
 * ```tsx
 * const { isSupported, isEnabled, isListening, startListening, stopListening } = useNfc();
 * ```
 */
export function useNfc() {
  const context = useNfcContext();

  return {
    // State
    isSupported: context.isSupported,
    isEnabled: context.isEnabled,
    isListening: context.isListening,
    status: context.status,
    error: context.error,

    // Actions
    startListening: context.startListening,
    stopListening: context.stopListening,
    triggerIosScan: context.triggerIosScan,
    refreshStatus: context.refreshStatus,
    goToSettings: context.goToSettings,

    // Computed
    isReady: context.isSupported && context.isEnabled,
    isActive: context.isListening || context.status === 'listening',
  };
}

export type UseNfcReturn = ReturnType<typeof useNfc>;
