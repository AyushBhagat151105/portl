import React, { useState } from "react";
import { Text, View, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useJoinSocietyMutation } from "@/queries/society";
import { useSocietyStore } from "@/store/useSocietyStore";

const ROLES = [
  {
    key: "resident" as const,
    label: "Resident",
    description: "I live in the society",
    icon: "home-outline",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.25)",
  },
  {
    key: "guard" as const,
    label: "Security Guard",
    description: "I manage the gate",
    icon: "shield-checkmark-outline",
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.08)",
    border: "rgba(56, 189, 248, 0.25)",
  },
];

export function JoinSocietyView() {
  const [slug, setSlug] = useState("");
  const [role, setRole] = useState<"resident" | "guard">("resident");
  const joinMutation = useJoinSocietyMutation();
  const { setRole: storeSetRole } = useSocietyStore();

  const handleJoin = async () => {
    if (!slug.trim()) {
      Alert.alert("Error", "Please enter the society code");
      return;
    }
    try {
      await joinMutation.mutateAsync({ slug: slug.trim(), role });
      storeSetRole(role);
      // Navigate to appropriate dashboard
      if (role === "guard") {
        router.replace("/(drawer)/guard/dashboard");
      } else {
        router.replace("/(drawer)/resident/dashboard");
      }
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || err?.message || "Failed to join society. Check the code and try again.");
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-zinc-950"
      contentContainerStyle={{ flexGrow: 1, padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back button */}
      <Pressable onPress={() => router.back()} className="flex-row items-center gap-2 mb-8 mt-2">
        <Ionicons name="arrow-back" size={20} color="#a1a1aa" />
        <Text className="text-zinc-400 text-sm">Back</Text>
      </Pressable>

      {/* Header */}
      <View className="mb-8">
        <View className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 items-center justify-center mb-4">
          <Ionicons name="log-in-outline" size={28} color="#38bdf8" />
        </View>
        <Text className="text-white text-2xl font-extrabold mb-1">Join a Society</Text>
        <Text className="text-zinc-500 text-sm leading-relaxed">
          Ask your society admin for the join code. Select your role below.
        </Text>
      </View>

      {/* Form */}
      <View className="gap-6">
        {/* Society Code */}
        <View className="gap-2">
          <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Society Code</Text>
          <TextInput
            value={slug}
            onChangeText={setSlug}
            placeholder="e.g. sunshine-apts"
            placeholderTextColor="#52525b"
            autoCapitalize="none"
            autoCorrect={false}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm font-mono"
          />
        </View>

        {/* Role Selection */}
        <View className="gap-2">
          <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">I am a…</Text>
          <View className="gap-3">
            {ROLES.map((r) => {
              const active = role === r.key;
              return (
                <Pressable
                  key={r.key}
                  onPress={() => setRole(r.key)}
                  className="flex-row items-center gap-4 p-4 rounded-xl border"
                  style={{
                    backgroundColor: active ? r.bg : "#18181b",
                    borderColor: active ? r.border : "#27272a",
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center"
                    style={{ backgroundColor: active ? r.bg : "#09090b" }}
                  >
                    <Ionicons name={r.icon as any} size={20} color={active ? r.color : "#52525b"} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: active ? r.color : "#a1a1aa", fontWeight: active ? "700" : "400" }} className="text-sm">
                      {r.label}
                    </Text>
                    <Text className="text-zinc-600 text-xs mt-0.5">{r.description}</Text>
                  </View>
                  {active && (
                    <Ionicons name="checkmark-circle" size={20} color={r.color} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={handleJoin}
          disabled={joinMutation.isPending || !slug.trim()}
          className="rounded-xl py-4 items-center mt-2"
          style={{
            backgroundColor: role === "guard" ? "#38bdf8" : "#f59e0b",
            opacity: joinMutation.isPending || !slug.trim() ? 0.6 : 1,
          }}
        >
          {joinMutation.isPending ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text className="text-black font-bold text-sm">Join Society</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}
