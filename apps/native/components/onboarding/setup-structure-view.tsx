import React from "react";
import { Text, View, Pressable, Alert } from "react-native";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenContainer } from "../ui/screen-container";
import { TowerFormCard } from "./tower-form-card";
import { setupStructureSchema, type SetupStructureFormData } from "@/lib/form-schemas";

export function SetupStructureView() {
  const queryClient = useQueryClient();

  const methods = useForm<SetupStructureFormData>({
    resolver: zodResolver(setupStructureSchema),
    mode: "onTouched",
    defaultValues: {
      towers: [{ name: "Tower A", flats: [{ number: "101" }] }],
    },
  });

  const { control, handleSubmit } = methods;

  const {
    fields: towerFields,
    append: appendTower,
    remove: removeTower,
  } = useFieldArray({ control, name: "towers" });

  const handleAddTower = () => {
    const nextLetter = String.fromCharCode(65 + towerFields.length);
    appendTower({ name: `Tower ${nextLetter}`, flats: [] });
  };

  const onSubmit = async (data: SetupStructureFormData) => {
    try {
      await api.post("/api/society/admin/setup", {
        towers: data.towers.map((t) => ({
          name: t.name.trim(),
          flats: t.flats.map((f) => f.number.trim()).filter((num) => num.length > 0),
        })),
      });
      queryClient.invalidateQueries({ queryKey: ["towers"] });
      Alert.alert("Success!", "Society structure has been set up.", [
        { text: "Continue", onPress: () => router.replace("/(drawer)/admin/dashboard") },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || err?.message || "Failed to save structure");
    }
  };

  return (
    <FormProvider {...methods}>
      <ScreenContainer
        contentContainerStyle={{ padding: 24, paddingBottom: 60, flexGrow: 1 }}
        className="bg-zinc-950"
      >
        {/* Header */}
        <View className="mb-8 mt-2">
          <View className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-4">
            <Ionicons name="layers-outline" size={28} color="#34d399" />
          </View>
          <Text className="text-white text-2xl font-extrabold mb-1">Setup Structure</Text>
          <Text className="text-zinc-500 text-sm leading-relaxed">
            Define towers and flat numbers. Residents will be assigned to flats later.
          </Text>
        </View>

        {/* Towers list */}
        <View className="gap-5">
          {towerFields.map((tower, tIdx) => (
            <TowerFormCard
              key={tower.id}
              towerIndex={tIdx}
              canRemove={towerFields.length > 1}
              onRemove={() => removeTower(tIdx)}
            />
          ))}

          {/* Add Tower button */}
          <Pressable
            onPress={handleAddTower}
            className="flex-row items-center justify-center gap-2 bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl py-4 active:bg-zinc-800/50"
            accessibilityRole="button"
            accessibilityLabel="Add another tower configuration"
          >
            <Ionicons name="add" size={18} color="#52525b" />
            <Text className="text-zinc-500 text-sm">Add Another Tower</Text>
          </Pressable>

          {/* Save & continue */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            className="bg-emerald-500 rounded-xl py-4 items-center mt-2 active:opacity-85"
            accessibilityRole="button"
            accessibilityLabel="Save structure and continue to dashboard"
          >
            <Text className="text-black font-bold text-sm">Save Structure & Continue</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    </FormProvider>
  );
}

export default SetupStructureView;
