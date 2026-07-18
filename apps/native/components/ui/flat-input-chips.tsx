import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FlatInputChipsProps {
  value: string[];
  onChange: (flats: string[]) => void;
  placeholder?: string;
}

export function FlatInputChips({
  value = [],
  onChange,
  placeholder = "e.g. 101, hit enter/comma to add",
}: FlatInputChipsProps) {
  const [inputValue, setInputValue] = useState("");

  const addChip = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    // Split by comma in case they write multiple
    const parts = cleanText
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const nextValues = [...value];
    let hasAdded = false;

    parts.forEach((part) => {
      if (!nextValues.includes(part)) {
        nextValues.push(part);
        hasAdded = true;
      }
    });

    if (hasAdded) {
      onChange(nextValues);
    }
    setInputValue("");
  };

  const removeChip = (chipToRemove: string) => {
    onChange(value.filter((val) => val !== chipToRemove));
  };

  const handleTextChange = (text: string) => {
    if (text.endsWith(",") || text.endsWith("\n")) {
      addChip(text.slice(0, -1));
    } else {
      setInputValue(text);
    }
  };

  return (
    <View className="gap-2.5">
      <TextInput
        value={inputValue}
        onChangeText={handleTextChange}
        onSubmitEditing={() => addChip(inputValue)}
        placeholder={placeholder}
        placeholderTextColor="#78716c"
        blurOnSubmit={false}
        className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-4 py-3 text-sm focus:border-primary-light dark:focus:border-primary-dark"
      />

      {value.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-1.5 py-1"
          contentContainerStyle={{ gap: 6 }}
        >
          {value.map((val) => (
            <View
              key={val}
              className="flex-row items-center bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20 px-2.5 py-1 rounded-lg gap-1.5"
            >
              <Text className="text-primary-light dark:text-primary-dark font-extrabold text-xs font-mono">
                {val}
              </Text>
              <Pressable
                onPress={() => removeChip(val)}
                className="w-4 h-4 rounded-full bg-primary-light/10 items-center justify-center active:scale-95"
                accessibilityRole="button"
                accessibilityLabel={`Remove flat ${val}`}
              >
                <Ionicons name="close" size={10} color="#b45309" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
export default FlatInputChips;
