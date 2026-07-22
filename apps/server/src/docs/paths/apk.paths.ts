export const apkPaths = {
  "/api/apk/latest": {
    "get": {
      "tags": ["APK Releases"],
      "summary": "Get Latest Android APK Metadata",
      "description": "Returns the latest Android APK version, package filename, SHA-256 checksum, file size, and direct download endpoint.",
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": { "type": "boolean", "example": true },
                  "data": {
                    "type": "object",
                    "properties": {
                      "version": { "type": "string", "example": "1.0.0" },
                      "filename": { "type": "string", "example": "portl.apk" },
                      "downloadUrl": { "type": "string", "example": "https://portl-api.ayushbhagat.com/api/apk/download" },
                      "sha256": { "type": "string", "example": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08" },
                      "sizeBytes": { "type": "number", "example": 44883920 },
                      "sizeFormatted": { "type": "string", "example": "42.8 MB" },
                      "releasedAt": { "type": "string", "example": "2026-07-22T10:00:00.000Z" },
                      "isAvailable": { "type": "boolean", "example": true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "/api/apk/download": {
    "get": {
      "tags": ["APK Releases"],
      "summary": "Download Portl Android APK Package",
      "description": "Direct binary stream of the compiled portl.apk Android application package.",
      "responses": {
        "200": {
          "description": "APK Binary Stream",
          "content": {
            "application/vnd.android.package-archive": {
              "schema": {
                "type": "string",
                "format": "binary"
              }
            }
          }
        },
        "404": {
          "description": "APK File Not Available"
        }
      }
    }
  }
};
