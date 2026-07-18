import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCreateNoticeMutation } from "../../../queries/admin";
import { useToastStore } from "../../../store/useToastStore";
import { Card } from "../../ui/card";

export function QuickBroadcast() {
  const createNoticeMutation = useCreateNoticeMutation();
  const { showToast } = useToastStore();
  const [quickNoticeText, setQuickNoticeText] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleQuickBroadcast = async () => {
    if (!quickNoticeText.trim()) return;
    setIsBroadcasting(true);
    try {
      await createNoticeMutation.mutateAsync({
        title: "⚡ Quick Broadcast Alert",
        content: quickNoticeText.trim(),
        banner: null,
        bannerPublicId: null,
        endDate: null,
      });
      showToast("Alert broadcasted successfully!", "success");
      setQuickNoticeText("");
    } catch (err: any) {
      showToast(err.message || "Failed to broadcast alert", "error");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <Card className="mb-6 border border-amber-500/20 bg-amber-500/5 gap-2.5">
      <View className="flex-row items-center gap-1.5">
        <Ionicons name="flash" size={14} color="#f59e0b" />
        <Text className="text-foreground-light dark:text-foreground-dark font-bold text-xxs uppercase tracking-wider">
          Quick Broadcast Alert
        </Text>
      </View>
      <View className="flex-row gap-2.5">
        <TextInput
          value={quickNoticeText}
          onChangeText={setQuickNoticeText}
          placeholder="Type quick announcements to all residents..."
          placeholderTextColor="#78716c"
          className="flex-1 bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3.5 py-2.5 text-xs font-semibold"
          accessibilityLabel="Broadcast announcement input"
        />
        <Pressable
          disabled={isBroadcasting || !quickNoticeText.trim()}
          onPress={handleQuickBroadcast}
          className="bg-primary-light dark:bg-primary-dark rounded-xl px-4 justify-center active:opacity-90 disabled:opacity-50"
          accessibilityRole="button"
          accessibilityLabel="Send broadcast alert"
        >
          {isBroadcasting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={14} color="white" />
          )}
        </Pressable>
      </View>
    </Card>
  );
}
