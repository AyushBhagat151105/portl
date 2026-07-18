import React, { useState, useEffect, useCallback } from "react";
import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Search...",
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced callback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChangeText(localValue);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, debounceMs]);

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChangeText("");
  }, [onChangeText]);

  return (
    <View
      className={`bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark flex-row items-center px-3.5 py-2.5 rounded-xl ${className || ""}`}
    >
      <Ionicons name="search-outline" size={16} color="#78716c" style={{ marginRight: 8 }} />
      <TextInput
        value={localValue}
        onChangeText={setLocalValue}
        placeholder={placeholder}
        placeholderTextColor="#78716c"
        className="flex-1 text-foreground-light dark:text-foreground-dark text-xs font-semibold"
        accessibilityLabel={placeholder}
      />
      {localValue ? (
        <Pressable
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <Ionicons name="close-circle" size={16} color="#78716c" />
        </Pressable>
      ) : null}
    </View>
  );
}
export default SearchInput;
