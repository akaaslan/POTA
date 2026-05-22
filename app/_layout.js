import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GlobalSheets from '../src/components/GlobalSheets';
import { C } from '../src/theme';

var queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="filter" options={{ presentation: 'card', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="create-run" options={{ presentation: 'card', animation: 'slide_from_bottom' }} />
        </Stack>
        <GlobalSheets />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
