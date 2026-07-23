import React, { useState } from "react";
import { View, Text, Modal, Pressable, ActivityIndicator } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { Ionicons } from "@expo/vector-icons";
import { useUpdateCheck } from "@/queries/useUpdateCheck";

export function UpdateModal() {
  const { data: release } = useUpdateCheck();
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!release?.isUpdateRequired) return null;

  const handleStartUpdate = async () => {
    try {
      setIsDownloading(true);
      setErrorMsg(null);
      const targetPath = `${FileSystem.cacheDirectory}portl-update.apk`;

      const downloadResumable = FileSystem.createDownloadResumable(
        release.downloadUrl,
        targetPath,
        {},
        (progress) => {
          if (progress.totalBytesExpectedToWrite > 0) {
            const percent = Math.round(
              (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100
            );
            setDownloadProgress(percent);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result?.uri) {
        const contentUri = await FileSystem.getContentUriAsync(result.uri);
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          type: "application/vnd.android.package-archive",
        });
      }
    } catch (err: any) {
      console.error("APK Auto-Update download failed:", err);
      setErrorMsg(err.message || "Failed to download update");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal visible transparent animationType="fade">
      <View className="flex-1 bg-black/80 justify-center items-center p-6">
        <View className="w-full max-w-sm rounded-3xl bg-zinc-950 p-6 border border-zinc-800 shadow-2xl items-center text-center">
          
          {/* Header Icon */}
          <View className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 justify-center items-center mb-4">
            <Ionicons name="download-outline" size={24} color="#f59e0b" />
          </View>

          {/* Title & Version Info */}
          <Text className="text-white text-lg font-bold mb-1">
            Update Available v{release.version}
          </Text>
          <Text className="text-zinc-400 text-xs text-center mb-5">
            A new version of Portl is ready. Update now to access the latest features and security improvements.
          </Text>

          {/* Package Info Badge */}
          <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Ionicons name="shield-checkmark" size={14} color="#f59e0b" />
            <Text className="text-amber-400 text-xs font-mono">
              Verified Package · {release.sizeFormatted}
            </Text>
          </View>

          {/* Error Message */}
          {errorMsg && (
            <Text className="text-red-400 text-xs text-center mb-4">
              {errorMsg}
            </Text>
          )}

          {/* Action Button / Progress Bar */}
          {isDownloading ? (
            <View className="w-full bg-zinc-900 rounded-full h-11 overflow-hidden justify-center items-center relative border border-zinc-800">
              <View
                className="absolute left-0 top-0 bottom-0 bg-amber-500 rounded-full"
                style={{ width: `${downloadProgress || 0}%` }}
              />
              <View className="flex-row items-center gap-2 z-10">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-white font-bold text-xs font-mono">
                  {downloadProgress ?? 0}% Downloading...
                </Text>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={handleStartUpdate}
              className="w-full py-3.5 rounded-full bg-amber-500 active:bg-amber-400 justify-center items-center shadow-lg shadow-amber-500/20"
            >
              <Text className="text-zinc-950 font-bold text-xs">Update Now</Text>
            </Pressable>
          )}

        </View>
      </View>
    </Modal>
  );
}
