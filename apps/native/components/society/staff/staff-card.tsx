import React from "react";
import { View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../../ui/card";

export type StaffMember = {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  code?: string;
  aadharNumber?: string;
  aadharPublicId?: string;
  vehicleNumber?: string;
  avatar?: string;
};

interface StaffCardProps {
  member: StaffMember;
  isSelected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSecureView: () => void;
  isViewingAadhar: boolean;
  primaryColor: string;
}

const roleColors: Record<string, string> = {
  MAID: "#f59e0b",
  DRIVER: "#38bdf8",
  PLUMBER: "#a78bfa",
  COOK: "#fb923c",
  ELECTRICIAN: "#facc15",
  GARDENER: "#34d399",
  SECURITY: "#f43f5e",
  OTHER: "#6b7280",
};

export function StaffCard({
  member,
  isSelected,
  onToggle,
  onEdit,
  onDelete,
  onSecureView,
  isViewingAadhar,
  primaryColor,
}: StaffCardProps) {
  const color = roleColors[member.role.toUpperCase()] || "#6b7280";

  return (
    <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl overflow-hidden">
      <Pressable
        onPress={onToggle}
        className="p-4 flex-row items-center gap-3"
        accessibilityRole="button"
        accessibilityLabel={`Expand details for staff ${member.name}, role ${member.role}`}
      >
        <View className="w-11 h-11 rounded-xl items-center justify-center border overflow-hidden" style={{ borderColor: `${color}40` }}>
          {member.avatar ? (
            <Image source={{ uri: member.avatar }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full items-center justify-center" style={{ backgroundColor: `${color}18` }}>
              <Text className="font-bold text-base" style={{ color }}>
                {member.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-foreground-light dark:text-foreground-dark font-semibold text-sm">
            {member.name}
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">
            {member.phone}
          </Text>
          <View className="flex-row items-center gap-2 mt-1.5">
            <View
              className="px-2 py-0.5 rounded-md"
              style={{ backgroundColor: `${color}18` }}
            >
              <Text className="text-xs font-semibold text-[10px] uppercase tracking-wider" style={{ color }}>
                {member.role}
              </Text>
            </View>
            {member.code && (
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-mono">
                #{member.code}
              </Text>
            )}
          </View>
        </View>
        <Ionicons
          name={isSelected ? "chevron-up" : "chevron-down"}
          size={16}
          color="#78716c"
        />
      </Pressable>

      {/* Expanded Card Details */}
      {isSelected && (
        <View className="border-t border-border-light dark:border-border-dark p-4 gap-3 bg-muted-light/20 dark:bg-muted-dark/20">
          <View className="flex-row justify-between text-xs border-b border-border-light/40 dark:border-border-dark/40 pb-2">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider font-semibold text-[10px]">Aadhar number</Text>
            <Text className="text-foreground-light dark:text-foreground-dark font-mono">{member.aadharNumber ? `XXXX-XXXX-${member.aadharNumber.slice(-4)}` : "Not provided"}</Text>
          </View>
          <View className="flex-row justify-between text-xs border-b border-border-light/40 dark:border-border-dark/40 pb-2">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider font-semibold text-[10px]">Vehicle plate</Text>
            <Text className="text-foreground-light dark:text-foreground-dark font-mono">{member.vehicleNumber || "None"}</Text>
          </View>
          
          {member.aadharPublicId && (
            <View className="flex-row justify-between items-center bg-card-light dark:bg-card-dark border border-emerald-500/20 p-2.5 rounded-xl mt-1">
              <View className="flex-row items-center gap-2">
                <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                <Text className="text-emerald-500 font-bold text-[10px]">Aadhar Document Uploaded</Text>
              </View>
              {isViewingAadhar ? (
                <ActivityIndicator color={primaryColor} size="small" />
              ) : (
                <Pressable
                  onPress={onSecureView}
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark px-2.5 py-1 rounded-lg active:opacity-75"
                  accessibilityRole="button"
                  accessibilityLabel="Secure view Aadhar document"
                >
                  <Text className="text-foreground-light dark:text-foreground-dark text-[10px] font-bold">Secure View</Text>
                </Pressable>
              )}
            </View>
          )}

          <View className="flex-row justify-end gap-2 mt-1">
            <Pressable
              onPress={onEdit}
              className="bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20 px-3.5 py-2 rounded-xl flex-row items-center gap-1 active:opacity-75"
              accessibilityRole="button"
              accessibilityLabel={`Edit details for ${member.name}`}
            >
              <Ionicons name="create-outline" size={14} color={primaryColor} />
              <Text className="text-primary-light dark:text-primary-dark text-xs font-bold">Edit Details</Text>
            </Pressable>
            <Pressable
              onPress={onDelete}
              className="bg-rose-500/10 border border-rose-500/25 px-3.5 py-2 rounded-xl flex-row items-center gap-1 active:opacity-75"
              accessibilityRole="button"
              accessibilityLabel={`Remove ${member.name}`}
            >
              <Ionicons name="trash-outline" size={14} color="#f43f5e" />
              <Text className="text-rose-500 text-xs font-bold">Remove</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
