import React, { useState, useCallback } from "react";
import { Text, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "../ui/screen-container";
import { StatsGrid } from "./admin/stats-grid";
import { TreasurySummary } from "./admin/treasury-summary";
import { QuickBroadcast } from "./admin/quick-broadcast";
import { QuickActions } from "./admin/quick-actions";
import { VisitorLogs } from "./admin/visitor-logs";

export function AdminDashboardView() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refetch data when screen gains focus
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries();
    }, [queryClient])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries();
    } catch (err) {
      console.error("Failed to invalidate queries on refresh:", err);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return (
    <ScreenContainer
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      {/* Header Block */}
      <View className="mb-6 flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-foreground-light dark:text-foreground-dark text-2xl font-bold">
            Admin Console
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
            Monitor society structures, resident registries, helpdesk tickets, and gate logs.
          </Text>
        </View>
      </View>

      {/* Stats Summary Grid (2x2) */}
      <StatsGrid />

      {/* Treasury Statement */}
      <TreasurySummary />

      {/* Quick notice broadcast widget */}
      <QuickBroadcast />

      {/* Quick Actions Grid (8 actions) */}
      <QuickActions />

      {/* Visitor logs monitor logs list */}
      <VisitorLogs />
    </ScreenContainer>
  );
}

export default AdminDashboardView;
