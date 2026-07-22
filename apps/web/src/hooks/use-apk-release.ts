import { useState, useEffect } from "react";

export interface ApkReleaseMetadata {
  version: string;
  filename: string;
  downloadUrl: string;
  sha256: string;
  sizeBytes: number;
  sizeFormatted: string;
  releasedAt: string;
  isAvailable: boolean;
}

const DEFAULT_METADATA: ApkReleaseMetadata = {
  version: "1.0.0",
  filename: "portl.apk",
  downloadUrl: "https://portl-api.ayushbhagat.com/api/apk/download",
  sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  sizeBytes: 44883920,
  sizeFormatted: "42.8 MB",
  releasedAt: new Date().toISOString(),
  isAvailable: true,
};

export function useApkRelease() {
  const [data, setData] = useState<ApkReleaseMetadata>(DEFAULT_METADATA);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLatestRelease() {
      try {
        const res = await fetch("https://portl-api.ayushbhagat.com/api/apk/latest");
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setData(json.data);
          }
        }
      } catch (err) {
        // Fallback gracefully to DEFAULT_METADATA on offline / CORS
        console.warn("Using default APK metadata fallback:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLatestRelease();
  }, []);

  return { data, loading };
}
