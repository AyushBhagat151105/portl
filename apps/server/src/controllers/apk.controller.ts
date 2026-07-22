import type { Context } from "hono";
import { stream } from "hono/streaming";
import { ApkService } from "../services/apk.service";
import { successResponse, errorResponse } from "../lib/api-response";

export class ApkController {
  static async getLatestRelease(c: Context): Promise<Response> {
    try {
      const metadata = await ApkService.getLatestApkMetadata();
      return successResponse(c, metadata);
    } catch (err: any) {
      return errorResponse(c, err.message || "Failed to retrieve APK metadata", "INTERNAL_ERROR", 500);
    }
  }

  static async downloadApk(c: Context): Promise<Response> {
    try {
      const { readStream, filename, sizeBytes } = await ApkService.getApkFileStream();

      c.header("Content-Type", "application/vnd.android.package-archive");
      c.header("Content-Disposition", `attachment; filename="${filename}"`);
      c.header("Content-Length", sizeBytes.toString());

      return stream(c, async (streamWriter) => {
        for await (const chunk of readStream) {
          await streamWriter.write(chunk);
        }
      });
    } catch (err: any) {
      return errorResponse(c, "APK binary file not available on server", "NOT_FOUND", 404);
    }
  }
}
