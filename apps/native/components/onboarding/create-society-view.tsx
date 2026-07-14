import React, { useState } from "react";
import { Text, View, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";

export function CreateSocietyView() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSlugFromName = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) {
      Alert.alert("Error", "Society name and code are required");
      return;
    }
    setIsLoading(true);
    try {
      await authClient.organization.create({
        name: name.trim(),
        slug: slug.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["my-membership"] });
      // Navigate to setup structure
      router.replace("/onboarding/setup-structure");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to create society. The code may already be taken.");
    } finally {
      setIsLoading(false);
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
            value={name}
            onChangeText={handleSlugFromName}
            placeholder="e.g. Sunshine Apartments"
            placeholderTextColor="#52525b"
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm"
          />
        </View>

        <View className="gap-2">
          <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Society Code</Text>
          <TextInput
            value={slug}
            onChangeText={setSlug}
            placeholder="e.g. sunshine-apts"
            placeholderTextColor="#52525b"
            autoCapitalize="none"
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm font-mono"
          />
          <Text className="text-zinc-600 text-xs">
            Members will use this code to join. Use lowercase letters, numbers, and hyphens only.
          </Text>
        </View>

        {/* Preview */}
        {slug.length > 0 && (
          <View className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 flex-row items-center gap-3">
            <Ionicons name="link-outline" size={16} color="#52525b" />
            <Text className="text-zinc-500 text-xs font-mono flex-1" numberOfLines={1}>
              Join code: <Text className="text-amber-400">{slug}</Text>
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleCreate}
          disabled={isLoading || !name.trim()}
          className="bg-amber-500 rounded-xl py-4 items-center mt-2"
          style={({ pressed }) => ({
            opacity: pressed || isLoading || !name.trim() ? 0.6 : 1,
          })}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text className="text-black font-bold text-sm">Create Society</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}
