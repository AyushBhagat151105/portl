import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

const masterKey = process.env.ENCRYPTION_KEY
  ? crypto.createHash("sha256").update(process.env.ENCRYPTION_KEY).digest()
  : crypto.createHash("sha256").update("dev-fallback-encryption-key-portl-32-chars").digest();

export function encryptText(text: string): string {
  if (!text) return "";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decryptText(encryptedText: string): string {
  if (!encryptedText) return "";
  try {
    const parts = encryptedText.split(":");
    const ivHex = parts[0];
    const encryptedHex = parts[1];
    if (parts.length !== 2 || !ivHex || !encryptedHex) {
      return encryptedText;
    }
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    return encryptedText;
  }
}
