import React from "react";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import { Card } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useStaffQuery } from "../../queries/society";

export function DirectoryView() {
  const { data: staff, isLoading } = useStaffQuery();

  if (isLoading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-zinc-950 px-6 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
      <Text className="text-white text-xl font-bold mb-4">Society Staff Directory</Text>

      {!staff || staff.length === 0 ? (
        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 items-center">
          <Text className="text-zinc-500 text-sm">No society staff registered.</Text>
        </View>
      ) : (
        staff.map((st: any) => (
          <Card key={st.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white text-base font-bold">{st.name}</Text>
                <Text className="text-zinc-400 text-xs mt-1">Role: {st.role}</Text>
                <Text className="text-zinc-400 text-xs">Phone: {st.phone}</Text>
              </View>
              <View className="bg-zinc-950 p-2.5 rounded-full items-center justify-center border border-zinc-800">
                <Ionicons name="call-outline" size={20} color="#f59e0b" />
              </View>
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}
