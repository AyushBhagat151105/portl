import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTowersQuery, useSetupStructureMutation } from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { Loader } from "../ui/loader";

interface TowerInput {
  name: string;
  flats: string[];
}

export function ManageStructureView() {
  const { data: currentTowers, isLoading: towersLoading } = useTowersQuery();
  const setupMutation = useSetupStructureMutation();
  const { showToast } = useToastStore();

  const [towers, setTowers] = useState<TowerInput[]>([]);
  const [newTowerName, setNewTowerName] = useState("");
  const [newFlatsString, setNewFlatsString] = useState("");

  // Sync existing towers when query loads
  useEffect(() => {
    if (currentTowers) {
      const formatted = currentTowers.map((t: any) => ({
        name: t.name,
        flats: t.flats.map((f: any) => f.number),
      }));
      setTowers(formatted);
    }
  }, [currentTowers]);

  const handleAddTower = () => {
    if (!newTowerName.trim()) {
      showToast("Tower name is required", "error");
      return;
    }
    // Check duplicate
    if (towers.some((t) => t.name.toLowerCase() === newTowerName.trim().toLowerCase())) {
      showToast("Tower already exists", "error");
      return;
    }

    const flatsArray = newFlatsString
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    setTowers((prev) => [...prev, { name: newTowerName.trim(), flats: flatsArray }]);
    setNewTowerName("");
    setNewFlatsString("");
    showToast("Tower added to temporary configuration list!", "success");
  };

  const handleAddFlatToTower = (towerIdx: number, flatNum: string) => {
    if (!flatNum.trim()) return;
    setTowers((prev) =>
      prev.map((t, idx) => {
        if (idx !== towerIdx) return t;
        if (t.flats.includes(flatNum.trim())) {
          showToast("Flat number already exists under this tower", "error");
          return t;
        }
        return {
          ...t,
          flats: [...t.flats, flatNum.trim()].sort(),
        };
      })
    );
  };

  const handleRemoveFlat = (towerIdx: number, flatNum: string) => {
    setTowers((prev) =>
      prev.map((t, idx) => {
        if (idx !== towerIdx) return t;
        return {
          ...t,
          flats: t.flats.filter((f) => f !== flatNum),
        };
      })
    );
  };

  const handleSaveModification = async () => {
    if (towers.length === 0) {
      showToast("Must configure at least one tower", "error");
      return;
    }

    try {
      await setupMutation.mutateAsync({ towers });
      showToast("Society structure modifications saved successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update structures", "error");
    }
  };

  if (towersLoading) {
    return <Loader />;
  }

  return (
    <ScreenContainer scrollable={false} className="p-5">
      <ScrollView className="flex-grow" contentContainerStyle={{ paddingBottom: 120, gap: 20 }}>
        <Text className="text-xl font-bold text-zinc-900 dark:text-white mt-2">
          Manage Society Structure
        </Text>
        <Text className="text-xs text-zinc-500 dark:text-zinc-400 -mt-2">
          Add new towers or flats to expand the society layout database.
        </Text>

        {/* ── ADD NEW TOWER CARD ── */}
        <Card>
          <Text className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
            Add New Tower
          </Text>

          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="text-zinc-600 dark:text-zinc-400 text-xs">Tower Name</Text>
              <TextInput
                value={newTowerName}
                onChangeText={setNewTowerName}
                className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 rounded-xl focus:border-amber-500"
                placeholder="e.g. Tower C"
                placeholderTextColor="#71717a"
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-zinc-600 dark:text-zinc-400 text-xs">Flats (comma separated list)</Text>
              <TextInput
                value={newFlatsString}
                onChangeText={setNewFlatsString}
                className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm px-4 py-3 rounded-xl focus:border-amber-500"
                placeholder="e.g. 101, 102, 103"
                placeholderTextColor="#71717a"
              />
            </View>

            <Pressable
              onPress={handleAddTower}
              className="bg-amber-600 active:bg-amber-700 py-3 rounded-xl items-center mt-2 flex-row justify-center gap-2"
            >
              <Ionicons name="add-circle-outline" size={16} color="#ffffff" />
              <Text className="text-white text-xs font-bold">Add Tower to Config</Text>
            </Pressable>
          </View>
        </Card>

        {/* ── CONFIGURATION PREVIEW ── */}
        <Text className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-4">
          Towers Configuration Preview
        </Text>

        {towers.length === 0 ? (
          <Text className="text-zinc-500 text-sm italic">No towers configured yet.</Text>
        ) : (
          towers.map((tower, tIdx) => {
            return (
              <Card key={tower.name}>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-base font-bold text-zinc-900 dark:text-white">
                    {tower.name}
                  </Text>
                  <Text className="text-xxs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-md">
                    {tower.flats.length} Flats
                  </Text>
                </View>

                {/* Flat chips list */}
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {tower.flats.map((flat) => (
                    <View
                      key={flat}
                      className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg flex-row items-center gap-1.5"
                    >
                      <Text className="text-xs text-zinc-900 dark:text-white">{flat}</Text>
                      <Pressable onPress={() => handleRemoveFlat(tIdx, flat)}>
                        <Ionicons name="close-circle" size={14} color="#f43f5e" />
                      </Pressable>
                    </View>
                  ))}
                </View>

                {/* Add Flat inline form */}
                <FlatAdderRow
                  onAddFlat={(flatNum) => handleAddFlatToTower(tIdx, flatNum)}
                />
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* ── PERSIST CHANGES FOOTER ── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          borderTopWidth: 1,
        }}
        className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
      >
        <Pressable
          onPress={handleSaveModification}
          disabled={setupMutation.isPending}
          className="bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 py-4 rounded-xl items-center flex-row justify-center gap-2"
        >
          {setupMutation.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color="#ffffff" />
              <Text className="text-white text-sm font-bold">Save Structure Modifications</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

// Inline component to keep local state isolates per tower list row
function FlatAdderRow({ onAddFlat }: { onAddFlat: (flatNum: string) => void }) {
  const [flatNum, setFlatNum] = useState("");
  return (
    <View className="flex-row gap-2 mt-2">
      <TextInput
        value={flatNum}
        onChangeText={setFlatNum}
        placeholder="New Flat Num (e.g. 505)"
        placeholderTextColor="#71717a"
        className="flex-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs px-3 py-2 rounded-lg"
        keyboardType="numeric"
      />
      <Pressable
        onPress={() => {
          if (flatNum.trim()) {
            onAddFlat(flatNum.trim());
            setFlatNum("");
          }
        }}
        className="bg-zinc-900 dark:bg-zinc-100 active:opacity-75 px-4 rounded-lg items-center justify-center"
      >
        <Text className="text-xs text-white dark:text-zinc-900 font-semibold">Add Flat</Text>
      </Pressable>
    </View>
  );
}
export default ManageStructureView;
