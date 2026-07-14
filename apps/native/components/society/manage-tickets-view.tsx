import React from "react";
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator } from "react-native";
import { Card, Chip } from "heroui-native";
import { useComplaintsQuery, useUpdateComplaintMutation } from "../../queries/society";

export function ManageTicketsView() {
  const { data: tickets, isLoading: ticketsLoading } = useComplaintsQuery();
  const updateMutation = useUpdateComplaintMutation();

  const handleUpdateStatus = async (complaintId: string, status: "PENDING" | "IN_PROGRESS" | "RESOLVED") => {
    try {
      await updateMutation.mutateAsync({ complaintId, status });
      Alert.alert("Success", `Complaint ticket status updated to ${status.replace("_", " ").toLowerCase()}`);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update ticket status");
    }
  };

  if (ticketsLoading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-zinc-950 px-6 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <Text className="text-white text-xl font-bold mb-4">Society Support Tickets</Text>

      {!tickets || tickets.length === 0 ? (
        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 items-center">
          <Text className="text-zinc-500 text-sm">No complaints logged yet.</Text>
        </View>
      ) : (
        tickets.map((comp: any) => (
          <Card key={comp.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 pr-2">
                <Text className="text-white text-base font-bold">{comp.title}</Text>
                <Text className="text-zinc-400 text-xs mt-1">{comp.description}</Text>
              </View>
              <Chip
                size="sm"
                variant="soft"
                color={
                  comp.status === "RESOLVED"
                    ? "success"
                    : comp.status === "IN_PROGRESS"
                    ? "accent"
                    : "warning"
                }
              >
                <Chip.Label>{comp.status}</Chip.Label>
              </Chip>
            </View>

            <View className="bg-zinc-950 border border-zinc-800/80 p-2.5 rounded-xl flex-row justify-between items-center my-3.5">
              <View>
                <Text className="text-zinc-500 text-xxs uppercase tracking-wider font-semibold">Raised By</Text>
                <Text className="text-white text-xs mt-0.5">{comp.raisedBy?.name || "Resident"}</Text>
              </View>
              {comp.flat && (
                <View className="items-end">
                  <Text className="text-zinc-500 text-xxs uppercase tracking-wider font-semibold">Target Flat</Text>
                  <Text className="text-white text-xs mt-0.5">
                    {comp.flat.tower.name} - {comp.flat.number}
                  </Text>
                </View>
              )}
            </View>

            {/* Admin status updates */}
            <View className="flex-row gap-2 mt-1">
              <Pressable
                disabled={comp.status === "IN_PROGRESS" || updateMutation.isPending}
                onPress={() => handleUpdateStatus(comp.id, "IN_PROGRESS")}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 items-center active:bg-blue-600/10"
              >
                <Text className="text-blue-500 font-semibold text-xs">Set In Progress</Text>
              </Pressable>
              <Pressable
                disabled={comp.status === "RESOLVED" || updateMutation.isPending}
                onPress={() => handleUpdateStatus(comp.id, "RESOLVED")}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 items-center active:bg-emerald-600/10"
              >
                <Text className="text-emerald-500 font-semibold text-xs">Mark Resolved</Text>
              </Pressable>
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}
