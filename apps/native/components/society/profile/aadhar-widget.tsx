import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCloudinaryUpload } from "../../../hooks/use-cloudinary-upload";

interface AadharWidgetProps {
  aadharPublicId: string;
  onAadharChange: (publicId: string) => Promise<void>;
  onAadharDelete: () => Promise<void>;
  onAadharView: () => Promise<void>;
  isViewing: boolean;
  primaryColor: string;
}

export function AadharWidget({
  aadharPublicId,
  onAadharChange,
  onAadharDelete,
  onAadharView,
  isViewing,
  primaryColor,
}: AadharWidgetProps) {
  const { upload, isUploading } = useCloudinaryUpload({
    folder: "documents",
    type: "private",
    allowsEditing: false,
  });

  const handlePick = async () => {
    const res = await upload();
    if (res?.publicId) {
      await onAadharChange(res.publicId);
    }
  };

  return (
    <View className="gap-2.5 mt-2 bg-muted-light/25 dark:bg-muted-dark/25 p-3 rounded-2xl border border-border-light dark:border-border-dark">
      <Text className="text-foreground-light dark:text-foreground-dark text-xs font-semibold">
        Aadhar Card Document Attachment
      </Text>
      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs leading-3 mb-1">
        Aadhar documents are securely encrypted on a private CDN and only accessible via signed 10-minute temporary sessions.
      </Text>

      {isUploading ? (
        <View className="flex-row items-center justify-center p-3 gap-2">
          <ActivityIndicator color={primaryColor} size="small" />
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-bold">Uploading document...</Text>
        </View>
      ) : aadharPublicId ? (
        <View className="flex-row justify-between items-center bg-card-light dark:bg-card-dark border border-emerald-500/20 p-3 rounded-xl">
          <View className="flex-row items-center gap-2">
            <Ionicons name="shield-checkmark" size={16} color="#10b981" />
            <Text className="text-emerald-500 font-bold text-xs">Document Uploaded</Text>
          </View>
          <View className="flex-row gap-2">
            {isViewing ? (
              <ActivityIndicator color={primaryColor} size="small" />
            ) : (
              <Pressable
                onPress={onAadharView}
                className="px-2.5 py-1.5 bg-muted-light dark:bg-muted-dark rounded-lg active:opacity-75 border border-border-light dark:border-border-dark"
                accessibilityRole="button"
                accessibilityLabel="View decrypted document link"
              >
                <Text className="text-foreground-light dark:text-foreground-dark text-xxs font-bold">View</Text>
              </Pressable>
            )}
            <Pressable
              onPress={onAadharDelete}
              className="p-1.5 bg-rose-500/10 rounded-lg active:opacity-75 border border-rose-500/20"
              accessibilityRole="button"
              accessibilityLabel="Remove Aadhar card"
            >
              <Ionicons name="trash-outline" size={12} color="#ef4444" />
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={handlePick}
          className="border border-dashed border-border-light dark:border-border-dark py-3.5 rounded-xl justify-center items-center flex-row gap-2 active:bg-muted-light/40 dark:active:bg-muted-dark/40"
          accessibilityRole="button"
          accessibilityLabel="Attach aadhar scan photo"
        >
          <Ionicons name="cloud-upload-outline" size={16} color={primaryColor} />
          <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold">
            Attach document photo scan
          </Text>
        </Pressable>
      )}
    </View>
  );
}
export default AadharWidget;
