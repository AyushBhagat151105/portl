import React, { useEffect } from "react";
import { Text, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore } from "../../store/useToastStore";

export function Toast() {
  const { visible, message, type, hideToast } = useToastStore();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (visible) {
      // Slide down from top
      translateY.value = withSpring(insets.top + 12, { damping: 15 });
    } else {
      // Slide back up
      translateY.value = withTiming(-100, { duration: 250 });
    }
  }, [visible, insets.top]);

  const typeStyles = {
    success: {
      bg: "bg-emerald-500/90 dark:bg-emerald-500",
      icon: "checkmark-circle-outline",
      iconColor: "#ffffff",
    },
    error: {
      bg: "bg-rose-500/90 dark:bg-rose-500",
      icon: "alert-circle-outline",
      iconColor: "#ffffff",
    },
    info: {
      bg: "bg-zinc-800/90 dark:bg-zinc-800",
      icon: "information-circle-outline",
      iconColor: "#f59e0b",
    },
  };

  const currentStyle = typeStyles[type] || typeStyles.info;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!visible && translateY.value === -100) return null;

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          top: 0,
          left: 16,
          right: 16,
          zIndex: 9999,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        },
      ]}
    >
      <Pressable
        onPress={hideToast}
        className={`${currentStyle.bg} flex-row items-center gap-3 px-4 py-3 rounded-2xl border border-white/10`}
      >
        <Ionicons name={currentStyle.icon as any} size={20} color={currentStyle.iconColor} />
        <Text className="text-white text-xs font-semibold flex-1 leading-relaxed">
          {message}
        </Text>
        <Ionicons name="close" size={16} color="rgba(255, 255, 255, 0.6)" />
      </Pressable>
    </Animated.View>
  );
}
export default Toast;
