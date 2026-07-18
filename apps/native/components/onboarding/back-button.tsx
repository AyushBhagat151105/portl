import React from "react";
import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export function BackButton() {
  return (
    <Pressable
      onPress={() => router.back()}
      className="flex-row items-center gap-2 mb-8 mt-2"
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Ionicons name="arrow-back" size={20} color="#a1a1aa" />
      <Text className="text-zinc-400 text-sm">Back</Text>
    </Pressable>
  );
}
export default BackButton;
