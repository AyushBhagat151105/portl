import { Ionicons } from "@expo/vector-icons";
import { Drawer, DrawerContentScrollView, DrawerItemList } from "expo-router/drawer";
import { useThemeColor } from "heroui-native";
import React from "react";
import { View, Text, Pressable } from "react-native";
import { authClient } from "@/lib/auth-client";
import { useSocietyStore } from "@/store/useSocietyStore";
import { ThemeToggle } from "@/components/theme-toggle";

function CustomDrawerContent(props: any) {
  const { currentRole, setRole } = useSocietyStore();
  const { data: session } = authClient.useSession();
  
  const themeColorForeground = useThemeColor("foreground");
  const themeColorMuted = useThemeColor("muted");

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: "#09090b" }}>
      {/* 1. Header Profile block */}
      <View className="px-5 py-6 border-b border-zinc-900 mb-4 bg-zinc-900/30">
        <Text className="text-white text-lg font-bold">{session?.user?.name || "Portl User"}</Text>
        <Text className="text-zinc-500 text-xs mt-1">{session?.user?.email || "user@portl.com"}</Text>
        
        {/* Development mode switcher inside drawer */}
        <View className="mt-4 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
          <Text className="text-zinc-500 text-xxs uppercase tracking-wider font-semibold mb-2">Role Perspective</Text>
          <View className="flex-row gap-1.5">
            {(["resident", "guard", "admin"] as const).map((r) => {
              const active = currentRole === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => {
                    setRole(r);
                    props.navigation.closeDrawer();
                  }}
                  className="flex-1 py-1.5 rounded-md items-center justify-center border"
                  style={{
                    backgroundColor: active ? "rgba(245, 158, 11, 0.1)" : "#09090b",
                    borderColor: active ? "#f59e0b" : "#27272a",
                  }}
                >
                  <Text
                    className="text-xxs capitalize"
                    style={{
                      color: active ? "#f59e0b" : "#a1a1aa",
                      fontWeight: active ? "600" : "400",
                    }}
                  >
                    {r}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* 2. Menu Navigation Links List */}
      <View className="flex-1 px-2">
        <DrawerItemList {...props} />
      </View>

      {/* 3. Footer Logout block */}
      <View className="p-5 border-t border-zinc-900 bg-zinc-900/20 flex-row justify-between items-center">
        <ThemeToggle />
        <Pressable
          onPress={() => authClient.signOut()}
          className="bg-zinc-950 border border-zinc-800 py-2 px-4 rounded-xl active:opacity-75"
        >
          <Text className="text-rose-500 text-xs font-semibold">Sign Out</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { currentRole } = useSocietyStore();
  const themeColorForeground = useThemeColor("foreground");
  const themeColorBackground = useThemeColor("background");

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTintColor: themeColorForeground,
        headerStyle: { backgroundColor: "#09090b", borderBottomWidth: 1, borderBottomColor: "#18181b" },
        headerTitleStyle: {
          fontWeight: "700",
          color: "#ffffff",
        },
        drawerStyle: { backgroundColor: "#09090b" },
        drawerActiveTintColor: "#f59e0b",
        drawerInactiveTintColor: "#a1a1aa",
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
          drawerItemStyle: { display: currentRole === "resident" ? "flex" : "none" },
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
    </Drawer>
  );
}
