import React from "react";
import { View, ViewProps, Text } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={`bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-4 ${className || ""}`}
      {...props}
    >
      {children}
    </View>
  );
}

interface CardTitleProps {
  children: string;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <Text className={`text-foreground-light dark:text-foreground-dark font-bold text-base ${className || ""}`}>
      {children}
    </Text>
  );
}

interface CardDescriptionProps {
  children: string;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <Text className={`text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5 ${className || ""}`}>
      {children}
    </Text>
  );
}
export default Card;
