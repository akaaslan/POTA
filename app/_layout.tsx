import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GlobalSheets from '../src/components/GlobalSheets';
import NetworkStatusBanner from '../src/components/NetworkStatusBanner';
import { usePushNotifications } from '../src/domains/notifications/hooks/usePushNotifications';
import { useRealtimeMatches } from '../src/domains/match/hooks/useRealtimeMatches';
import { C } from '../src/theme';

var queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            30_000,
      gcTime:               1000 * 60 * 10,
      retry:                1,
      refetchOnWindowFocus: false,
      networkMode:          'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

// Push notification hook'unu root seviyede çalıştıran wrapper
function AppProviders({ children }: { children: React.ReactNode }) {
  usePushNotifications();
  useRealtimeMatches(); // Tek yerden — duplicate subscription olmaz
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppProviders>
          <StatusBar style="light" />
          <NetworkStatusBanner />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="filter"     options={{ presentation: 'card', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="create-run" options={{ presentation: 'card', animation: 'slide_from_bottom' }} />
          </Stack>
          <GlobalSheets />
        </AppProviders>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
