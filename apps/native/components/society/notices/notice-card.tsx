import React from "react";
import { View, Text, Image, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Card } from "../../ui/card";

export type Notice = {
  id: string;
  title: string;
  content: string;
  banner?: string | null;
  createdAt: string;
  endDate?: string | null;
  author?: {
    name: string;
    image?: string | null;
  } | null;
};

interface NoticeCardProps {
  notice: Notice;
  onDelete?: (() => void) | null;
  isDeleting?: boolean;
  primaryColor: string;
}

export function NoticeCard({
  notice,
  onDelete,
  isDeleting = false,
  primaryColor,
}: NoticeCardProps) {
  return (
    <Card className="overflow-hidden p-0 mb-3">
      {notice.banner && (
        <Image source={{ uri: notice.banner }} className="w-full h-28" />
      )}
      <View className="p-4 gap-2">
        <View className="flex-row justify-between items-start">
          <Text className="text-foreground-light dark:text-foreground-dark font-bold text-sm flex-1 mr-2 leading-snug" numberOfLines={2}>
            {notice.title}
          </Text>
          <View className="flex-row items-center gap-1.5">
            {onDelete && (
              <Pressable
                disabled={isDeleting}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  onDelete();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="w-10 h-10 rounded-full bg-rose-500/10 items-center justify-center active:scale-95 disabled:opacity-50"
                accessibilityRole="button"
                accessibilityLabel={`Delete announcement: ${notice.title}`}
              >
                <Ionicons name="trash" size={14} color="#f43f5e" />
              </Pressable>
            )}
            <Ionicons name="volume-medium-outline" size={16} color={primaryColor} />
          </View>
        </View>
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs leading-relaxed">
          {notice.content}
        </Text>
        
        <View className="flex-row justify-between items-center border-t border-border-light/40 dark:border-border-dark/40 pt-2.5 mt-1">
          <View className="flex-row items-center gap-1.5">
            {notice.author?.image ? (
              <Image source={{ uri: notice.author.image }} className="w-3.5 h-3.5 rounded-full" />
            ) : (
              <View className="w-3.5 h-3.5 rounded-full bg-muted-light dark:bg-muted-dark items-center justify-center">
                <Ionicons name="person" size={8} color="#78716c" />
              </View>
            )}
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px] font-bold">
              {notice.author?.name || "Society Admin"}
            </Text>
          </View>

          {notice.endDate ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={10} color="#f43f5e" />
              <Text className="text-rose-500 dark:text-rose-400 text-[9px] font-semibold uppercase tracking-wider">
                Expires: {new Date(notice.endDate).toLocaleDateString([], { month: "short", day: "numeric" })}
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={10} color="#78716c" />
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[9px] font-medium">
                {new Date(notice.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}
export default NoticeCard;
