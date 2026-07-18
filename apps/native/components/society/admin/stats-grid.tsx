import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMembersQuery, useActiveVisitorsQuery, useComplaintsQuery } from "../../../queries/society";
import { useAdminDuesQuery } from "../../../queries/society";
import { Card } from "../../ui/card";

export function StatsGrid() {
  const { data: members = [], isLoading: membersLoading } = useMembersQuery();
  const { data: complaints = [], isLoading: complaintsLoading } = useComplaintsQuery();
  const { data: activeVisitors = [], isLoading: activeLoading } = useActiveVisitorsQuery();
  const { data: duesData, isLoading: duesLoading } = useAdminDuesQuery();
  
  const dues = duesData?.data ?? [];

  const residentsCount = members.filter((m: any) => m.role.toLowerCase() === "resident").length;
  const openComplaintsCount = complaints.filter((c: any) => c.status !== "RESOLVED").length;
  const activeVisitorsCount = activeVisitors.length;
  const pendingDuesSum = dues.filter((d: any) => d.status === "PENDING").reduce((sum: number, due: any) => sum + due.amount, 0);

  return (
    <View className="gap-3 mb-6">
      <View className="flex-row gap-3">
        {/* Residents Stat */}
        <Card className="flex-1 py-4 items-center border border-border-light dark:border-border-dark bg-muted-light/10 dark:bg-muted-dark/5" accessibilityLabel={`Residents: ${residentsCount}`}>
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
        <Card className="flex-1 py-4 items-center border border-border-light dark:border-border-dark bg-muted-light/10 dark:bg-muted-dark/5" accessibilityLabel={`Open Tickets: ${openComplaintsCount}`}>
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
        <Card className="flex-1 py-4 items-center border border-border-light dark:border-border-dark bg-muted-light/10 dark:bg-muted-dark/5" accessibilityLabel={`Active Inside: ${activeVisitorsCount}`}>
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
        <Card className="flex-1 py-4 items-center border border-border-light dark:border-border-dark bg-muted-light/10 dark:bg-muted-dark/5" accessibilityLabel={`Unpaid Dues: ₹${pendingDuesSum.toLocaleString()}`}>
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
  );
}
