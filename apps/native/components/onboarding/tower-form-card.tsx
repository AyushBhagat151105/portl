import React from "react";
import { View, Text, Pressable } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { FormInput } from "../ui/form-input";
import { FlatInputChips } from "../ui/flat-input-chips";

interface TowerFormCardProps {
  towerIndex: number;
  canRemove: boolean;
  onRemove: () => void;
}

export function TowerFormCard({
  towerIndex,
  canRemove,
  onRemove,
}: TowerFormCardProps) {
  const { control } = useFormContext(); // Retrieve form control from provider

  return (
    <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 gap-4">
      {/* Tower Header */}
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <FormInput
            control={control}
            name={`towers.${towerIndex}.name`}
            label="Tower Name"
            placeholder="e.g. Tower A"
            className="bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:border-amber-500"
          />
        </View>
        {canRemove && (
          <Pressable
            onPress={onRemove}
            className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 items-center justify-center mt-6 active:scale-95"
            accessibilityRole="button"
            accessibilityLabel="Remove this tower setup"
          >
            <Ionicons name="trash-outline" size={16} color="#f43f5e" />
          </Pressable>
        )}
      </View>

      {/* Flats tagging chips list */}
      <View className="gap-1.5">
        <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
          Flats Configured
        </Text>
        <Controller
          control={control}
          name={`towers.${towerIndex}.flats`}
          render={({ field }) => {
            const flatNumbers = (field.value || []).map((f: any) => f.number).filter(Boolean);
            const handleFlatsChange = (nums: string[]) => {
              field.onChange(nums.map((num) => ({ number: num })));
            };
            return (
              <FlatInputChips
                value={flatNumbers}
                onChange={handleFlatsChange}
                placeholder="Type flat number and press enter/comma"
              />
            );
          }}
        />
      </View>
    </View>
  );
}
export default TowerFormCard;
