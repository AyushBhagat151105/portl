import { v2 as cloudinary } from "cloudinary";
import { env } from "@portl/env/server";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Generates signed credentials for secure client-side uploads.
 */
export function generateUploadSignature(folder: string, type: "upload" | "authenticated") {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params: Record<string, any> = {
    timestamp,
    folder: `portl_${folder}`,
    type,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    folder: params.folder,
    type: params.type,
  };
}

/**
 * Generates an authenticated signed download URL valid for 10 minutes.
 */
export function generateSignedDownloadUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    type: "authenticated",
    sign_url: true,
    expires_at: Math.round(Date.now() / 1000) + 600, // 10 mins
    secure: true,
  });
}

/**
 * Destroys an asset stored in Cloudinary and invalidates CDN caches.
 */
export async function destroyAsset(publicId: string, isPrivate: boolean) {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      type: isPrivate ? "authenticated" : "upload",
      invalidate: true,
    });
  } catch (err) {
    console.error("Cloudinary destruction failed for publicId:", publicId, err);
    return null;
  }
}

/**
 * Extracts Cloudinary public ID from a standard secure URL.
 */
export function extractPublicId(url: string): string | null {
  try {
    if (!url) return null;
    // Handle both private (authenticated) and public (upload) paths
    const uploadIdx = url.indexOf("/upload/");
    const authIdx = url.indexOf("/authenticated/");
    
    let pathAndExt = "";
    if (uploadIdx !== -1) {
      pathAndExt = url.substring(uploadIdx + 8);
    } else if (authIdx !== -1) {
      pathAndExt = url.substring(authIdx + 15);
    } else {
      return null;
    }
    
    // Remove version prefix (e.g. v123456/) if present and file extension
    const rawPath = pathAndExt.replace(/^v\d+\//, "");
    return rawPath.substring(0, rawPath.lastIndexOf("."));
  } catch {
    return null;
  }
}
