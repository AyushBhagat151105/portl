import {
  makeResponseSchema,
  makeArrayResponseSchema,
  noticeSchema,
  pollSchema,
  complaintSchema,
  amenitySchema,
  staffSchema,
  notificationSchema,
  membershipSchema,
} from "../schemas";

export const commonPaths = {
  "/api/society/notices": {
    get: {
      tags: ["Notices"],
      summary: "Get notices list",
      description: "Retrieves notice board updates. Open to all roles.",
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: makeArrayResponseSchema(noticeSchema)
            }
          }
        },
      },
    },
  },
  "/api/society/polls": {
    get: {
      tags: ["Polls"],
      summary: "List community polls",
      description: "Retrieves polls in the society with option vote percentages and whether the user has voted. Requires Resident or Admin roles.",
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: makeArrayResponseSchema(pollSchema)
            }
          }
        },
      },
    },
  },
  "/api/society/complaints": {
    get: {
      tags: ["Complaints"],
      summary: "List complaints tickets",
      description: "Fetches tickets. Residents see only their raised complaints, while Admins retrieve all tickets. Requires Resident or Admin roles.",
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: makeArrayResponseSchema(complaintSchema)
            }
          }
        },
      },
    },
  },
  "/api/society/amenities": {
    get: {
      tags: ["Amenities"],
      summary: "Get amenities list",
      description: "Fetches amenities and bookings logs. Requires Resident or Admin roles.",
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: makeArrayResponseSchema(amenitySchema)
            }
          }
        },
      },
    },
  },
  "/api/society/staff": {
    get: {
      tags: ["Staff"],
      summary: "Get staff directory",
      description: "Retrieves contacts of society service providers. Open to all roles.",
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: makeArrayResponseSchema(staffSchema)
            }
          }
        },
      },
    },
  },
  "/api/notifications/register-token": {
    post: {
      tags: ["Notifications"],
      summary: "Register client Expo Push token",
      description: "Links user device Expo token for remote push dispatching. Open to all roles.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                token: { type: "string", example: "ExponentPushToken[xxxx]" },
              },
              required: ["token"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Push token registered successfully",
          content: {
            "application/json": {
              schema: makeResponseSchema({
                type: "object",
                properties: {
                  registered: { type: "boolean", example: true }
                }
              })
            }
          }
        },
      },
    },
  },
  "/api/notifications": {
    get: {
      tags: ["Notifications"],
      summary: "Get in-app notification logs",
      description: "Retrieves user notification history logs. Open to all roles.",
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: makeArrayResponseSchema(notificationSchema)
            }
          }
        },
      },
    },
  },
  "/api/notifications/{id}/read": {
    patch: {
      tags: ["Notifications"],
      summary: "Mark notification as read",
      description: "Updates notification status to read. Open to all roles.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Notification ID",
        },
      ],
      responses: {
        200: {
          description: "Notification marked as read",
          content: {
            "application/json": {
              schema: makeResponseSchema(notificationSchema)
            }
          }
        },
      },
    },
  },
  "/api/society/my-membership": {
    get: {
      tags: ["Setup"],
      summary: "Get current user society membership",
      description: "Checks if user belongs to any society and returns their role status.",
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: makeResponseSchema(membershipSchema)
            }
          }
        },
      },
    },
  },
  "/api/society/join": {
    post: {
      tags: ["Setup"],
      summary: "Join a society by slug/code",
      description: "Associates the user with the target society and requests a role.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                slug: { type: "string", example: "sunshine-apts" },
                role: { type: "string", enum: ["resident", "guard"], example: "resident" },
              },
              required: ["slug", "role"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Joined society successfully",
          content: {
            "application/json": {
              schema: makeResponseSchema(membershipSchema)
            }
          }
        },
        400: { description: "Validation inputs failed" },
      },
    },
  },
  "/api/society/towers": {
    get: {
      tags: ["Setup"],
      summary: "List all towers and flats structure",
      description: "Retrieves the structural configuration of towers and flat nodes in the society. Requires Admin or Resident role.",
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: makeArrayResponseSchema({
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  flats: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        number: { type: "string" }
                      }
                    }
                  }
                }
              })
            }
          }
        },
      },
    },
  },
  "/api/society/media/signature": {
    "get": {
      "tags": ["Media"],
      "summary": "Get Cloudinary upload signature",
      "description": "Generates a dynamic secure upload signature for client-side uploads. Requires Resident or Admin roles.",
      "parameters": [
        { "name": "folder", "in": "query", "required": true, "schema": { "type": "string", "enum": ["profiles", "documents"] } },
        { "name": "type", "in": "query", "required": true, "schema": { "type": "string", "enum": ["public", "private"] } }
      ],
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": makeResponseSchema({
                "type": "object",
                "properties": {
                  "signature": { "type": "string" },
                  "timestamp": { "type": "number" },
                  "apiKey": { "type": "string" },
                  "cloudName": { "type": "string" },
                  "folder": { "type": "string" },
                  "type": { "type": "string" }
                }
              })
            }
          }
        }
      }
    }
  },
  "/api/society/media/aadhar-url": {
    "get": {
      "tags": ["Media"],
      "summary": "Get own secure Aadhar view URL",
      "description": "Retrieves a short-lived, signed download URL for the logged-in resident's own Aadhar card attachment. Requires Resident role.",
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": makeResponseSchema({
                "type": "object",
                "properties": {
                  "url": { "type": "string" }
                }
              })
            }
          }
        }
      }
    }
  },
  "/api/society/media/avatar": {
    "delete": {
      "tags": ["Media"],
      "summary": "Delete own profile photo",
      "description": "Deletes the logged-in resident's own profile photo from Cloudinary and database. Requires Resident role.",
      "responses": {
        "200": {
          "description": "Avatar removed successfully"
        }
      }
    }
  },
  "/api/society/media/aadhar": {
    "delete": {
      "tags": ["Media"],
      "summary": "Delete own Aadhar attachment",
      "description": "Deletes the logged-in resident's own private Aadhar document attachment from Cloudinary and database. Requires Resident role.",
      "responses": {
        "200": {
          "description": "Aadhar attachment removed successfully"
        }
      }
    }
  }
};
