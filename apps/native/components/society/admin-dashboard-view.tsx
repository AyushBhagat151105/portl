import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Card } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";

export function AdminDashboardView() {
  return (
    <ScrollView className="flex-1 bg-zinc-950 px-6 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="mb-6">
        <Text className="text-white text-2xl font-bold">Admin Panel</Text>
        <Text className="text-zinc-500 text-xs mt-1">Manage society flats, notices, polls, and helpdesk tickets.</Text>
      </View>

      <View className="gap-4">
        <Card className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <View className="flex-row items-center gap-3.5 mb-2">
            <Ionicons name="business-outline" size={24} color="#f59e0b" />
            <Text className="text-white text-base font-bold">Society Structure</Text>
          </View>
          <Text className="text-zinc-400 text-xs leading-relaxed">
            Society flats and towers can be initialized and configured from this dashboard database. Live residents registrations are linked natively.
          </Text>
        </Card>

        <Card className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <View className="flex-row items-center gap-3.5 mb-2">
            <Ionicons name="shield-outline" size={24} color="#10b981" />
            <Text className="text-white text-base font-bold">Security Guards</Text>
          </View>
          <Text className="text-zinc-400 text-xs leading-relaxed">
            Monitor gate visitor entries and checkouts. Set roles on the organization memberships to grant gate access controls.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}
