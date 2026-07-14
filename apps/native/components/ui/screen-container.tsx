import React from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { View } from "react-native";

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: Record<string, any>;
  className?: string;
}

export function ScreenContainer({
  children,
  scrollable = true,
  contentContainerStyle = {},
  className = "",
}: ScreenContainerProps) {
  const bgClasses = "flex-1 bg-background-light dark:bg-background-dark";

  if (scrollable) {
    return (
      <KeyboardAwareScrollView
        className={`${bgClasses} ${className}`}
        contentContainerStyle={{ flexGrow: 1, ...contentContainerStyle }}
        keyboardShouldPersistTaps="handled"
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
