import React from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { View, RefreshControl, useColorScheme } from "react-native";

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: Record<string, any>;
  className?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function ScreenContainer({
  children,
  scrollable = true,
  contentContainerStyle = {},
  className = "",
  onRefresh,
  refreshing = false,
}: ScreenContainerProps) {
  const bgClasses = "flex-1 bg-background-light dark:bg-background-dark";
  const colorScheme = useColorScheme();
  const refreshColor = colorScheme === "dark" ? "#f97316" : "#b45309";

  if (scrollable) {
    return (
      <KeyboardAwareScrollView
        className={`${bgClasses} ${className}`}
        contentContainerStyle={{ flexGrow: 1, ...contentContainerStyle }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={refreshColor}
              colors={[refreshColor]}
            />
          ) : undefined
        }
      >
        {children}
      </KeyboardAwareScrollView>
    );
  }

  return (
    <View className={`${bgClasses} ${className}`} style={{ flex: 1 }}>
      {children}
    </View>
  );
}
export default ScreenContainer;
