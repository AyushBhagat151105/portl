import React from "react";
import { Text, Pressable, View, Platform } from "react-native";
import * as Haptics from "expo-haptics";

interface TimeSlot {
  label: string;
  value: string;
  icon?: string;
}

const DEFAULT_SLOTS: TimeSlot[] = [
  { label: "6 - 8 AM", value: "06:00 - 08:00", icon: "🌅" },
  { label: "8 - 10 AM", value: "08:00 - 10:00", icon: "☀️" },
  { label: "10 AM - 12 PM", value: "10:00 - 12:00", icon: "☀️" },
  { label: "12 - 2 PM", value: "12:00 - 14:00", icon: "🌤" },
  { label: "2 - 4 PM", value: "14:00 - 16:00", icon: "⛅" },
  { label: "4 - 6 PM", value: "16:00 - 18:00", icon: "🌇" },
  { label: "6 - 8 PM", value: "18:00 - 20:00", icon: "🌙" },
  { label: "8 - 10 PM", value: "20:00 - 22:00", icon: "🌙" },
];

interface TimeSlotChipsProps {
  value: string;
  onChange: (timeslot: string) => void;
  slots?: TimeSlot[];
}

export function TimeSlotChips({ value, onChange, slots = DEFAULT_SLOTS }: TimeSlotChipsProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {slots.map((slot) => {
        const isSelected = value === slot.value;

        return (
          <Pressable
            key={slot.value}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onChange(slot.value);
            }}
            className={`flex-row items-center h-11 px-4 rounded-xl border ${
              isSelected
                ? "bg-primary-light dark:bg-primary-dark border-primary-light dark:border-primary-dark"
                : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
            }`}
          >
            {slot.icon && (
              <Text className="text-xs mr-1.5">{slot.icon}</Text>
            )}
            <Text
              className={`text-xs font-semibold ${
                isSelected
                  ? "text-white"
                  : "text-muted-foreground-light dark:text-muted-foreground-dark"
              }`}
            >
              {slot.label}
            </Text>
            {isSelected && (
              <View className="w-1.5 h-1.5 rounded-full bg-white/70 ml-2" />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
