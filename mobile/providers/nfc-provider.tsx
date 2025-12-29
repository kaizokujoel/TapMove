// NFC Provider - Manages NFC state across the app
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { nfcManager, NfcStatus, nfcFeedback } from '@/lib/nfc';

interface NfcContextValue {
  isSupported: boolean;
  isEnabled: boolean;
  isListening: boolean;
  status: NfcStatus;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  triggerIosScan: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  goToSettings: () => Promise<void>;
}

const NfcContext = createContext<NfcContextValue | null>(null);

interface NfcProviderProps {
  children: React.ReactNode;
  autoListen?: boolean;
}

export function NfcProvider({ children, autoListen = true }: NfcProviderProps) {
  const router = useRouter();
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<NfcStatus>('unsupported');
  const [error, setError] = useState<string | null>(null);

  const appStateRef = useRef(AppState.currentState);
  const autoListenRef = useRef(autoListen);
  autoListenRef.current = autoListen;

  // Handle payment detection
  const handlePaymentDetected = useCallback(
    async (paymentId: string) => {
      // Trigger haptic feedback
      await nfcFeedback.onTagDetected();

      // Navigate to payment screen
      router.push(`/pay/${paymentId}`);
    },
    [router]
  );

  // Initialize NFC on mount
  useEffect(() => {
    const init = async () => {
      const initialized = await nfcManager.initialize();
      if (initialized) {
        await refreshStatus();

        // Auto-start listening on Android if NFC is ready
        if (autoListenRef.current && Platform.OS === 'android') {
          const state = await nfcManager.getState();
          if (state.isEnabled) {
            await startListeningInternal();
          }
        }
      }
    };

    init();

    return () => {
      nfcManager.cleanup();
    };
  }, []);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appStateRef.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App came to foreground - refresh NFC status
      await refreshStatus();

      // Restart listening if auto-listen is enabled
      if (autoListenRef.current && Platform.OS === 'android') {
        const state = await nfcManager.getState();
        if (state.isEnabled && !isListening) {
          await startListeningInternal();
        }
      }
    } else if (nextAppState.match(/inactive|background/)) {
      // App going to background - stop listening to save battery
      if (isListening) {
        await stopListeningInternal();
      }
    }

    appStateRef.current = nextAppState;
  };

  const refreshStatus = async () => {
    try {
      const state = await nfcManager.getState();
      setIsSupported(state.isSupported);
      setIsEnabled(state.isEnabled);
      setStatus(state.status);
      setError(null);
    } catch (err) {
      setError('Failed to check NFC status');
    }
  };

  const startListeningInternal = async () => {
    try {
      await nfcManager.startListening(handlePaymentDetected);
      setIsListening(true);
      setStatus('listening');
      await nfcFeedback.onListeningStart();
    } catch (err) {
      setError('Failed to start NFC listener');
      setIsListening(false);
    }
  };

  const stopListeningInternal = async () => {
    try {
      await nfcManager.stopListening();
      setIsListening(false);
      setStatus(isEnabled ? 'ready' : 'disabled');
    } catch (err) {
      setError('Failed to stop NFC listener');
    }
  };

  const startListening = async () => {
    if (!isSupported) {
      setError('NFC is not supported on this device');
      return;
    }

    if (!isEnabled) {
      setError('Please enable NFC in settings');
      await nfcFeedback.onWarning();
      return;
    }

    await startListeningInternal();
  };

  const stopListening = async () => {
    await stopListeningInternal();
  };

  const triggerIosScan = async () => {
    if (Platform.OS !== 'ios') {
      // On Android, just ensure we're listening
      if (!isListening) {
        await startListening();
      }
      return;
    }

    try {
      await nfcManager.startIosScan(handlePaymentDetected);
    } catch (err) {
      setError('NFC scan failed');
    }
  };

  const goToSettings = async () => {
    await nfcManager.goToNfcSettings();
  };

  const value: NfcContextValue = {
    isSupported,
    isEnabled,
    isListening,
    status,
    error,
    startListening,
    stopListening,
    triggerIosScan,
    refreshStatus,
    goToSettings,
  };

  return <NfcContext.Provider value={value}>{children}</NfcContext.Provider>;
}

export function useNfcContext(): NfcContextValue {
  const context = useContext(NfcContext);
  if (!context) {
    throw new Error('useNfcContext must be used within NfcProvider');
  }
  return context;
}
