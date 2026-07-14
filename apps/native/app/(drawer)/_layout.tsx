import { Ionicons } from "@expo/vector-icons";
import { Drawer, DrawerContentScrollView, DrawerItemList } from "expo-router/drawer";
import { useThemeColor } from "heroui-native";
import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { authClient } from "@/lib/auth-client";
import { useSocietyStore } from "@/store/useSocietyStore";
import { ThemeToggle } from "@/components/theme-toggle";
import { router } from "expo-router";
import { useAppTheme } from "@/contexts/app-theme-context";

function CustomDrawerContent(props: any) {
  const { currentRole, setRole } = useSocietyStore();
  const { data: session } = authClient.useSession();
  const { isLight } = useAppTheme();

  return (
    <DrawerContentScrollView 
      {...props} 
      contentContainerStyle={{ 
        flex: 1, 
        backgroundColor: isLight ? "#fcfbf9" : "#1c1917" 
      }}
    >
      {/* 1. Header Profile block */}
      <View className="px-5 py-6 border-b border-border-light dark:border-border-dark mb-4 bg-muted-light/20 dark:bg-muted-dark/20">
        <Text className="text-foreground-light dark:text-foreground-dark text-lg font-bold">
          {session?.user?.name || "Portl User"}
        </Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
          {session?.user?.email || "user@portl.com"}
        </Text>
      </View>

      {/* 2. Menu Navigation Links List */}
      <View className="flex-1 px-2">
        <DrawerItemList {...props} />
      </View>

      {/* 3. Footer Logout block */}
      <View className="p-5 border-t border-border-light dark:border-border-dark bg-muted-light/10 dark:bg-muted-dark/10 flex-row justify-between items-center">
        <ThemeToggle />
        <Pressable
          onPress={() => authClient.signOut()}
          className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark py-2 px-4 rounded-xl active:opacity-75"
        >
          <Text className="text-rose-500 text-xs font-semibold">Sign Out</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { currentRole } = useSocietyStore();
  const { isLight } = useAppTheme();
  const { data: session, isPending } = authClient.useSession();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/(auth)/sign-in");
    }
  }, [session, isPending]);

  if (isPending) {
    return (
      <View className="flex-1 bg-zinc-950 dark:bg-zinc-50 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!session) {
    return null;
  }

  const bgColor = isLight ? "#fcfbf9" : "#1c1917";
  const fgColor = isLight ? "#4a3b33" : "#f5f5f4";
  const borderColor = isLight ? "#e8e5dc" : "#44403c";
  const inactiveTintColor = isLight ? "#78716c" : "#a8a29e";
  const activeTintColor = isLight ? "#b45309" : "#f97316";

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTintColor: fgColor,
        headerStyle: { backgroundColor: bgColor, borderBottomWidth: 1, borderBottomColor: borderColor },
        headerTitleStyle: {
          fontWeight: "700",
          color: fgColor,
        },
        drawerStyle: { backgroundColor: bgColor },
        drawerActiveTintColor: activeTintColor,
        drawerInactiveTintColor: inactiveTintColor,
        drawerLabelStyle: { fontSize: 13, fontWeight: "600" },
      }}
    >
      {/* Dynamic router redirector gate (hidden from drawer list) */}
      <Drawer.Screen
        name="index"
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />

      {/* Legacy placeholder (hidden from drawer list) */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />

      {/* ==================== RESIDENT VIEWS ==================== */}
      <Drawer.Screen
        name="resident/dashboard"
        options={{
          headerTitle: "Home Board",
          drawerLabel: "Notice Board & Polls",
          drawerItemStyle: { display: currentRole === "resident" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="megaphone-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="resident/pre-approve"
        options={{
          headerTitle: "Pre-approve Guest",
          drawerLabel: "Guest Passes",
          drawerItemStyle: { display: currentRole === "resident" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="qr-code-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="resident/book-amenity"
        options={{
          headerTitle: "Book Amenity",
          drawerLabel: "Amenities Scheduler",
          drawerItemStyle: { display: currentRole === "resident" || currentRole === "admin" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="resident/helpdesk"
        options={{
          headerTitle: "Complaints Helpdesk",
          drawerLabel: "Helpdesk Tickets",
          drawerItemStyle: { display: currentRole === "resident" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="chatbubbles-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="resident/directory"
        options={{
          headerTitle: "Staff Contacts",
          drawerLabel: "Staff Directory",
          drawerItemStyle: { display: currentRole === "resident" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="resident/notifications"
        options={{
          headerTitle: "Alerts Logs",
          drawerLabel: "Notifications History",
          drawerItemStyle: { display: currentRole === "resident" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="notifications-outline" size={size} color={color} />,
        }}
      />

      {/* ==================== GUARD VIEWS ==================== */}
      <Drawer.Screen
        name="guard/dashboard"
        options={{
          headerTitle: "Visitor Check-in",
          drawerLabel: "Gate Check-in",
          drawerItemStyle: { display: currentRole === "guard" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="create-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="guard/check-passcode"
        options={{
          headerTitle: "Verify Passcode",
          drawerLabel: "Guest Verify",
          drawerItemStyle: { display: currentRole === "guard" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="shield-checkmark-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="guard/visitor-logs"
        options={{
          headerTitle: "Visitor Logs",
          drawerLabel: "Gate Checkout logs",
          drawerItemStyle: { display: currentRole === "guard" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="journal-outline" size={size} color={color} />,
        }}
      />

      {/* ==================== ADMIN VIEWS ==================== */}
      <Drawer.Screen
        name="admin/dashboard"
        options={{
          headerTitle: "Admin Console",
          drawerLabel: "Admin Dashboard",
          drawerItemStyle: { display: currentRole === "admin" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="cog-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/create-notice"
        options={{
          headerTitle: "Announce Notice",
          drawerLabel: "Publish Notices",
          drawerItemStyle: { display: currentRole === "admin" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="megaphone-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/create-poll"
        options={{
          headerTitle: "Launch Poll",
          drawerLabel: "Launch Community Polls",
          drawerItemStyle: { display: currentRole === "admin" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/manage-tickets"
        options={{
          headerTitle: "Support Complaints",
          drawerLabel: "Helpdesk Manager",
          drawerItemStyle: { display: currentRole === "admin" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="construct-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/manage-residents"
        options={{
          headerTitle: "Manage Residents",
          drawerLabel: "Resident Flat Assignment",
          drawerItemStyle: { display: currentRole === "admin" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/manage-amenities"
        options={{
          headerTitle: "Manage Amenities",
          drawerLabel: "Amenities Manager",
          drawerItemStyle: { display: currentRole === "admin" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="basketball-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/manage-structure"
        options={{
          headerTitle: "Manage Structure",
          drawerLabel: "Modify Towers & Flats",
          drawerItemStyle: { display: currentRole === "admin" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/manage-staff"
        options={{
          headerTitle: "Manage Staff",
          drawerLabel: "Staff Directory Manager",
          drawerItemStyle: { display: currentRole === "admin" ? "flex" : "none" },
          drawerIcon: ({ size, color }) => <Ionicons name="id-card-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          headerTitle: "Settings",
          drawerLabel: "Account Settings",
          drawerIcon: ({ size, color }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Drawer>
  );
}
