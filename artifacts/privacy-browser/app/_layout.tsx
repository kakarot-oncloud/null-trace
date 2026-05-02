import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLockProvider } from "@/context/AppLockContext";
import { BrowserProvider } from "@/context/BrowserContext";
import { DownloadsProvider } from "@/context/DownloadsContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ProfileSyncGate } from "@/components/ProfileSyncGate";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profiles/index" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="profiles/[id]" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="proxy/index" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="settings/index" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="bookmarks/index" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="downloads/index" options={{ presentation: "modal", headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppLockProvider>
                <ProfileProvider>
                  <SettingsProvider>
                    <BrowserProvider>
                      <DownloadsProvider>
                        <ProfileSyncGate>
                          <RootLayoutNav />
                        </ProfileSyncGate>
                      </DownloadsProvider>
                    </BrowserProvider>
                  </SettingsProvider>
                </ProfileProvider>
              </AppLockProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
