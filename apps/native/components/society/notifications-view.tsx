import React from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { Card } from "heroui-native";
import { useNotificationsQuery, useMarkNotificationReadMutation } from "../../queries/society";

export function NotificationsView() {
  const { data: notifications, isLoading } = useNotificationsQuery();
  const readMutation = useMarkNotificationReadMutation();

  if (isLoading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-zinc-950 px-6 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <Text className="text-white text-xl font-bold mb-4">In-App Notification Logs</Text>

      {!notifications || notifications.length === 0 ? (
        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 items-center">
          <Text className="text-zinc-500 text-sm">No notification alerts logged.</Text>
        </View>
      ) : (
        notifications.map((not: any) => (
          <Card
            key={not.id}
            className="border bg-zinc-900 p-4 rounded-2xl mb-3"
            style={{
              borderColor: not.read ? "#27272a" : "#f59e0b",
            }}
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-2">
                <Text className="text-white text-sm font-bold">{not.title}</Text>
                <Text className="text-zinc-400 text-xs mt-1">{not.body}</Text>
                <Text className="text-zinc-500 text-xxs mt-2.5">
                  {new Date(not.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })} @{" "}
                  {new Date(not.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>

              {!not.read && (
                <Pressable
                  disabled={readMutation.isPending}
                  onPress={() => readMutation.mutate(not.id)}
                  className="bg-amber-600/10 border border-amber-500/30 px-2 py-1 rounded-md active:opacity-75"
                >
                  <Text className="text-amber-500 text-xxs font-semibold">Mark Read</Text>
                </Pressable>
              )}
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}
