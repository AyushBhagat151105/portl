import React from "react";
import { Redirect } from "expo-router";
import { useSocietyStore } from "@/store/useSocietyStore";

export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  allowedRole: "admin" | "guard" | "resident"
) {
  return function RoleGuardedComponent(props: P) {
    const { currentRole } = useSocietyStore();

    if (currentRole !== allowedRole) {
      return <Redirect href="/(drawer)" />;
    }

    return <Component {...props} />;
  };
}
