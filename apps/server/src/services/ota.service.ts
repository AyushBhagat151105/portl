import fs from "node:fs";
import path from "node:path";

export class OtaService {
  private static UPDATES_DIR = path.join(process.cwd(), "uploads", "updates");

  static getLatestManifest(_protocolVersion: string, _runtimeVersion: string) {
    if (!fs.existsSync(this.UPDATES_DIR)) {
      fs.mkdirSync(this.UPDATES_DIR, { recursive: true });
    }

    const manifestPath = path.join(this.UPDATES_DIR, "manifest.json");
    const metadataPath = path.join(this.UPDATES_DIR, "metadata.json");

    if (fs.existsSync(manifestPath)) {
      try {
        const raw = fs.readFileSync(manifestPath, "utf-8");
        return JSON.parse(raw);
      } catch (err) {
        console.error("Error reading manifest.json:", err);
      }
    }

    if (fs.existsSync(metadataPath)) {
      try {
        const raw = fs.readFileSync(metadataPath, "utf-8");
        return JSON.parse(raw);
      } catch (err) {
        console.error("Error reading metadata.json:", err);
      }
    }

    return null;
  }

  static getAssetFilePath(filename: string) {
    // Check direct file in updates dir or in assets subfolder
    const directPath = path.join(this.UPDATES_DIR, filename);
    const subfolderPath = path.join(this.UPDATES_DIR, "assets", filename);

    if (fs.existsSync(directPath)) {
      return directPath;
    }
    if (fs.existsSync(subfolderPath)) {
      return subfolderPath;
    }

    return null;
  }
}
