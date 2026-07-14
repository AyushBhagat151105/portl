import React from "react";
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator } from "react-native";
import { Card, Chip } from "heroui-native";
import { useActiveVisitorsQuery, useMarkExitMutation } from "../../queries/society";

export function VisitorLogsView() {
  const { data: logs, isLoading: logsLoading } = useActiveVisitorsQuery();
  const exitMutation = useMarkExitMutation();

  const handleCheckout = async (visitorId: string) => {
    try {
      await exitMutation.mutateAsync(visitorId);
      Alert.alert("Success", "Visitor marked as checked out.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to log checkout");
    }
  };

  if (logsLoading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-zinc-950 px-6 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <Text className="text-white text-xl font-bold mb-4">Active Visitors Inside</Text>

      {!logs || logs.length === 0 ? (
        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 items-center">
          <Text className="text-zinc-500 text-sm">No active visitors logged inside society.</Text>
        </View>
      ) : (
        logs.map((log: any) => (
          <Card key={log.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3">
            <View className="flex-row justify-between items-center mb-3">
              <View>
                <Text className="text-white text-base font-bold">{log.name}</Text>
                <Text className="text-zinc-400 text-xs mt-0.5">Phone: {log.phone}</Text>
                <Text className="text-zinc-400 text-xs">Target: Flat {log.flat.tower.name} - {log.flat.number}</Text>
              </View>
              <View className="items-end">
                <Chip
                  size="sm"
                  variant="soft"
                  color={log.status === "APPROVED" ? "success" : "warning"}
                  className="mb-2"
                >
                  <Chip.Label>{log.status}</Chip.Label>
                </Chip>
                <Text className="text-zinc-500 text-xxs">
                  In: {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            {log.status === "APPROVED" && (
              <Pressable
                disabled={exitMutation.isPending}
                onPress={() => handleCheckout(log.id)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 items-center active:opacity-80"
              >
                <Text className="text-rose-500 font-semibold text-xs">Mark Exit / Check-out</Text>
              </Pressable>
            )}
            {log.status === "PENDING" && (
              <View className="bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl items-center">
                <Text className="text-amber-500/80 text-xxs font-medium italic">
                  Awaiting resident approval to enter...
                </Text>
              </View>
            )}
          </Card>
        ))
      )}
    </ScrollView>
  );
}
