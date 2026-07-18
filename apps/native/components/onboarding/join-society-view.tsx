import React from "react";
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useJoinSocietyMutation } from "@/queries/society";
import { useSocietyStore } from "@/store/useSocietyStore";
import { ScreenContainer } from "../ui/screen-container";
import { FormInput } from "../ui/form-input";
import { BackButton } from "./back-button";
import { RoleCard } from "./role-card";
import { joinSocietySchema, type JoinSocietyFormData } from "@/lib/form-schemas";

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
  const joinMutation = useJoinSocietyMutation();
  const { setRole: storeSetRole } = useSocietyStore();

  const { control, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<JoinSocietyFormData>({
    resolver: zodResolver(joinSocietySchema),
    mode: "onTouched",
    defaultValues: { slug: "", role: "resident" },
  });

  const selectedRole = watch("role");
  const slugValue = watch("slug");

  const onSubmit = async (data: JoinSocietyFormData) => {
    try {
      await joinMutation.mutateAsync({ slug: data.slug.trim(), role: data.role });
      storeSetRole(data.role);
      if (data.role === "guard") {
        router.replace("/(drawer)/guard/dashboard");
      } else {
        router.replace("/(drawer)/resident/dashboard");
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || err?.message || "Failed to join society. Check the code and try again.",
      );
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
      {/* Back button */}
      <BackButton />

      {/* Header */}
      <View className="mb-8">
        <View className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 items-center justify-center mb-4">
          <Ionicons name="log-in-outline" size={28} color="#38bdf8" />
        </View>
        <Text className="text-foreground-light dark:text-foreground-dark text-2xl font-extrabold mb-1">Join a Society</Text>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm leading-relaxed">
          Ask your society admin for the join code. Select your role below.
        </Text>
      </View>

      {/* Form */}
      <View className="gap-6">
        {/* Society Code */}
        <FormInput
          control={control}
          name="slug"
          label="Society Code"
          placeholder="e.g. sunshine-apts"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Role Selection */}
        <View className="gap-2">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold uppercase tracking-wider">I am a…</Text>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <View className="gap-3">
                {ROLES.map((r) => (
                  <RoleCard
                    key={r.key}
                    role={r}
                    active={field.value === r.key}
                    onSelect={() => field.onChange(r.key)}
                  />
                ))}
              </View>
            )}
          />
        </View>

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || !slugValue}
          className="bg-primary-light dark:bg-primary-dark rounded-xl py-4 items-center mt-2 active:opacity-90 disabled:opacity-50"
          accessibilityRole="button"
          accessibilityLabel="Join society"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-bold text-sm">Join Society</Text>
          )}
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

export default JoinSocietyView;
