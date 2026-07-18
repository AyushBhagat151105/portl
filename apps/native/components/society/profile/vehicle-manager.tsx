import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, CardTitle, CardDescription } from "../../ui/card";
import { useToastStore } from "../../../store/useToastStore";

export type Vehicle = {
  plateNumber: string;
  makeModel: string;
  type: "CAR" | "BIKE";
};

interface VehicleManagerProps {
  vehicles: Vehicle[];
  onVehiclesChange: (vehicles: Vehicle[]) => void;
  primaryColor: string;
  isDark: boolean;
}

export function VehicleManager({
  vehicles,
  onVehiclesChange,
  primaryColor,
  isDark,
}: VehicleManagerProps) {
  const [newPlate, setNewPlate] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newType, setNewType] = useState<"CAR" | "BIKE">("CAR");
  const { showToast } = useToastStore();

  const handleAddVehicle = () => {
    if (!newPlate.trim()) {
      showToast("Plate number is required", "error");
      return;
    }
    const cleanPlate = newPlate.toUpperCase().trim();
    if (vehicles.some((v) => v.plateNumber === cleanPlate)) {
      showToast("Vehicle already added", "error");
      return;
    }
    onVehiclesChange([
      ...vehicles,
      { plateNumber: cleanPlate, makeModel: newModel.trim(), type: newType },
    ]);
    setNewPlate("");
    setNewModel("");
  };

  const handleRemoveVehicle = (plate: string) => {
    onVehiclesChange(vehicles.filter((v) => v.plateNumber !== plate));
  };

  return (
    <Card>
      <CardTitle>Registered Vehicles</CardTitle>
      <CardDescription>Configure vehicles authorized for gate entry</CardDescription>

      {/* Vehicles list */}
      {vehicles.length > 0 ? (
        <View className="gap-2.5 mt-4">
          {vehicles.map((v) => (
            <View
              key={v.plateNumber}
              className="flex-row justify-between items-center bg-muted-light/35 dark:bg-muted-dark/20 border border-border-light dark:border-border-dark p-3 rounded-xl"
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-primary-light/10 dark:bg-primary-dark/10 p-2 rounded-lg">
                  <Ionicons
                    name={v.type === "CAR" ? "car-outline" : "bicycle-outline"}
                    size={18}
                    color={primaryColor}
                  />
                </View>
                <View>
                  <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-sm font-mono">
                    {v.plateNumber}
                  </Text>
                  {v.makeModel ? (
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                      {v.makeModel}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Pressable
                onPress={() => handleRemoveVehicle(v.plateNumber)}
                className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 active:opacity-75"
                accessibilityRole="button"
                accessibilityLabel={`Remove vehicle plate ${v.plateNumber}`}
              >
                <Ionicons name="trash-outline" size={12} color="#ef4444" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs italic mt-4 mb-2">
          No vehicles registered. Add a vehicle below.
        </Text>
      )}

      {/* Add vehicle form */}
      <View className="mt-5 pt-5 border-t border-border-light/40 dark:border-border-dark/40 gap-4">
        <Text className="text-foreground-light dark:text-foreground-dark font-bold text-xs uppercase tracking-wider">
          Add New Vehicle
        </Text>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-1.5">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
              Plate Number *
            </Text>
            <TextInput
              value={newPlate}
              onChangeText={setNewPlate}
              autoCapitalize="characters"
              placeholder="e.g. MH12AB1234"
              placeholderTextColor="#78716c"
              className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3 py-2 text-xs font-mono"
            />
          </View>
          <View className="flex-1 gap-1.5">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
              Make / Model
            </Text>
            <TextInput
              value={newModel}
              onChangeText={setNewModel}
              placeholder="e.g. White Swift"
              placeholderTextColor="#78716c"
              className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3 py-2 text-xs"
            />
          </View>
        </View>

        {/* Type Selector (Car / Bike) */}
        <View className="gap-1.5">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
            Vehicle Type
          </Text>
          <View className="flex-row gap-2">
            {([
              { key: "CAR" as const, label: "Car", icon: "car-outline" },
              { key: "BIKE" as const, label: "Two Wheeler", icon: "bicycle-outline" },
            ] as const).map((t) => {
              const active = newType === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setNewType(t.key)}
                  className={`flex-1 flex-row items-center justify-center gap-2 py-2 rounded-xl border ${
                    active
                      ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                      : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                  }`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={14}
                    color={active ? primaryColor : "#78716c"}
                  />
                  <Text className={`text-xs font-bold ${active ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={handleAddVehicle}
          className="bg-primary-light dark:bg-primary-dark py-3.5 rounded-xl items-center active:opacity-90 mt-2"
          accessibilityRole="button"
          accessibilityLabel="Add vehicle to config list"
        >
          <Text className="text-white font-bold text-xs">Add Vehicle</Text>
        </Pressable>
      </View>
    </Card>
  );
}
export default VehicleManager;
