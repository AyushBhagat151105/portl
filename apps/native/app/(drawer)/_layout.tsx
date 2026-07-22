import { Ionicons } from "@expo/vector-icons";
import { Drawer, DrawerContentScrollView, DrawerItemList } from "expo-router/drawer";
import { useThemeColor } from "heroui-native";
import React from "react";
import { View, Text, Pressable, ActivityIndicator, Image } from "react-native";
import { authClient } from "@/lib/auth-client";
import { useSocietyStore } from "@/store/useSocietyStore";
import { ThemeToggle } from "@/components/theme-toggle";
import { router, Redirect } from "expo-router";
import { useAppTheme } from "@/contexts/app-theme-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CustomDrawerContent } from "@/components/society/navigation/custom-drawer-content";

export default function DrawerLayout() {
  const { currentRole } = useSocietyStore();
  const { isLight } = useAppTheme();
  const { data: session, isPending, refetch } = authClient.useSession();
  const [hasRefetched, setHasRefetched] = React.useState(false);

  React.useEffect(() => {
    if (!isPending && !session) {
      if (!hasRefetched) {
        const p = refetch();
        if (p && typeof p.then === "function") {
          p.catch(() => { }).finally(() => setHasRefetched(true));
        } else {
          setHasRefetched(true);
        }
      } else {
        router.replace("/(auth)/sign-in");
      }
    }
  }, [session, isPending, hasRefetched]);

  if (isPending || !session) {
    return (
      <View style={{ flex: 1, backgroundColor: isLight ? "#fcfbf9" : "#1c1917" }} className="items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  const [isVerifyingServerStatus, setIsVerifyingServerStatus] = React.useState(false);

  React.useEffect(() => {
    if (session?.user && !session.user.emailVerified && !isVerifyingServerStatus) {
      setIsVerifyingServerStatus(true);
      refetch?.()
        ?.catch(() => {})
        ?.finally(() => setIsVerifyingServerStatus(false));
    }
  }, [session?.user?.emailVerified]);

  // Email verification gate: Only redirect if session is not pending and email is confirmed false after refetch
  if (session?.user && !session.user.emailVerified && !isVerifyingServerStatus) {
    return <Redirect href="/(auth)/verify-email" />;
  }

  const bgColor = isLight ? "#fcfbf9" : "#1c1917";
  const fgColor = isLight ? "#4a3b33" : "#f5f5f4";
  const borderColor = isLight ? "#e8e5dc" : "#44403c";
  const inactiveTintColor = isLight ? "#78716c" : "#a8a29e";
  const activeTintColor = isLight ? "#b45309" : "#f97316";

  // Helper to construct display visibility and clean uniform item margins
  const getDrawerItemStyle = (roleCondition: boolean) => {
    return {
      display: roleCondition ? ("flex" as const) : ("none" as const),
      marginHorizontal: 8,
      marginVertical: 2,
      borderRadius: 8,
    };
  };

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
        drawerItemStyle: { marginHorizontal: 8, marginVertical: 2, borderRadius: 8 },
        swipeEnabled: false,
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
          drawerItemStyle: getDrawerItemStyle(currentRole === "resident"),
          drawerIcon: ({ size, color }) => <Ionicons name="megaphone-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="resident/profile"
        options={{
          headerTitle: "My Profile",
          drawerLabel: "Profile Settings",
          drawerItemStyle: getDrawerItemStyle(currentRole === "resident"),
          drawerIcon: ({ size, color }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="resident/parking-alerts"
        options={{
          headerTitle: "Parking Alerts",
          drawerLabel: "Parking Helper",
          drawerItemStyle: getDrawerItemStyle(currentRole === "resident"),
          drawerIcon: ({ size, color }) => <Ionicons name="car-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="resident/pre-approve"
        options={{
          headerTitle: "Pre-approve Guest",
          drawerLabel: "Guest Passes",
          drawerItemStyle: getDrawerItemStyle(currentRole === "resident"),
          drawerIcon: ({ size, color }) => <Ionicons name="qr-code-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="resident/book-amenity"
        options={{
          headerTitle: "Book Amenity",
          drawerLabel: "Amenities Scheduler",
          drawerItemStyle: getDrawerItemStyle(currentRole === "resident"),
          drawerIcon: ({ size, color }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="resident/helpdesk"
        options={{
          headerTitle: "Complaints Helpdesk",
          drawerLabel: "Helpdesk Tickets",
          drawerItemStyle: getDrawerItemStyle(currentRole === "resident"),
          drawerIcon: ({ size, color }) => <Ionicons name="chatbubbles-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="resident/directory"
        options={{
          headerTitle: "Staff Contacts",
          drawerLabel: "Staff Directory",
          drawerItemStyle: getDrawerItemStyle(currentRole === "resident"),
          drawerIcon: ({ size, color }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="resident/notifications"
        options={{
          headerTitle: "Alerts Logs",
          drawerLabel: "Notifications History",
          drawerItemStyle: getDrawerItemStyle(currentRole === "resident"),
          drawerIcon: ({ size, color }) => <Ionicons name="notifications-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="resident/dues"
        options={{
          headerTitle: "Maintenance Dues",
          drawerLabel: "Maintenance Payments",
          drawerItemStyle: getDrawerItemStyle(currentRole === "resident"),
          drawerIcon: ({ size, color }) => <Ionicons name="card-outline" size={size} color={color} />,
        }}
      />

      {/* ==================== GUARD VIEWS ==================== */}
      <Drawer.Screen
        name="guard/dashboard"
        options={{
          headerTitle: "Visitor Check-in",
          drawerLabel: "Gate Check-in",
          drawerItemStyle: getDrawerItemStyle(currentRole === "guard"),
          drawerIcon: ({ size, color }) => <Ionicons name="create-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="guard/check-passcode"
        options={{
          headerTitle: "Verify Passcode",
          drawerLabel: "Guest Verify",
          drawerItemStyle: getDrawerItemStyle(currentRole === "guard"),
          drawerIcon: ({ size, color }) => <Ionicons name="shield-checkmark-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="guard/visitor-logs"
        options={{
          headerTitle: "Visitor Logs",
          drawerLabel: "Gate Checkout logs",
          drawerItemStyle: getDrawerItemStyle(currentRole === "guard"),
          drawerIcon: ({ size, color }) => <Ionicons name="journal-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="guard/scan-qr"
        options={{
          headerTitle: "Scan Guest QR",
          drawerLabel: "Scan QR Code",
          drawerItemStyle: getDrawerItemStyle(currentRole === "guard"),
          drawerIcon: ({ size, color }) => <Ionicons name="scan-outline" size={size} color={color} />,
        }}
      />

      {/* ==================== ADMIN VIEWS ==================== */}

      <Drawer.Screen
        name="admin/dashboard"
        options={{
          headerTitle: "Admin Console",
          drawerLabel: "Admin Dashboard",
          drawerItemStyle: getDrawerItemStyle(currentRole === "admin"),
          drawerIcon: ({ size, color }) => <Ionicons name="cog-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/treasury"
        options={{
          headerTitle: "Budget & Treasury",
          drawerLabel: "Treasury Console",
          drawerItemStyle: getDrawerItemStyle(currentRole === "admin"),
          drawerIcon: ({ size, color }) => <Ionicons name="wallet-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/manage-bookings"
        options={{
          headerTitle: "Review Bookings",
          drawerLabel: "Event Booking Requests",
          drawerItemStyle: getDrawerItemStyle(currentRole === "admin"),
          drawerIcon: ({ size, color }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/create-notice"
        options={{
          headerTitle: "Announce Notice",
          drawerLabel: "Publish Notices",
          drawerItemStyle: getDrawerItemStyle(currentRole === "admin"),
          drawerIcon: ({ size, color }) => <Ionicons name="megaphone-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/create-poll"
        options={{
          headerTitle: "Launch Poll",
          drawerLabel: "Launch Community Polls",
          drawerItemStyle: getDrawerItemStyle(currentRole === "admin"),
          drawerIcon: ({ size, color }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/manage-tickets"
        options={{
          headerTitle: "Support Complaints",
          drawerLabel: "Helpdesk Manager",
          drawerItemStyle: getDrawerItemStyle(currentRole === "admin"),
          drawerIcon: ({ size, color }) => <Ionicons name="construct-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/manage-residents"
        options={{
          headerTitle: "Manage Residents",
          drawerLabel: "Resident Flat Assignment",
          drawerItemStyle: getDrawerItemStyle(currentRole === "admin"),
          drawerIcon: ({ size, color }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/manage-amenities"
        options={{
          headerTitle: "Manage Amenities",
          drawerLabel: "Amenities Manager",
          drawerItemStyle: getDrawerItemStyle(currentRole === "admin"),
          drawerIcon: ({ size, color }) => <Ionicons name="basketball-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/manage-structure"
        options={{
          headerTitle: "Manage Structure",
          drawerLabel: "Modify Towers & Flats",
          drawerItemStyle: getDrawerItemStyle(currentRole === "admin"),
          drawerIcon: ({ size, color }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/manage-staff"
        options={{
          headerTitle: "Manage Staff",
          drawerLabel: "Staff Directory Manager",
          drawerItemStyle: getDrawerItemStyle(currentRole === "admin"),
          drawerIcon: ({ size, color }) => <Ionicons name="id-card-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="admin/manage-dues"
        options={{
          headerTitle: "Dues & Billing",
          drawerLabel: "Generate Bills & Dues",
          drawerItemStyle: getDrawerItemStyle(currentRole === "admin"),
          drawerIcon: ({ size, color }) => <Ionicons name="calculator-outline" size={size} color={color} />,
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
