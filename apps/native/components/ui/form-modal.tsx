import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FormModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  onSubmit: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  maxHeight?: number;
}

export function FormModal({
  visible,
  onClose,
  title,
  onSubmit,
  submitLabel = "Save",
  isSubmitting = false,
  disabled = false,
  children,
  maxHeight = 420,
}: FormModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center items-center bg-black/60 px-4"
      >
        {/* Backdrop dismiss */}
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
          accessibilityLabel="Close modal"
        />

        <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl p-5 w-full max-w-[340px] gap-4">
          {/* Header */}
          <View className="flex-row justify-between items-center">
            <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm">
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityLabel="Close"
              accessibilityRole="button"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={20} color="#78716c" />
            </Pressable>
          </View>

          {/* Scrollable content */}
          <ScrollView
            style={{ maxHeight }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="gap-4">{children}</View>
          </ScrollView>

          {/* Submit button */}
          <Pressable
            onPress={onSubmit}
            disabled={isSubmitting || disabled}
            className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 py-3 rounded-xl items-center"
            accessibilityRole="button"
            accessibilityLabel={submitLabel}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-xs">{submitLabel}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
export default FormModal;
