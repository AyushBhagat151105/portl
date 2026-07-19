import {
  makeResponseSchema,
  makeArrayResponseSchema,
  visitorSchema,
} from "../schemas";

export const guardPaths = {
  "/api/society/search-residents": {
    get: {
      tags: ["Residents"],
      summary: "Search residents registry",
      description: "Searches users who reside in flats belonging to this society. Requires Guard or Admin roles.",
      parameters: [
        {
          name: "search",
          in: "query",
          description: "Keyword matching resident name or email",
          required: false,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string" },
                        image: { type: "string", nullable: true },
                        flats: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              number: { type: "string" },
                              tower: {
                                type: "object",
                                properties: { name: { type: "string" } },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/society/visitors": {
    post: {
      tags: ["Visitors"],
      summary: "Register new visitor entry at gate",
      description: "Initiates a gate request for a visitor. Sets status to PENDING and notifications are sent to the target flat residents. Requires Guard role.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "John Doe" },
                phone: { type: "string", example: "9876543210" },
                purpose: { type: "string", example: "Amazon Delivery" },
                type: { type: "string", enum: ["GUEST", "DELIVERY", "CAB", "STAFF"], example: "DELIVERY" },
                flatId: { type: "string", example: "uuid-of-flat-101" },
              },
              required: ["name", "phone", "type", "flatId"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Visitor registered successfully, status PENDING",
          content: {
            "application/json": {
              schema: makeResponseSchema(visitorSchema)
            }
          }
        },
        400: { description: "Validation inputs failed" },
      },
    },
  },
  "/api/society/visitors/verify-code": {
    post: {
      tags: ["Visitors"],
      summary: "Check-in a guest using a pre-approved passcode",
      description: "Validates a 6-digit passcode. If valid, changes visitor status to APPROVED and records check-in timestamp. Requires Guard role.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                code: { type: "string", example: "123456" },
              },
              required: ["code"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Passcode verified, visitor checked in",
          content: {
            "application/json": {
              schema: makeResponseSchema(visitorSchema)
            }
          }
        },
        404: { description: "Invalid passcode or guest already checked in" },
      },
    },
  },
  "/api/society/visitors/{id}/exit": {
    patch: {
      tags: ["Visitors"],
      summary: "Mark visitor exit at the gate",
      description: "Logs the checkout timestamp and sets status to EXITED. Requires Guard role.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Visitor ID",
        },
      ],
      responses: {
        200: {
          description: "Visitor marked as checked out",
          content: {
            "application/json": {
              schema: makeResponseSchema(visitorSchema)
            }
          }
        },
        404: { description: "Visitor log entry not found" },
      },
    },
  },
  "/api/society/visitors/active": {
    get: {
      tags: ["Visitors"],
      summary: "List all active logs inside society",
      description: "Fetches visitors inside the gate (status PENDING or APPROVED). Requires Guard or Admin roles.",
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: makeArrayResponseSchema(visitorSchema)
            }
          }
        },
      },
    },
  },
  "/api/society/visitors/history": {
    get: {
      tags: ["Visitors"],
      summary: "Get visitor logs checkout history",
      description: "Fetches historical records (EXITED or REJECTED logs). Requires Guard or Admin role.",
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: makeArrayResponseSchema(visitorSchema)
            }
          }
        },
      },
    },
  }
};
