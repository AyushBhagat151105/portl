import React, { useState, useEffect } from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { useSocietyStore } from "@/store/useSocietyStore";

export function OnboardingGateView() {
  const { data: session, isPending } = authClient.useSession();
  const { setRole } = useSocietyStore();
  const [resendLoading, setResendLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifiedLocally, setIsVerifiedLocally] = useState(false);

  // 120-second (2 minute) cooldown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownSeconds]);

  // If user is already verified on mount, check if they already have a membership
  useEffect(() => {
    if (session?.user?.emailVerified) {
      checkExistingMembership();
    }
  }, [session?.user?.emailVerified]);

  async function checkExistingMembership() {
    try {
      const res = await api.get("/api/society/my-membership");
      const membership = res.data?.data;
      if (membership) {
        if (membership.role) {
          const serverRole = membership.role.toLowerCase();
          if (serverRole === "admin" || serverRole === "owner" || serverRole === "resident" || serverRole === "guard") {
            setRole(serverRole === "owner" ? "admin" : (serverRole as "admin" | "resident" | "guard"));
          }
        }
        router.replace("/(drawer)");
      }
    } catch {
      // User has no membership yet, stay on onboarding options
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  async function handleResendEmail() {
    if (cooldownSeconds > 0 || !session?.user?.email) return;

    setResendLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const { error } = await authClient.sendVerificationEmail({
        email: session.user.email,
        callbackURL: "portl://verify-email",
      });

      if (error) {
        throw new Error(error.message || "Failed to send verification email");
      }

      setStatusMessage(`Verification link sent to ${session.user.email}. Please check your inbox.`);
      setCooldownSeconds(120);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  }

  async function handleCheckStatus() {
    setCheckingStatus(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const { data: updatedSession } = await authClient.getSession({
        fetchOptions: {
          headers: {
            "Cache-Control": "no-cache",
          },
        },
      });

      if (updatedSession?.user?.emailVerified) {
        setIsVerifiedLocally(true);
        setStatusMessage("Email verified! Unlocking onboarding...");
        
        // Check if user already has a membership
        try {
          const res = await api.get("/api/society/my-membership");
          const membership = res.data?.data;
          if (membership) {
            if (membership.role) {
              const serverRole = membership.role.toLowerCase();
              if (serverRole === "admin" || serverRole === "owner" || serverRole === "resident" || serverRole === "guard") {
                setRole(serverRole === "owner" ? "admin" : (serverRole as "admin" | "resident" | "guard"));
              }
            }
            router.replace("/(drawer)");
            return;
          }
        } catch {
          // No membership yet, onboarding cards will render below
        }
      } else {
        setErrorMessage("Email is not verified yet. Please check your inbox and click the link.");
      }
    } catch (err: any) {
      setErrorMessage("Failed to refresh verification status. Try again.");
    } finally {
      setCheckingStatus(false);
    }
  }

  const isUnverified = !isVerifiedLocally && session?.user && !session.user.emailVerified;

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-zinc-950"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View className="px-6 pt-16 pb-8 items-center">
        <View className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 items-center justify-center mb-6">
          <Ionicons name="business-outline" size={36} color="#f59e0b" />
        </View>
        <Text className="text-white text-3xl font-extrabold text-center tracking-tight">
          Welcome to Portl
        </Text>
        <Text className="text-zinc-500 text-sm text-center mt-3 leading-relaxed px-4">
          {isUnverified
            ? "Please verify your email address to unlock society onboarding."
            : "You're not part of any society yet. Choose how you'd like to get started."}
        </Text>
      </View>

      {/* Action Content */}
      <View className="flex-1 px-6 gap-4 pb-10">
        {isPending ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#f59e0b" />
          </View>
        ) : isUnverified ? (
          /* Email Verification Gate Block */
          <View className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 gap-4">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 items-center justify-center">
                <Ionicons name="mail-unread-outline" size={22} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">Email Verification Required</Text>
                <Text className="text-zinc-400 text-xs mt-0.5">{session.user.email}</Text>
              </View>
            </View>

            <Text className="text-zinc-400 text-xs leading-relaxed">
              We've sent a verification link to your email address. You must verify your email before creating or joining a society.
            </Text>

            {statusMessage && (
              <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                <Text className="text-emerald-400 text-xs">{statusMessage}</Text>
              </View>
            )}

            {errorMessage && (
              <View className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
                <Text className="text-rose-400 text-xs">{errorMessage}</Text>
              </View>
            )}

            <View className="gap-3 mt-1">
              <Pressable
                onPress={handleResendEmail}
                disabled={resendLoading || cooldownSeconds > 0}
                className="bg-amber-500 active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center justify-center"
              >
                {resendLoading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text className="text-black font-bold text-sm">
                    {cooldownSeconds > 0
                      ? `Resend Email in ${formatTime(cooldownSeconds)}`
                      : "Resend Verification Email"}
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={handleCheckStatus}
                disabled={checkingStatus}
                className="bg-zinc-800 border border-zinc-700 active:opacity-80 py-3 rounded-xl items-center justify-center flex-row gap-2"
              >
                {checkingStatus ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-zinc-200 font-semibold text-xs">
                    I've Verified My Email — Unlock Onboarding
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          /* Normal Onboarding Action Cards for Verified Users */
          <>
            {/* Create Society */}
            <Pressable
              onPress={() => router.push("/onboarding/create-society")}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 active:opacity-75"
              style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
            >
              <View className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 items-center justify-center mb-4">
                <Ionicons name="add-circle-outline" size={24} color="#f59e0b" />
              </View>
              <Text className="text-white text-lg font-bold mb-1">Create a Society</Text>
              <Text className="text-zinc-500 text-sm leading-relaxed">
                You're the admin. Set up your housing society, define towers and flats, and invite members.
              </Text>
              <View className="flex-row items-center mt-4 gap-1">
                <Text className="text-amber-500 text-sm font-semibold">Get started</Text>
                <Ionicons name="arrow-forward" size={14} color="#f59e0b" />
              </View>
            </Pressable>

            {/* Join Society */}
            <Pressable
              onPress={() => router.push("/onboarding/join-society")}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 active:opacity-75"
              style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
            >
              <View className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 items-center justify-center mb-4">
                <Ionicons name="log-in-outline" size={24} color="#38bdf8" />
              </View>
              <Text className="text-white text-lg font-bold mb-1">Join a Society</Text>
              <Text className="text-zinc-500 text-sm leading-relaxed">
                You're a resident or guard. Enter your society's code to join and access your dashboard.
              </Text>
              <View className="flex-row items-center mt-4 gap-1">
                <Text className="text-sky-400 text-sm font-semibold">Enter code</Text>
                <Ionicons name="arrow-forward" size={14} color="#38bdf8" />
              </View>
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center gap-3 my-2">
              <View className="flex-1 h-px bg-zinc-800" />
              <Text className="text-zinc-600 text-xs">or</Text>
              <View className="flex-1 h-px bg-zinc-800" />
            </View>

            <Text className="text-zinc-600 text-xs text-center">
              Contact your society admin to get the join code if you haven't received one.
            </Text>
          </>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}
