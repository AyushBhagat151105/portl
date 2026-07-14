import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { authClient } from "@/lib/auth-client";
import { useSocietyStore } from "@/store/useSocietyStore";
import { useMyMembershipQuery } from "@/queries/society";

export default function Index() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { currentRole, setRole } = useSocietyStore();
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);

  // Only query membership when a session exists
  const {
    data: membership,
    isPending: membershipPending,
    isFetched: membershipFetched,
    isError: membershipError,
  } = useMyMembershipQuery(session?.user?.id, !!session);

  // Safety timeout — if membership check takes > 8 seconds, fall back to onboarding
  React.useEffect(() => {
    if (session && membershipPending) {
      const timer = setTimeout(() => setLoadingTimeout(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [session, membershipPending]);

  // Sync server role into Zustand whenever membership is loaded
  useEffect(() => {
    if (membership?.role) {
      const serverRole = membership.role.toLowerCase();
      if (serverRole === "admin" || serverRole === "owner" || serverRole === "resident" || serverRole === "guard") {
        setRole(serverRole === "owner" ? "admin" : (serverRole as "admin" | "resident" | "guard"));
      }
    }
  }, [membership]);

  // ── Loading states ────────────────────────────────────────────────────────
  if (sessionPending) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  // No session → go to sign-in
  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Wait for membership check (with 8s safety timeout)
  if ((membershipPending || !membershipFetched) && !loadingTimeout) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  // No membership, query failed, or timed out → go to onboarding
  if (!membership || membershipError || loadingTimeout) {
    return <Redirect href="/onboarding" />;
  }

  // ── Sync role into Zustand then redirect to role dashboard ─────
  const role = membership.role?.toLowerCase();
  if (role === "admin" || role === "owner") {
    return <Redirect href="/(drawer)/admin/dashboard" />;
  } else if (role === "guard") {
    return <Redirect href="/(drawer)/guard/dashboard" />;
  } else {
    return <Redirect href="/(drawer)/resident/dashboard" />;
  }
}
