import React from "react";
import { Text, View, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { setupStructureSchema, type SetupStructureFormData } from "@/lib/form-schemas";

export function SetupStructureView() {
  const queryClient = useQueryClient();

  const { control, handleSubmit } = useForm<SetupStructureFormData>({
    resolver: zodResolver(setupStructureSchema),
    mode: "onTouched",
    defaultValues: {
      towers: [{ name: "Tower A", flats: [{ number: "101" }] }],
    },
  });

  const {
    fields: towerFields,
    append: appendTower,
    remove: removeTower,
  } = useFieldArray({ control, name: "towers" });

  const handleAddTower = () => {
    const nextLetter = String.fromCharCode(65 + towerFields.length);
    appendTower({ name: `Tower ${nextLetter}`, flats: [{ number: "" }] });
  };

  const onSubmit = async (data: SetupStructureFormData) => {
    try {
      await api.post("/api/society/admin/setup", {
        towers: data.towers.map((t) => ({
          name: t.name.trim(),
          flats: t.flats.map((f) => f.number.trim()),
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
    <KeyboardAwareScrollView
      className="flex-1 bg-zinc-950"
      contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
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

      {/* Towers List */}
      <View className="gap-5">
        {towerFields.map((tower, tIdx) => (
          <TowerCard
            key={tower.id}
            control={control}
            towerIndex={tIdx}
            canRemove={towerFields.length > 1}
            onRemove={() => removeTower(tIdx)}
          />
        ))}

        {/* Add Tower Button */}
        <Pressable
          onPress={handleAddTower}
          className="flex-row items-center justify-center gap-2 bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl py-4"
        >
          <Ionicons name="add" size={18} color="#52525b" />
          <Text className="text-zinc-500 text-sm">Add Another Tower</Text>
        </Pressable>

        {/* Save Button */}
        <Pressable
          onPress={handleSubmit(onSubmit)}
          className="bg-emerald-500 rounded-xl py-4 items-center mt-2 active:opacity-80"
        >
          <Text className="text-black font-bold text-sm">Save Structure & Continue</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}

// Extracted tower card with its own useFieldArray for flats
function TowerCard({
  control,
  towerIndex,
  canRemove,
  onRemove,
}: {
  control: any;
  towerIndex: number;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const {
    fields: flatFields,
    append: appendFlat,
    remove: removeFlat,
  } = useFieldArray({
    control,
    name: `towers.${towerIndex}.flats`,
  });

  return (
    <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      {/* Tower Header */}
      <View className="flex-row items-center gap-3 mb-4">
        <View className="flex-1">
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
            Tower Name
          </Text>
          <Controller
            control={control}
            name={`towers.${towerIndex}.name`}
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="e.g. Tower A"
                placeholderTextColor="#52525b"
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm"
              />
            )}
          />
        </View>
        {canRemove && (
          <Pressable
            onPress={onRemove}
            className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 items-center justify-center mt-6"
          >
            <Ionicons name="trash-outline" size={14} color="#f43f5e" />
          </Pressable>
        )}
      </View>

      {/* Flats */}
      <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">
        Flat Numbers
      </Text>
      <View className="gap-2">
        {flatFields.map((flat, fIdx) => (
          <View key={flat.id} className="flex-row items-center gap-2">
            <Controller
              control={control}
              name={`towers.${towerIndex}.flats.${fIdx}.number`}
              render={({ field }) => (
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={`e.g. ${101 + fIdx}`}
                  placeholderTextColor="#52525b"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm font-mono"
                />
              )}
            />
            {flatFields.length > 1 && (
              <Pressable
                onPress={() => removeFlat(fIdx)}
                className="w-8 h-8 rounded-lg bg-zinc-800 items-center justify-center"
              >
                <Ionicons name="remove" size={16} color="#71717a" />
              </Pressable>
            )}
          </View>
        ))}
      </View>

      {/* Add Flat Button */}
      <Pressable
        onPress={() => appendFlat({ number: "" })}
        className="flex-row items-center gap-2 mt-3 py-2"
      >
        <Ionicons name="add-circle-outline" size={16} color="#f59e0b" />
        <Text className="text-amber-500 text-xs font-semibold">Add Flat</Text>
      </Pressable>
    </View>
  );
}
