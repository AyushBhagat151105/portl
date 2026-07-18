import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { api } from "@/lib/api";
import { useToastStore } from "@/store/useToastStore";

interface UseCloudinaryUploadOptions {
  folder: string;
  type: "public" | "private";
  aspect?: [number, number];
  allowsEditing?: boolean;
  quality?: number;
}

interface UploadResult {
  url: string;
  publicId: string;
}

export function useCloudinaryUpload(options: UseCloudinaryUploadOptions) {
  const {
    folder,
    type,
    aspect,
    allowsEditing = true,
    quality = 0.8,
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToastStore();

  const upload = useCallback(async (): Promise<UploadResult | null> => {
    try {
      // 1. Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToast("Permission to access photo library is required!", "error");
        return null;
      }

      // 2. Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect,
        quality,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0]!;
      setIsUploading(true);

      // 3. Get signed upload signature from backend
      const sigRes = await api.get("/api/society/media/signature", {
        params: { folder, type },
      });
      const { signature, timestamp, apiKey, cloudName, folder: sigFolder, type: sigType } = sigRes.data.data;

      // 4. Build FormData and upload to Cloudinary
      const fileUri = asset.uri;
      const fileName = fileUri.split("/").pop() || `upload_${Date.now()}.jpg`;
      const fileType = "image/jpeg";

      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as any);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", sigFolder);
      formData.append("type", sigType);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const cloudRes = await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const secureUrl = cloudRes.data?.secure_url;
      const publicId = cloudRes.data?.public_id;

      if (secureUrl || publicId) {
        return {
          url: secureUrl || "",
          publicId: publicId || "",
        };
      }

      showToast("Upload succeeded but no URL was returned", "error");
      return null;
    } catch (err: any) {
      showToast(err.message || "Failed to upload file", "error");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [folder, type, aspect, allowsEditing, quality, showToast]);

  return { upload, isUploading };
}
