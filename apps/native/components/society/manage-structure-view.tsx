import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTowersQuery, useSetupStructureMutation } from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { Loader } from "../ui/loader";
import { FlatInputChips } from "../ui/flat-input-chips";

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
  const [newFlats, setNewFlats] = useState<string[]>([]);

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

    setTowers((prev) => [...prev, { name: newTowerName.trim(), flats: newFlats }]);
    setNewTowerName("");
    setNewFlats([]);
    showToast("Tower added to configuration list!", "success");
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
      <ScrollView className="flex-grow" contentContainerStyle={{ paddingBottom: 140, gap: 20 }}>
        <Text className="text-xl font-bold text-foreground-light dark:text-foreground-dark mt-2">
          Manage Society Structure
        </Text>
        <Text className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark -mt-2">
          Add new towers or flats to expand the society layout database.
        </Text>

        {/* Add New Tower Card */}
        <Card className="gap-4">
          <Text className="text-sm font-semibold text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider">
            Add New Tower
          </Text>

          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold">Tower Name</Text>
              <TextInput
                value={newTowerName}
                onChangeText={setNewTowerName}
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark text-sm px-4 py-3 rounded-xl focus:border-amber-500"
                placeholder="e.g. Tower C"
                placeholderTextColor="#78716c"
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold">Flats List</Text>
              <FlatInputChips
                value={newFlats}
                onChange={setNewFlats}
                placeholder="Type flat number and press enter/comma"
              />
            </View>

            <Pressable
              onPress={handleAddTower}
              className="bg-primary-light dark:bg-primary-dark py-3.5 rounded-xl items-center mt-2 flex-row justify-center gap-2 active:opacity-90"
              accessibilityRole="button"
              accessibilityLabel="Add tower configuration"
            >
              <Ionicons name="add-circle-outline" size={16} color="#ffffff" />
              <Text className="text-white text-xs font-bold">Add Tower to Config</Text>
            </Pressable>
          </View>
        </Card>

        {/* Configuration Preview */}
        <Text className="text-sm font-semibold text-muted-foreground-light dark:text-muted-foreground-dark uppercase tracking-wider mt-4">
          Towers Configuration Preview
        </Text>

        {towers.length === 0 ? (
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm italic">No towers configured yet.</Text>
        ) : (
          towers.map((tower, tIdx) => {
            return (
              <Card key={tower.name} className="gap-3">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-base font-bold text-foreground-light dark:text-foreground-dark">
                    {tower.name}
                  </Text>
                  <Text className="text-xxs bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark px-2.5 py-1 rounded-md border border-border-light/40 dark:border-border-dark/40 font-bold">
                    {tower.flats.length} Flats
                  </Text>
                </View>

                {/* Flat chips list */}
                <View className="flex-row flex-wrap gap-2">
                  {tower.flats.map((flat) => (
                    <View
                      key={flat}
                      className="bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20 px-2.5 py-1 rounded-lg flex-row items-center gap-1.5"
                    >
                      <Text className="text-xs text-primary-light dark:text-primary-dark font-extrabold font-mono">{flat}</Text>
                      <Pressable onPress={() => handleRemoveFlat(tIdx, flat)} accessibilityRole="button" accessibilityLabel={`Remove flat ${flat} from ${tower.name}`}>
                        <Ionicons name="close" size={12} color="#f43f5e" />
                      </Pressable>
                    </View>
                  ))}
                </View>

                {/* Add Flat inline row */}
                <FlatAdderRow
                  onAddFlat={(flatNum) => handleAddFlatToTower(tIdx, flatNum)}
                />
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Save Changes Footer */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          borderTopWidth: 1,
        }}
        className="bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark"
      >
        <Pressable
          onPress={handleSaveModification}
          disabled={setupMutation.isPending}
          className="bg-emerald-600 active:opacity-90 disabled:opacity-50 py-4 rounded-xl items-center flex-row justify-center gap-2"
          accessibilityRole="button"
          accessibilityLabel="Save society structure modifications"
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

// Inline component to keep local state isolated per tower list row
function FlatAdderRow({ onAddFlat }: { onAddFlat: (flatNum: string) => void }) {
  const [flatNum, setFlatNum] = useState("");
  return (
    <View className="flex-row gap-2 mt-2 pt-2 border-t border-border-light/40 dark:border-border-dark/40">
      <TextInput
        value={flatNum}
        onChangeText={setFlatNum}
        placeholder="New Flat Num (e.g. 505)"
        placeholderTextColor="#78716c"
        className="flex-1 bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark text-xs px-3 py-2 rounded-lg font-semibold"
        keyboardType="numeric"
      />
      <Pressable
        onPress={() => {
          if (flatNum.trim()) {
            onAddFlat(flatNum.trim());
            setFlatNum("");
          }
        }}
        className="bg-primary-light dark:bg-primary-dark active:opacity-75 px-4 rounded-lg items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel="Add flat to tower"
      >
        <Text className="text-xs text-white font-bold">Add Flat</Text>
      </Pressable>
    </View>
  );
}
export default ManageStructureView;
