import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "expo-router/drawer";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useSocietyStore } from "@/store/useSocietyStore";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAppTheme } from "@/contexts/app-theme-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function CustomDrawerContent(props: any) {
  const { data: session } = authClient.useSession();
  const { isLight } = useAppTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { reset: resetSocietyStore } = useSocietyStore();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      resetSocietyStore();
      queryClient.clear();
    }
  };

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <View style={{ flex: 1, backgroundColor: isLight ? "#fcfbf9" : "#1c1917" }}>
      {/* 1. Header Profile block */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16) }}
        className="px-5 pb-6 border-b border-border-light dark:border-border-dark bg-muted-light/20 dark:bg-muted-dark/20 flex-row items-center gap-3"
      >
        <View className="w-11 h-11 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark justify-center items-center">
          {session?.user?.image ? (
            <Image source={{ uri: session.user.image }} className="w-full h-full" />
          ) : (
            <Text className="text-foreground-light dark:text-foreground-dark text-sm font-black">
              {initials}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-foreground-light dark:text-foreground-dark text-sm font-bold leading-4" numberOfLines={1}>
            {session?.user?.name || "Portl User"}
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5" numberOfLines={1}>
            {session?.user?.email || "user@portl.com"}
          </Text>
        </View>
      </View>

      {/* 2. Menu Navigation Links List (Scrollable) */}
      <DrawerContentScrollView
        {...props}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 10 }}
      >
        <View className="px-1">
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* 3. Footer Logout block */}
      <View className="p-5 border-t border-border-light dark:border-border-dark bg-muted-light/10 dark:bg-muted-dark/10 flex-row justify-between items-center">
        <ThemeToggle />
        <Pressable
          onPress={handleSignOut}
          className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark py-2 px-4 rounded-xl active:opacity-75"
          accessibilityRole="button"
          accessibilityLabel="Sign out of organization account"
        >
          <Text className="text-rose-500 text-xs font-bold">Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}
export default CustomDrawerContent;
