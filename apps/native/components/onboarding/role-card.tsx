import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RoleOption {
  key: "resident" | "guard";
  label: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}

interface RoleCardProps {
  role: RoleOption;
  active: boolean;
  onSelect: () => void;
}

export function RoleCard({ role, active, onSelect }: RoleCardProps) {
  return (
    <Pressable
      onPress={onSelect}
      className="flex-row items-center gap-4 p-4 rounded-xl border"
      style={{
        backgroundColor: active ? role.bg : "#18181b",
        borderColor: active ? role.border : "#27272a",
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Select role as ${role.label}: ${role.description}`}
    >
      <View
        className="w-10 h-10 rounded-lg items-center justify-center"
        style={{ backgroundColor: active ? role.bg : "#09090b" }}
      >
        <Ionicons name={role.icon as any} size={20} color={active ? role.color : "#52525b"} />
      </View>
      <View className="flex-1">
        <Text style={{ color: active ? role.color : "#a1a1aa", fontWeight: active ? "700" : "400" }} className="text-sm">
          {role.label}
        </Text>
        <Text className="text-zinc-600 text-xs mt-0.5">{role.description}</Text>
      </View>
      {active && (
        <Ionicons name="checkmark-circle" size={20} color={role.color} />
      )}
    </Pressable>
  );
}
export default RoleCard;
