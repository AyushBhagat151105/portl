import "@/global.css";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AppThemeProvider } from "@/contexts/app-theme-context";
import { Toast } from "@/components/ui/toast";

export const unstable_settings = {
  initialRouteName: "(drawer)",
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,       // 30s — don't refetch if data is under 30s old
      gcTime: 1000 * 60 * 5,      // 5min — keep unused cache alive for back-nav
      retry: 1,                   // one retry on network error, then fail fast
      refetchOnWindowFocus: false, // no-op on native but explicit is better
    },
  },
});

function StackLayout() {
  return (
    <Stack screenOptions={{}}>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ title: "Modal", presentation: "modal" }} />
    </Stack>
  );
}

export default function Layout() {
  useEffect(() => {
    if (Platform.OS !== "web") {
      import("@/lib/notifications")
        .then(({ registerForPushNotificationsAsync }) => registerForPushNotificationsAsync())
        .catch(console.warn);
    }
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppThemeProvider>
          <QueryClientProvider client={queryClient}>
            <HeroUINativeProvider>
              <StackLayout />
              <Toast />
            </HeroUINativeProvider>
          </QueryClientProvider>
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

