import "@/global.css";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
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
      staleTime: 1000 * 5,         // 5s cache freshness for real-time responsiveness
      gcTime: 1000 * 60 * 10,      // 10m cache retention for back navigation
      retry: 2,
      refetchOnWindowFocus: true,  // Trigger refetch when app comes to foreground / focus
      refetchOnReconnect: true,    // Trigger refetch when network reconnects
    },
  },
});

import { useAppStateFocus } from "@/hooks/useAppStateFocus";
import { useNotificationHandler } from "@/hooks/useNotificationHandler";
import { UpdateModal } from "@/components/UpdateModal";

function AppProviders({ children }: { children: React.ReactNode }) {
  useAppStateFocus();
  useNotificationHandler();
  return (
    <>
      {children}
      <UpdateModal />
    </>
  );
}

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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppThemeProvider>
          <QueryClientProvider client={queryClient}>
            <HeroUINativeProvider>
              <AppProviders>
                <StackLayout />
                <Toast />
              </AppProviders>
            </HeroUINativeProvider>
          </QueryClientProvider>
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

