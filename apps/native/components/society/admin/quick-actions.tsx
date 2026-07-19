import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Card } from "../../ui/card";

export function QuickActions() {
  const actions = [
    {
      title: "Modify Structure",
      desc: "Towers & flats structure config",
      icon: "grid-outline",
      color: "#b45309",
      route: "/admin/manage-structure",
    },
    {
      title: "Assign Residents",
      desc: "Assign residents to flats",
      icon: "home-outline",
      color: "#3b82f6",
      route: "/admin/manage-residents",
    },
    {
      title: "Manage Staff",
      desc: "Staff directory & guards",
      icon: "id-card-outline",
      color: "#10b981",
      route: "/admin/manage-staff",
    },
    {
      title: "Helpdesk Manager",
      desc: "Resolve support tickets",
      icon: "construct-outline",
      color: "#a78bfa",
      route: "/admin/manage-tickets",
    },
    {
      title: "Publish Notices",
      desc: "Announcements broadcasts",
      icon: "megaphone-outline",
      color: "#f59e0b",
      route: "/admin/create-notice",
    },
    {
      title: "Launch Polls",
      desc: "Community decision polls",
      icon: "bar-chart-outline",
      color: "#ec4899",
      route: "/admin/create-poll",
    },
    {
      title: "Amenities Builder",
      desc: "Society amenities settings",
      icon: "basketball-outline",
      color: "#14b8a6",
      route: "/admin/manage-amenities",
    },
    {
      title: "Dues & Billing",
      desc: "Generate bills & view dues",
      icon: "calculator-outline",
      color: "#0ea5e9",
      route: "/admin/manage-dues",
    },
  ];

  return (
    <View className="mb-6">
      <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold mb-4 uppercase tracking-wider">
        Quick Management Actions
      </Text>
      <View className="flex-row flex-wrap gap-4 justify-between">
        {actions.map((act) => (
          <Pressable
            key={act.title}
            onPress={() => router.push(act.route as any)}
            className="w-[47.5%] active:opacity-90"
            accessibilityRole="button"
            accessibilityLabel={`${act.title}: ${act.desc}`}
          >
            <Card className="gap-3 flex-col items-start min-h-[120px] shadow-sm">
              <View
                className="w-9 h-9 rounded-xl items-center justify-center border"
                style={{
                  backgroundColor: `${act.color}10`,
                  borderColor: `${act.color}25`,
                }}
              >
                <Ionicons name={act.icon as any} size={18} color={act.color} />
              </View>
              <View>
                <Text className="text-foreground-light dark:text-foreground-dark font-bold text-xs">
                  {act.title}
                </Text>
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px] mt-1 leading-snug" numberOfLines={2}>
                  {act.desc}
                </Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
