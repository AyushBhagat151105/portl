import React, { useState } from "react";
import { Text, View, Pressable, ScrollView, ActivityIndicator, useColorScheme, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { 
  useMembersQuery, 
  useActiveVisitorsQuery, 
  useVisitorHistoryQuery, 
  useComplaintsQuery,
  useAdminDuesQuery
} from "../../queries/society";
import { useCreateNoticeMutation, useBudgetsQuery, useExpensesQuery } from "../../queries/admin";
import { useToastStore } from "../../store/useToastStore";
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

  // Treasury Queries
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgetsQuery();
  const { data: expenses = [], isLoading: expensesLoading } = useExpensesQuery();
  
  const createNoticeMutation = useCreateNoticeMutation();
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [visitorTab, setVisitorTab] = useState<"active" | "history">("active");
  const [visitorSearch, setVisitorSearch] = useState("");
  const [quickNoticeText, setQuickNoticeText] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const residentsCount = members.filter((m: any) => m.role.toLowerCase() === "resident").length;
  const openComplaintsCount = complaints.filter((c: any) => c.status !== "RESOLVED").length;
  const activeVisitorsCount = activeVisitors.length;
  const pendingDuesCount = dues.filter((d: any) => d.status === "PENDING").length;
  const pendingDuesSum = dues.filter((d: any) => d.status === "PENDING").reduce((sum: number, due: any) => sum + due.amount, 0);

  // Compute Treasury Totals
  const totalBudgeted = budgets.reduce((acc: number, b: any) => acc + b.allocatedAmount, 0);
  const totalSpent = expenses.reduce((acc: number, e: any) => acc + e.amount, 0);
  const remainingFunds = totalBudgeted - totalSpent;

  const currentVisitors = visitorTab === "active" ? activeVisitors : historyVisitors;
  const visitorsLoading = visitorTab === "active" ? activeLoading : historyLoading;

  const activeTabColor = isDark ? "#f97316" : "#b45309";
  const inactiveTabColor = isDark ? "#a8a29e" : "#78716c";

  // Filter visitors logs based on query input
  const filteredVisitors = currentVisitors.filter((v: any) =>
    v.name.toLowerCase().includes(visitorSearch.toLowerCase()) ||
    v.phone.includes(visitorSearch) ||
    `${v.flat?.tower?.name}-${v.flat?.number}`.toLowerCase().includes(visitorSearch.toLowerCase())
  );

  const handleQuickBroadcast = async () => {
    if (!quickNoticeText.trim()) return;
    setIsBroadcasting(true);
    try {
      await createNoticeMutation.mutateAsync({
        title: "⚡ Quick Broadcast Alert",
        content: quickNoticeText.trim(),
        banner: null,
        bannerPublicId: null,
        endDate: null,
      });
      showToast("Alert broadcasted successfully!", "success");
      setQuickNoticeText("");
    } catch (err: any) {
      showToast(err.message || "Failed to broadcast alert", "error");
    } finally {
      setIsBroadcasting(false);
    }
  };

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
      <View className="mb-6 flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-foreground-light dark:text-foreground-dark text-2xl font-bold">
            Admin Console
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
            Monitor society structures, resident registries, helpdesk tickets, and gate logs.
          </Text>
        </View>
        <View className="bg-primary-light/10 dark:bg-primary-dark/10 px-2.5 py-1 rounded-lg border border-primary-light/20 dark:border-primary-dark/20 flex-row items-center gap-1.5">
          <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <Text className="text-primary-light dark:text-primary-dark text-[10px] font-bold uppercase tracking-wider">System Live</Text>
        </View>
      </View>

      {/* 2. Stats summary section (2x2 grid) */}
      <View className="gap-3 mb-6">
        <View className="flex-row gap-3">
          {/* Residents Stat */}
          <Card className="flex-1 py-4 items-center border border-border-light dark:border-border-dark bg-muted-light/10 dark:bg-muted-dark/5">
            <View className="bg-blue-500/10 p-2 rounded-full mb-1">
              <Ionicons name="people-outline" size={20} color="#3b82f6" />
            </View>
            <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-xl font-mono">
              {membersLoading ? "—" : residentsCount}
            </Text>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5 uppercase tracking-wider font-semibold">
              Residents
            </Text>
          </Card>

          {/* Tickets Stat */}
          <Card className="flex-1 py-4 items-center border border-border-light dark:border-border-dark bg-muted-light/10 dark:bg-muted-dark/5">
            <View className="bg-purple-500/10 p-2 rounded-full mb-1">
              <Ionicons name="construct-outline" size={20} color="#a78bfa" />
            </View>
            <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-xl font-mono">
              {complaintsLoading ? "—" : openComplaintsCount}
            </Text>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5 uppercase tracking-wider font-semibold">
              Open Tickets
            </Text>
          </Card>
        </View>

        <View className="flex-row gap-3">
          {/* Visitors Stat */}
          <Card className="flex-1 py-4 items-center border border-border-light dark:border-border-dark bg-muted-light/10 dark:bg-muted-dark/5">
            <View className="bg-amber-500/10 p-2 rounded-full mb-1">
              <Ionicons name="walk-outline" size={20} color="#f59e0b" />
            </View>
            <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-xl font-mono">
              {activeLoading ? "—" : activeVisitorsCount}
            </Text>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5 uppercase tracking-wider font-semibold">
              Active Inside
            </Text>
          </Card>

          {/* Dues Stat */}
          <Card className="flex-1 py-4 items-center border border-border-light dark:border-border-dark bg-muted-light/10 dark:bg-muted-dark/5">
            <View className="bg-emerald-500/10 p-2 rounded-full mb-1">
              <Ionicons name="wallet-outline" size={20} color="#10b981" />
            </View>
            <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-base font-mono">
              {duesLoading ? "—" : `₹${pendingDuesSum.toLocaleString()}`}
            </Text>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5 text-center px-1 uppercase tracking-wider font-semibold" numberOfLines={1}>
              Unpaid Dues
            </Text>
          </Card>
        </View>
      </View>

      {/* 2b. Treasury Overview Panel */}
      <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold mb-3 uppercase tracking-wider">
        Treasury Statement
      </Text>
      <Card className="mb-6 p-4 border border-border-light dark:border-border-dark bg-muted-light/5 dark:bg-muted-dark/5 gap-3.5">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[9px] font-bold uppercase tracking-wider">Available Cash Balance</Text>
            <Text className="text-foreground-light dark:text-foreground-dark text-2xl font-black font-mono mt-0.5">
              ₹{budgetsLoading || expensesLoading ? "—" : remainingFunds.toLocaleString()}
            </Text>
          </View>
          <View className="bg-emerald-500/10 p-2.5 rounded-full border border-emerald-500/20">
            <Ionicons name="stats-chart" size={18} color="#10b981" />
          </View>
        </View>
        
        <View className="flex-row justify-between items-center pt-3 border-t border-border-light/40 dark:border-border-dark/40">
          <View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[9px] font-bold uppercase tracking-wider">Total Budgeted</Text>
            <Text className="text-foreground-light dark:text-foreground-dark text-xs font-extrabold font-mono mt-0.5">
              ₹{budgetsLoading ? "—" : totalBudgeted.toLocaleString()}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[9px] font-bold uppercase tracking-wider">Total Expenditures</Text>
            <Text className="text-rose-500 text-xs font-extrabold font-mono mt-0.5">
              ₹{expensesLoading ? "—" : totalSpent.toLocaleString()}
            </Text>
          </View>
        </View>
      </Card>

      {/* 3. Quick Announcement Widget */}
      <Card className="mb-6 border border-amber-500/20 bg-amber-500/5 gap-2.5">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="flash" size={14} color="#f59e0b" />
          <Text className="text-foreground-light dark:text-foreground-dark font-bold text-xxs uppercase tracking-wider">
            Quick Broadcast Alert
          </Text>
        </View>
        <View className="flex-row gap-2.5">
          <TextInput
            value={quickNoticeText}
            onChangeText={setQuickNoticeText}
            placeholder="Type quick announcements to all residents..."
            placeholderTextColor="#78716c"
            className="flex-1 bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs font-semibold"
          />
          <Pressable
            disabled={isBroadcasting || !quickNoticeText.trim()}
            onPress={handleQuickBroadcast}
            className="bg-primary-light dark:bg-primary-dark rounded-xl px-4 justify-center active:opacity-90 disabled:opacity-50"
          >
            {isBroadcasting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={14} color="white" />
            )}
          </Pressable>
        </View>
      </Card>

      {/* 4. Quick Actions Grid Section */}
      <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold mb-3.5 uppercase tracking-wider">
        Quick Management Actions
      </Text>
      <View className="flex-row flex-wrap gap-3 mb-6">
        {actions.map((act) => (
          <Pressable
            key={act.title}
            onPress={() => router.push(act.route as any)}
            className="w-[47.8%] active:opacity-90"
          >
            <Card className="gap-3 p-3.5 border border-border-light dark:border-border-dark flex-col items-start min-h-[114px] bg-muted-light/5 dark:bg-muted-dark/5">
              <View
                className="w-9 h-9 rounded-xl items-center justify-center border"
                style={{
                  backgroundColor: `${act.color}15`,
                  borderColor: `${act.color}35`,
                }}
              >
                <Ionicons name={act.icon as any} size={18} color={act.color} />
              </View>
              <View>
                <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-xs">
                  {act.title}
                </Text>
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[9px] mt-0.5 leading-snug" numberOfLines={2}>
                  {act.desc}
                </Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>

      {/* 5. Live Gate Visitor Logs Monitoring */}
      <View className="flex-row justify-between items-center mb-3.5 mt-2">
        <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold uppercase tracking-wider">
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
              className="text-xxs font-bold uppercase tracking-wider"
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
              className="text-xxs font-bold uppercase tracking-wider"
              style={{ color: visitorTab === "history" ? "#ffffff" : inactiveTabColor }}
            >
              History
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Real-time visitor search bar */}
      <View className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark flex-row items-center px-3.5 py-2.5 rounded-xl mb-4">
        <Ionicons name="search-outline" size={16} color="#78716c" style={{ marginRight: 8 }} />
        <TextInput
          value={visitorSearch}
          onChangeText={setVisitorSearch}
          placeholder="Search logs by visitor, flat, or phone..."
          placeholderTextColor="#78716c"
          className="flex-1 text-foreground-light dark:text-foreground-dark text-xs font-semibold"
        />
        {visitorSearch ? (
          <Pressable onPress={() => setVisitorSearch("")}>
            <Ionicons name="close-circle" size={16} color="#78716c" />
          </Pressable>
        ) : null}
      </View>

      {visitorsLoading ? (
        <Loader fullscreen={false} />
      ) : filteredVisitors.length === 0 ? (
        <Card className="py-12 items-center border border-border-light dark:border-border-dark">
          <Ionicons name="journal-outline" size={32} color="#78716c" />
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-2.5 italic text-center font-medium">
            {visitorSearch ? "No matching visitor logs found" : visitorTab === "active" ? "No active guests currently inside" : "No guest log history yet"}
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          {filteredVisitors.map((visitor: any) => {
            const statusStyle = STATUS_COLORS[visitor.status] ?? STATUS_COLORS.PENDING;
            return (
              <Card key={visitor.id} className="border border-border-light dark:border-border-dark p-4 bg-muted-light/5 dark:bg-muted-dark/5">
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
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs uppercase font-mono font-bold">
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
                      <Text className="text-[10px] font-black uppercase tracking-wider" style={{ color: statusStyle.text }}>
                        {visitor.status}
                      </Text>
                    </View>
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold mt-1">
                      In: {new Date(visitor.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                    {visitor.exitedAt && (
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold">
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
