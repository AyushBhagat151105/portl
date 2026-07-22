import { Hono } from "hono";
import { ApkController } from "../controllers/apk.controller";

const router = new Hono();

// GET /api/apk/latest - Returns JSON metadata (version, file size, SHA-256 hash, release date)
router.get("/latest", ApkController.getLatestRelease);

// GET /api/apk/download - Direct stream of portl.apk package
router.get("/download", ApkController.downloadApk);

export default router;
