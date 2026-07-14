import React from "react";
import { Text, View, Pressable, TextInput, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { createSocietySchema, type CreateSocietyFormData } from "@/lib/form-schemas";
import { FieldError } from "heroui-native";

export function CreateSocietyView() {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateSocietyFormData>({
    resolver: zodResolver(createSocietySchema),
    mode: "onTouched",
    defaultValues: { name: "", slug: "" },
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");

  const handleSlugFromName = (val: string) => {
    setValue("name", val, { shouldValidate: true });
    const slug = val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setValue("slug", slug, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateSocietyFormData) => {
    try {
      await authClient.organization.create({
        name: data.name.trim(),
        slug: data.slug.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["my-membership"] });
      router.replace("/onboarding/setup-structure");
    } catch (err: any) {
      // Error will surface via alert
      const msg = err?.message || "Failed to create society. The code may already be taken.";
      const { Alert } = await import("react-native");
      Alert.alert("Error", msg);
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
        <View className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 items-center justify-center mb-4">
          <Ionicons name="business-outline" size={28} color="#f59e0b" />
        </View>
        <Text className="text-white text-2xl font-extrabold mb-1">Create Your Society</Text>
        <Text className="text-zinc-500 text-sm leading-relaxed">
          You'll be the admin. After creating, you can set up towers, flats, and invite members.
        </Text>
      </View>

      {/* Form */}
      <View className="gap-5">
        <View className="gap-2">
          <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Society Name</Text>
          <TextInput
            value={nameValue}
            onChangeText={handleSlugFromName}
            placeholder="e.g. Sunshine Apartments"
            placeholderTextColor="#52525b"
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm"
          />
          {errors.name && (
            <FieldError isInvalid className="text-rose-500 text-xs mt-1">
              {errors.name.message}
            </FieldError>
          )}
        </View>

        <View className="gap-2">
          <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Society Code</Text>
          <TextInput
            value={slugValue}
            onChangeText={(v) => setValue("slug", v, { shouldValidate: true })}
            placeholder="e.g. sunshine-apts"
            placeholderTextColor="#52525b"
            autoCapitalize="none"
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm font-mono"
          />
          {errors.slug && (
            <FieldError isInvalid className="text-rose-500 text-xs mt-1">
              {errors.slug.message}
            </FieldError>
          )}
          <Text className="text-zinc-600 text-xs">
            Members will use this code to join. Use lowercase letters, numbers, and hyphens only.
          </Text>
        </View>

        {/* Preview */}
        {slugValue.length > 0 && (
          <View className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 flex-row items-center gap-3">
            <Ionicons name="link-outline" size={16} color="#52525b" />
            <Text className="text-zinc-500 text-xs font-mono flex-1" numberOfLines={1}>
              Join code: <Text className="text-amber-400">{slugValue}</Text>
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || !nameValue}
          className="bg-amber-500 rounded-xl py-4 items-center mt-2"
          style={({ pressed }) => ({
            opacity: pressed || isSubmitting || !nameValue ? 0.6 : 1,
          })}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text className="text-black font-bold text-sm">Create Society</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}
