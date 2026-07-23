import { Hono } from "hono";
import fs from "node:fs";
import { OtaService } from "../services/ota.service";

const router = new Hono();

router.get("/manifest", (c) => {
  const protocolVersion = c.req.header("expo-protocol-version") || "1";
  const runtimeVersion = c.req.header("expo-runtime-version") || "1.0.0";

  const manifest = OtaService.getLatestManifest(protocolVersion, runtimeVersion);
  if (!manifest) {
    return c.json({
      error: "No OTA update manifest found on server",
      code: "NOT_FOUND",
    }, 404);
  }

  c.header("expo-protocol-version", "1");
  c.header("expo-sfv-version", "0");
  c.header("content-type", "application/json");

  return c.json(manifest);
});

router.get("/assets/:filename", (c) => {
  const filename = c.req.param("filename");
  const filePath = OtaService.getAssetFilePath(filename);

  if (!filePath) {
    return c.json({
      error: "Asset file not found on server disk",
      code: "NOT_FOUND",
    }, 404);
  }

  const fileStream = fs.createReadStream(filePath);
  return c.body(fileStream as any);
});

export default router;
