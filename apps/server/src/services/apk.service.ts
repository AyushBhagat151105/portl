import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export class ApkService {
  private static APK_DIR = path.join(process.cwd(), "uploads");
  private static APK_PATH = path.join(process.cwd(), "uploads", "portl.apk");

  static async getLatestApkMetadata() {
    if (!fs.existsSync(this.APK_DIR)) {
      fs.mkdirSync(this.APK_DIR, { recursive: true });
    }

    if (!fs.existsSync(this.APK_PATH)) {
      return {
        version: "1.0.0",
        filename: "portl.apk",
        downloadUrl: "https://portl-api.ayushbhagat.com/api/apk/download",
        sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
        sizeBytes: 44883920,
        sizeFormatted: "42.8 MB",
        releasedAt: new Date().toISOString(),
        isAvailable: false,
      };
    }

    const stats = fs.statSync(this.APK_PATH);
    const fileBuffer = fs.readFileSync(this.APK_PATH);
    
    const sha256 = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const sizeBytes = stats.size;
    const sizeFormatted = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    const version = process.env.APK_VERSION || "1.0.0";

    return {
      version,
      filename: "portl.apk",
      downloadUrl: "https://portl-api.ayushbhagat.com/api/apk/download",
      sha256,
      sizeBytes,
      sizeFormatted,
      releasedAt: stats.mtime.toISOString(),
      isAvailable: true,
    };
  }

  static async getApkFileStream() {
    if (!fs.existsSync(this.APK_PATH)) {
      throw new Error("APK file not found on server disk");
    }

    const stats = fs.statSync(this.APK_PATH);
    const readStream = fs.createReadStream(this.APK_PATH);

    return {
      readStream,
      filename: "portl.apk",
      sizeBytes: stats.size,
    };
  }
}
