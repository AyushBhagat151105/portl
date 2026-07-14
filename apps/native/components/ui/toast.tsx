import React, { useEffect, useRef } from "react";
import { Text, Pressable, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore } from "../../store/useToastStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Toast() {
  const { visible, message, type, hideToast } = useToastStore();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: insets.top + 12,
        damping: 15,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, insets.top, translateY]);

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

  return (
    <AnimatedPressable
      onPress={hideToast}
      style={{
        position: "absolute",
        top: 0,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
      }}
      className={`${currentStyle.bg} flex-row items-center gap-3 px-4 py-3 rounded-2xl border border-white/10`}
    >
      <Ionicons name={currentStyle.icon as any} size={20} color={currentStyle.iconColor} />
      <Text className="text-white text-xs font-semibold flex-1 leading-relaxed">
        {message}
      </Text>
      <Ionicons name="close" size={16} color="rgba(255, 255, 255, 0.6)" />
    </AnimatedPressable>
  );
}
export default Toast;
