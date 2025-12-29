import { useEffect } from 'react';
import Constants from 'expo-constants';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PrivyProvider, usePrivy } from '@privy-io/expo';
import { PrivyElements } from '@privy-io/expo/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import * as Linking from 'expo-linking';
import { colors } from '@/constants/theme';
import { NfcProvider } from '@/providers/nfc-provider';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { logger } from '@/lib/logger';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function RootLayoutNav() {
  const { user, isReady } = usePrivy();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to tabs if authenticated
      router.replace('/(tabs)');
    }
  }, [user, isReady, segments]);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      if (url.startsWith('tapmove://pay')) {
        const paymentId = url.split('id=')[1];
        if (paymentId) {
          router.push(`/pay/${paymentId}`);
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="pay/[id]"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary
      onError={(error) => {
        logger.error('Root error boundary caught error', {
          message: error.message,
        });
      }}
    >
      <QueryClientProvider client={queryClient}>
        <PrivyProvider
          appId={Constants.expoConfig?.extra?.privyAppId}
          clientId={Constants.expoConfig?.extra?.privyClientId}
        >
          <NfcProvider autoListen={true}>
            <RootLayoutNav />
            <PrivyElements />
          </NfcProvider>
        </PrivyProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
