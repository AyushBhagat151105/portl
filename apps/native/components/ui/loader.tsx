import React from "react";
import { ActivityIndicator, View, useColorScheme } from "react-native";

interface LoaderProps {
  size?: "small" | "large";
  color?: string;
  fullscreen?: boolean;
}

export function Loader({ size = "large", color, fullscreen = true }: LoaderProps) {
  const colorScheme = useColorScheme();
  // Determine spinner color based on system scheme
  const spinnerColor = color || (colorScheme === "dark" ? "#f97316" : "#b45309");

  if (fullscreen) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size={size} color={spinnerColor} />
      </View>
    );
  }

  return (
    <View className="items-center justify-center p-4">
      <ActivityIndicator size={size} color={spinnerColor} />
    </View>
  );
}
export default Loader;
