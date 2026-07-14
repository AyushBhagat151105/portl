import React, { useState } from "react";
import { Text, View, TextInput, Pressable, Alert, ActivityIndicator, ScrollView } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface FlatEntry {
  number: string;
}

interface TowerEntry {
  name: string;
  flats: FlatEntry[];
}

export function SetupStructureView() {
  const [towers, setTowers] = useState<TowerEntry[]>([{ name: "Tower A", flats: [{ number: "101" }] }]);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const addTower = () => {
    const nextLetter = String.fromCharCode(65 + towers.length);
    setTowers((prev) => [...prev, { name: `Tower ${nextLetter}`, flats: [{ number: "101" }] }]);
  };

  const removeTower = (tIdx: number) => {
    setTowers((prev) => prev.filter((_, i) => i !== tIdx));
  };

  const updateTowerName = (tIdx: number, name: string) => {
    setTowers((prev) => prev.map((t, i) => (i === tIdx ? { ...t, name } : t)));
  };

  const addFlat = (tIdx: number) => {
    setTowers((prev) =>
      prev.map((t, i) =>
        i === tIdx ? { ...t, flats: [...t.flats, { number: "" }] } : t
      )
    );
  };

  const removeFlat = (tIdx: number, fIdx: number) => {
    setTowers((prev) =>
      prev.map((t, i) =>
        i === tIdx ? { ...t, flats: t.flats.filter((_, j) => j !== fIdx) } : t
      )
    );
  };

  const updateFlat = (tIdx: number, fIdx: number, number: string) => {
    setTowers((prev) =>
      prev.map((t, i) =>
        i === tIdx
          ? { ...t, flats: t.flats.map((f, j) => (j === fIdx ? { number } : f)) }
          : t
      )
    );
  };

  const handleSave = async () => {
    // Validate
    for (const tower of towers) {
      if (!tower.name.trim()) {
        Alert.alert("Error", "All towers must have a name");
        return;
      }
      for (const flat of tower.flats) {
        if (!flat.number.trim()) {
          Alert.alert("Error", `Tower "${tower.name}" has an empty flat number`);
          return;
        }
      }
    }

    setIsLoading(true);
    try {
      await api.post("/api/society/setup", {
        towers: towers.map((t) => ({
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
    } finally {
      setIsLoading(false);
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
        {towers.map((tower, tIdx) => (
          <View key={tIdx} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            {/* Tower Header */}
            <View className="flex-row items-center gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Tower Name
                </Text>
                <TextInput
                  value={tower.name}
                  onChangeText={(v) => updateTowerName(tIdx, v)}
                  placeholder="e.g. Tower A"
                  placeholderTextColor="#52525b"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm"
                />
              </View>
              {towers.length > 1 && (
                <Pressable
                  onPress={() => removeTower(tIdx)}
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
              {tower.flats.map((flat, fIdx) => (
                <View key={fIdx} className="flex-row items-center gap-2">
                  <TextInput
                    value={flat.number}
                    onChangeText={(v) => updateFlat(tIdx, fIdx, v)}
                    placeholder={`e.g. ${101 + fIdx}`}
                    placeholderTextColor="#52525b"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm font-mono"
                  />
                  {tower.flats.length > 1 && (
                    <Pressable
                      onPress={() => removeFlat(tIdx, fIdx)}
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
              onPress={() => addFlat(tIdx)}
              className="flex-row items-center gap-2 mt-3 py-2"
            >
              <Ionicons name="add-circle-outline" size={16} color="#f59e0b" />
              <Text className="text-amber-500 text-xs font-semibold">Add Flat</Text>
            </Pressable>
          </View>
        ))}

        {/* Add Tower Button */}
        <Pressable
          onPress={addTower}
          className="flex-row items-center justify-center gap-2 bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl py-4"
        >
          <Ionicons name="add" size={18} color="#52525b" />
          <Text className="text-zinc-500 text-sm">Add Another Tower</Text>
        </Pressable>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={isLoading}
          className="bg-emerald-500 rounded-xl py-4 items-center mt-2"
          style={{ opacity: isLoading ? 0.6 : 1 }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text className="text-black font-bold text-sm">Save Structure & Continue</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}
