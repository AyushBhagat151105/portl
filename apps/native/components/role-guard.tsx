import React from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSocietyStore } from "@/store/useSocietyStore";

export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  allowedRole: ("admin" | "guard" | "resident") | ("admin" | "guard" | "resident")[]
) {
  return function RoleGuardedComponent(props: P) {
    const { currentRole } = useSocietyStore();

    if (!currentRole) {
      return (
        <View className="flex-1 bg-zinc-950 items-center justify-center">
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      );
    }

    const allowed = Array.isArray(allowedRole)
      ? allowedRole.includes(currentRole as any)
      : currentRole === allowedRole;

    if (!allowed) {
      return <Redirect href="/(drawer)" />;
    }

    return <Component {...props} />;
  };
}
