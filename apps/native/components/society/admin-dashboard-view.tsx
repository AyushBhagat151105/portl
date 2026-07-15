import React, { useState } from "react";
import { Text, View, Pressable, ScrollView, ActivityIndicator, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { 
  useMembersQuery, 
  useActiveVisitorsQuery, 
  useVisitorHistoryQuery, 
  useComplaintsQuery,
  useAdminDuesQuery
} from "../../queries/society";
import { ScreenContainer } from "../ui/screen-container";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Loader } from "../ui/loader";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  APPROVED: { bg: "rgba(16,185,129,0.1)", text: "#10b981", border: "rgba(16,185,129,0.2)" },
  PENDING:  { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  EXITED:   { bg: "rgba(120,113,108,0.1)", text: "#78716c", border: "rgba(120,113,108,0.2)" },
  REJECTED: { bg: "rgba(239,68,68,0.1)",  text: "#ef4444", border: "rgba(239,68,68,0.2)" },
};

export function AdminDashboardView() {
  const { data: members = [], isLoading: membersLoading } = useMembersQuery();
  const { data: complaints = [], isLoading: complaintsLoading } = useComplaintsQuery();
  const { data: activeVisitors = [], isLoading: activeLoading } = useActiveVisitorsQuery();
  const { data: historyVisitorsData, isLoading: historyLoading } = useVisitorHistoryQuery();
  const historyVisitors = historyVisitorsData?.data ?? [];
  const { data: duesData, isLoading: duesLoading } = useAdminDuesQuery();
  const dues = duesData?.data ?? [];
  const colorScheme = useColorScheme();

  const [visitorTab, setVisitorTab] = useState<"active" | "history">("active");

  const residentsCount = members.filter((m: any) => m.role.toLowerCase() === "resident").length;
  const openComplaintsCount = complaints.filter((c: any) => c.status !== "RESOLVED").length;
  const activeVisitorsCount = activeVisitors.length;
  const pendingDuesCount = dues.filter((d: any) => d.status === "PENDING").length;
  const pendingDuesSum = dues.filter((d: any) => d.status === "PENDING").reduce((sum: number, due: any) => sum + due.amount, 0);

  const currentVisitors = visitorTab === "active" ? activeVisitors : historyVisitors;
  const visitorsLoading = visitorTab === "active" ? activeLoading : historyLoading;

  const activeTabColor = colorScheme === "dark" ? "#f97316" : "#b45309";
  const inactiveTabColor = colorScheme === "dark" ? "#a8a29e" : "#78716c";

  // Dashboard quick actions config
  const actions = [
    {
      title: "Modify Structure",
      desc: "Towers & flats structure config",
      icon: "grid-outline",
      color: "#b45309",
      route: "/admin/manage-structure",
    },
    {
      title: "Assign Residents",
      desc: "Assign residents to flats",
      icon: "home-outline",
      color: "#3b82f6",
      route: "/admin/manage-residents",
    },
    {
      title: "Manage Staff",
      desc: "Staff directory & guards",
      icon: "id-card-outline",
      color: "#10b981",
      route: "/admin/manage-staff",
    },
    {
      title: "Helpdesk Manager",
      desc: "Resolve support tickets",
      icon: "construct-outline",
      color: "#a78bfa",
      route: "/admin/manage-tickets",
    },
    {
      title: "Publish Notices",
      desc: "Announcements broadcasts",
      icon: "megaphone-outline",
      color: "#f59e0b",
      route: "/admin/create-notice",
    },
    {
      title: "Launch Polls",
      desc: "Community decision polls",
      icon: "bar-chart-outline",
      color: "#ec4899",
      route: "/admin/create-poll",
    },
    {
      title: "Amenities Builder",
      desc: "Society amenities settings",
      icon: "basketball-outline",
      color: "#14b8a6",
      route: "/admin/manage-amenities",
    },
    {
      title: "Dues & Billing",
      desc: "Generate bills & view dues",
      icon: "calculator-outline",
      color: "#0ea5e9",
      route: "/admin/manage-dues",
    },
  ];

  return (
    <ScreenContainer contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      {/* 1. Header block */}
      <View className="mb-6">
        <Text className="text-foreground-light dark:text-foreground-dark text-2xl font-bold">
          Admin Console
        </Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
          Monitor society structure, residents registry, helpdesk tickets, and gate logs.
        </Text>
      </View>

      {/* 2. Stats summary section (2x2 grid) */}
      <View className="gap-3 mb-6">
        <View className="flex-row gap-3">
          {/* Residents Stat */}
          <Card className="flex-1 py-4 items-center">
            <View className="bg-blue-500/10 p-2 rounded-full mb-1">
              <Ionicons name="people-outline" size={20} color="#3b82f6" />
            </View>
            <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-xl">
              {membersLoading ? "—" : residentsCount}
            </Text>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
              Residents
            </Text>
          </Card>

          {/* Tickets Stat */}
          <Card className="flex-1 py-4 items-center">
            <View className="bg-purple-500/10 p-2 rounded-full mb-1">
              <Ionicons name="construct-outline" size={20} color="#a78bfa" />
            </View>
            <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-xl">
              {complaintsLoading ? "—" : openComplaintsCount}
            </Text>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
              Open Tickets
            </Text>
          </Card>
        </View>

        <View className="flex-row gap-3">
          {/* Visitors Stat */}
          <Card className="flex-1 py-4 items-center">
            <View className="bg-amber-500/10 p-2 rounded-full mb-1">
              <Ionicons name="walk-outline" size={20} color="#f59e0b" />
            </View>
            <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-xl">
              {activeLoading ? "—" : activeVisitorsCount}
            </Text>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
              Active Inside
            </Text>
          </Card>

          {/* Dues Stat */}
          <Card className="flex-1 py-4 items-center">
            <View className="bg-emerald-500/10 p-2 rounded-full mb-1">
              <Ionicons name="wallet-outline" size={20} color="#10b981" />
            </View>
            <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-xl">
              {duesLoading ? "—" : `₹${pendingDuesSum.toLocaleString()}`}
            </Text>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5 text-center px-1">
              Unpaid Dues ({pendingDuesCount} bills)
            </Text>
          </Card>
        </View>
      </View>

      {/* 3. Quick Actions Section */}
      <Text className="text-foreground-light dark:text-foreground-dark text-sm font-semibold mb-3 uppercase tracking-wider">
        Quick Management Actions
      </Text>
      <View className="gap-3 mb-6">
        {actions.map((act) => (
          <Pressable
            key={act.title}
            onPress={() => router.push(act.route as any)}
            className="active:opacity-90"
          >
            <Card className="flex-row items-center gap-4 py-3.5 border border-border-light dark:border-border-dark">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center border"
                style={{
                  backgroundColor: `${act.color}15`,
                  borderColor: `${act.color}35`,
                }}
              >
                <Ionicons name={act.icon as any} size={20} color={act.color} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">
                  {act.title}
                </Text>
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">
                  {act.desc}
                </Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={16} color="#78716c" />
            </Card>
          </Pressable>
        ))}
      </View>

      {/* 4. Live Gate Visitor Logs Monitoring */}
      <View className="flex-row justify-between items-center mb-3 mt-2">
        <Text className="text-foreground-light dark:text-foreground-dark text-sm font-semibold uppercase tracking-wider">
          Gate Visitors Monitor Logs
        </Text>
        
        {/* Toggle Switcher */}
        <View className="flex-row bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark p-0.5 rounded-lg gap-0.5">
          <Pressable
            onPress={() => setVisitorTab("active")}
            className="px-2.5 py-1.5 rounded-md"
            style={{
              backgroundColor: visitorTab === "active" ? activeTabColor : "transparent",
            }}
          >
            <Text
              className="text-xxs font-bold"
              style={{ color: visitorTab === "active" ? "#ffffff" : inactiveTabColor }}
            >
              Active
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setVisitorTab("history")}
            className="px-2.5 py-1.5 rounded-md"
            style={{
              backgroundColor: visitorTab === "history" ? activeTabColor : "transparent",
            }}
          >
            <Text
              className="text-xxs font-bold"
              style={{ color: visitorTab === "history" ? "#ffffff" : inactiveTabColor }}
            >
              History
            </Text>
          </Pressable>
        </View>
      </View>

      {visitorsLoading ? (
        <Loader fullscreen={false} />
      ) : currentVisitors.length === 0 ? (
        <Card className="py-8 items-center border border-border-light dark:border-border-dark">
          <Ionicons name="journal-outline" size={32} color="#78716c" />
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-2 italic text-center">
            {visitorTab === "active" ? "No active guests currently inside" : "No guest log history yet"}
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          {currentVisitors.map((visitor: any) => {
            const statusStyle = STATUS_COLORS[visitor.status] ?? STATUS_COLORS.PENDING;
            return (
              <Card key={visitor.id} className="border border-border-light dark:border-border-dark p-4">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-2">
                    <Text className="text-foreground-light dark:text-foreground-dark text-sm font-bold">
                      {visitor.name}
                    </Text>
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                      Phone: {visitor.phone}
                    </Text>
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
                      Target flat: {visitor.flat.tower.name} - {visitor.flat.number}
                    </Text>
                    <View className="self-start mt-2 px-2 py-0.5 rounded bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark">
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs uppercase font-mono">
                        {visitor.type}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end gap-1">
                    <View
                      className="px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: statusStyle.bg,
                        borderColor: statusStyle.border,
                      }}
                    >
                      <Text className="text-xxs font-bold" style={{ color: statusStyle.text }}>
                        {visitor.status}
                      </Text>
                    </View>
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-medium mt-1">
                      In: {new Date(visitor.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                    {visitor.exitedAt && (
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-medium">
                        Out: {new Date(visitor.exitedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
}
export default AdminDashboardView;
