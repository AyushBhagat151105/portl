import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { api } from "@/lib/api";

export interface ApkReleaseMetadata {
  version: string;
  filename: string;
  downloadUrl: string;
  sha256: string;
  sizeBytes: number;
  sizeFormatted: string;
  releasedAt: string;
  isAvailable: boolean;
  isUpdateRequired: boolean;
}

export function useUpdateCheck() {
  const currentVersion = Constants.expoConfig?.version || "1.0.0";

  return useQuery<ApkReleaseMetadata>({
    queryKey: ["apk-update-check", currentVersion],
    queryFn: async () => {
      const res = await api.get("/apk/latest");
      const release = res.data?.data || res.data;

      const isNewer = release?.version !== currentVersion && Boolean(release?.isAvailable);
      return {
        ...release,
        isUpdateRequired: isNewer,
      };
    },
    staleTime: 1000 * 60 * 5, // Check for new APK release every 5 minutes
  });
}
