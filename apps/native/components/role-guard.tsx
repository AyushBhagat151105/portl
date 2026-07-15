import React from "react";
import { Redirect } from "expo-router";
import { useSocietyStore } from "@/store/useSocietyStore";

export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  allowedRole: ("admin" | "guard" | "resident") | ("admin" | "guard" | "resident")[]
) {
  return function RoleGuardedComponent(props: P) {
    const { currentRole } = useSocietyStore();

    const allowed = Array.isArray(allowedRole)
      ? allowedRole.includes(currentRole as any)
      : currentRole === allowedRole;

    if (!allowed) {
      return <Redirect href="/(drawer)" />;
    }

    return <Component {...props} />;
  };
}
