import React from "react";
import { View, Text, Pressable, ActivityIndicator, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { useRespondVisitorMutation } from "@/queries/society";

export function GateCallsSection({
  pendingCalls,
  isLoading,
}: {
  pendingCalls: any[] | undefined;
  isLoading: boolean;
}) {
  const respondMutation = useRespondVisitorMutation();
  const colorScheme = useColorScheme();

  if (isLoading || !pendingCalls || pendingCalls.length === 0) return null;

  const warningBorderColor = colorScheme === "dark" ? "#f97316" : "#b45309";

  return (
    <View className="mb-6">
      <Text className="text-primary-light dark:text-primary-dark font-semibold mb-3 flex-row items-center">
        <Ionicons name="notifications-outline" size={16} /> Active Gate Entry Requests ({pendingCalls.length})
      </Text>
      {pendingCalls.map((call: any) => (
        <Card
          key={call.id}
          className="mb-3 shadow-md"
          style={{ borderColor: warningBorderColor, borderWidth: 1 }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-foreground-light dark:text-foreground-dark font-bold text-base">
                {call.visitorName}
              </Text>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">
                Purpose: {call.purpose || "General Visitor"}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => respondMutation.mutate({ visitorId: call.id, status: "APPROVED" })}
                disabled={respondMutation.isPending}
                className="bg-emerald-600 px-3 py-2 rounded-xl active:opacity-80"
              >
                {respondMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="checkmark-sharp" size={18} color="#fff" />
                )}
              </Pressable>
              <Pressable
                onPress={() => respondMutation.mutate({ visitorId: call.id, status: "REJECTED" })}
                disabled={respondMutation.isPending}
                className="bg-rose-600 px-3 py-2 rounded-xl active:opacity-80"
              >
                {respondMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="close-sharp" size={18} color="#fff" />
                )}
              </Pressable>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}
