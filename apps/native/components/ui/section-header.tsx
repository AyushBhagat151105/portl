import React from "react";
import { View, Text, ViewProps } from "react-native";

interface SectionHeaderProps extends ViewProps {
  title: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, rightElement, className, ...props }: SectionHeaderProps) {
  return (
    <View
      className={`flex-row justify-between items-center mb-3.5 ${className || ""}`}
      accessibilityRole="header"
      {...props}
    >
      <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold uppercase tracking-wider">
        {title}
      </Text>
      {rightElement}
    </View>
  );
}
export default SectionHeader;
