import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { authClient } from "@/lib/auth-client";
import { useSocietyStore } from "@/store/useSocietyStore";
import { useMyMembershipQuery } from "@/queries/society";

export default function Index() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { currentRole, setRole } = useSocietyStore();

  // Only query membership when a session exists
  const {
    data: membership,
    isPending: membershipPending,
    isFetched: membershipFetched,
    isError: membershipError,
  } = useMyMembershipQuery(!!session);

  // Sync server role into Zustand whenever membership is loaded
  useEffect(() => {
    if (membership?.role) {
      const serverRole = membership.role.toLowerCase();
      if (serverRole === "admin" || serverRole === "owner" || serverRole === "resident" || serverRole === "guard") {
        setRole(serverRole === "owner" ? "admin" : (serverRole as "admin" | "resident" | "guard"));
      }
    }
  }, [membership]);

  // Redirect to onboarding using router.replace (avoids href type issues)
  useEffect(() => {
    if (!sessionPending && session && membershipFetched && (!membership || membershipError)) {
      router.replace("/onboarding" as any);
    }
  }, [sessionPending, session, membershipFetched, membership, membershipError]);

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
    router.replace("/(auth)/sign-in");
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  // Wait for membership check
  if (membershipPending || !membershipFetched) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  // No membership → effect above handles redirect
  if (!membership || membershipError) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  // ── Redirect to role dashboard ────────────────────────────────────────────
  const role = membership.role.toLowerCase();

  if (role === "admin" || role === "owner") {
    router.replace("/(drawer)/admin/dashboard");
  } else if (role === "guard") {
    router.replace("/(drawer)/guard/dashboard");
  } else {
    router.replace("/(drawer)/resident/dashboard");
  }

  return (
    <View className="flex-1 bg-zinc-950 items-center justify-center">
      <ActivityIndicator size="large" color="#f59e0b" />
    </View>
  );
}
