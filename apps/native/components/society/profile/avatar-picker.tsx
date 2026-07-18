import React from "react";
import { View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCloudinaryUpload } from "../../../hooks/use-cloudinary-upload";
import { Card } from "../../ui/card";

interface AvatarPickerProps {
  avatar: string;
  onAvatarChange: (url: string) => Promise<void>;
  onAvatarDelete: () => Promise<void>;
  name: string;
  primaryColor: string;
}

export function AvatarPicker({
  avatar,
  onAvatarChange,
  onAvatarDelete,
  name,
  primaryColor,
}: AvatarPickerProps) {
  const { upload, isUploading } = useCloudinaryUpload({
    folder: "profiles",
    type: "public",
    aspect: [1, 1],
  });

  const handlePick = async () => {
    const res = await upload();
    if (res?.url) {
      await onAvatarChange(res.url);
    }
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <Card className="items-center py-6 border border-border-light dark:border-border-dark">
      <View className="relative">
        <View className="w-24 h-24 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark justify-center items-center">
          {isUploading ? (
            <ActivityIndicator color={primaryColor} size="large" />
          ) : avatar ? (
            <Image source={{ uri: avatar }} className="w-full h-full" />
          ) : (
            <Text className="text-foreground-light dark:text-foreground-dark text-2xl font-black">{initials}</Text>
          )}
        </View>
        <Pressable
          onPress={handlePick}
          disabled={isUploading}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-light dark:bg-primary-dark items-center justify-center border-2 border-card-light dark:border-card-dark active:scale-95"
          accessibilityRole="button"
          accessibilityLabel="Change profile avatar picture"
        >
          <Ionicons name="camera" size={14} color="#ffffff" />
        </Pressable>
      </View>

      <View className="flex-row gap-3 mt-4">
        <Pressable
          onPress={handlePick}
          disabled={isUploading}
          className="px-4 py-1.5 rounded-lg border border-border-light dark:border-border-dark active:opacity-75"
          accessibilityRole="button"
          accessibilityLabel="Upload custom photo"
        >
          <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold">Upload Photo</Text>
        </Pressable>
        {avatar ? (
          <Pressable
            onPress={onAvatarDelete}
            className="px-4 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 active:opacity-75"
            accessibilityRole="button"
            accessibilityLabel="Remove photo"
          >
            <Text className="text-rose-500 text-xs font-bold">Remove</Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}
export default AvatarPicker;
