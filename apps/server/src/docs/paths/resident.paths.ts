import {
  makeResponseSchema,
  makeArrayResponseSchema,
  successStatusSchema,
  visitorSchema,
  complaintSchema,
  dueSchema,
  vehicleSchema,
  bookingSchema,
} from "../schemas";

export const residentPaths = {
  "/api/society/visitors/pending": {
    get: {
      tags: ["Visitors"],
      summary: "List pending gate calls for Resident",
      description: "Fetches pending visitor requests targetting the logged-in resident's flats. Requires Resident role.",
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
  "/api/society/visitors/{id}/respond": {
    patch: {
      tags: ["Visitors"],
      summary: "Approve or Deny entry request",
      description: "Approves or rejects a visitor. Sets status to APPROVED or REJECTED. Requires Resident role.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Visitor ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["APPROVED", "REJECTED"], example: "APPROVED" },
              },
              required: ["status"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Response updated successfully",
          content: {
            "application/json": {
              schema: makeResponseSchema(visitorSchema)
            }
          }
        },
      },
    },
  },
  "/api/society/visitors/pre-approve": {
    post: {
      tags: ["Visitors"],
      summary: "Generate pre-approved guest pass",
      description: "Creates a pre-approved guest entry generating a 6-digit passcode. Requires Resident role.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "Guest Name" },
                phone: { type: "string", example: "9988776655" },
                purpose: { type: "string", example: "Family Dinner" },
                flatId: { type: "string", example: "uuid-of-flat" },
              },
              required: ["name", "phone", "flatId"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Guest pass pre-approved successfully",
          content: {
            "application/json": {
              schema: makeResponseSchema(visitorSchema)
            }
          }
        },
      },
    },
  },
  "/api/society/polls/{id}/vote": {
    post: {
      tags: ["Polls"],
      summary: "Cast a vote on a poll",
      description: "Votes on a specific option. Restricts voting to once per user per poll. Requires Resident role.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Poll ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                optionIndex: { type: "number", example: 1 },
              },
              required: ["optionIndex"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Vote logged successfully",
          content: {
            "application/json": {
              schema: successStatusSchema
            }
          }
        },
        409: { description: "Conflict - User has already voted" },
      },
    },
  },
  "/api/society/resident/complaints": {
    post: {
      tags: ["Complaints"],
      summary: "Raise a helpdesk complaint",
      description: "Submits a new helpdesk complaint. Requires Resident role.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string", example: "Water leakage in washroom" },
                description: { type: "string", example: "Continuous leakage observed from the main tap." },
                category: { type: "string", enum: ["PLUMBING", "ELECTRICAL", "SECURITY", "CLEANLINESS", "OTHERS"], example: "PLUMBING" },
                flatId: { type: "string", example: "uuid-of-flat" },
                images: { type: "array", items: { type: "string" }, example: ["https://res.cloudinary.com/complaints/1.jpg"] },
                imagePublicIds: { type: "array", items: { type: "string" }, example: ["complaints/1_public"] },
              },
              required: ["title", "description", "category"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Complaint raised successfully",
          content: {
            "application/json": {
              schema: makeResponseSchema(complaintSchema)
            }
          }
        },
      },
    },
  },
  "/api/society/resident/dues": {
    get: {
      tags: ["Dues"],
      summary: "Get resident maintenance dues",
      description: "Retrieves outstanding and history bills for the logged-in resident's flats. Requires Resident role.",
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: makeArrayResponseSchema(dueSchema)
            }
          }
        }
      }
    },
  },
  "/api/society/resident/dues/{id}/order": {
    post: {
      tags: ["Dues"],
      summary: "Create Razorpay Order ID",
      description: "Generates Razorpay transaction order ID for due billing. Requires Resident role.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        201: {
          description: "Order created successfully",
          content: {
            "application/json": {
              schema: makeResponseSchema({
                type: "object",
                properties: {
                  keyId: { type: "string", example: "rzp_test_xxxx" },
                  orderId: { type: "string", example: "order_xyz123" },
                  amount: { type: "number", example: 250000 },
                  currency: { type: "string", example: "INR" }
                }
              })
            }
          }
        },
        400: { description: "Due already paid or invalid" }
      }
    },
  },
  "/api/society/resident/dues/{id}/verify-payment": {
    post: {
      tags: ["Dues"],
      summary: "Verify Razorpay Payment Signature",
      description: "Verifies HMAC signature returned by Razorpay Checkout and marks due as PAID. Requires Resident role.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                razorpay_payment_id: { type: "string" },
                razorpay_order_id: { type: "string" },
                razorpay_signature: { type: "string" }
              },
              required: ["razorpay_payment_id", "razorpay_order_id", "razorpay_signature"]
            }
          }
        },
      },
      responses: {
        200: {
          description: "Payment verified and saved",
          content: {
            "application/json": {
              schema: makeResponseSchema(dueSchema)
            }
          }
        },
        400: { description: "Invalid payment signature" }
      }
    },
  },
  "/api/society/resident/profile": {
    "get": {
      "tags": ["Residents"],
      "summary": "Get logged-in resident profile details",
      "description": "Fetches detailed resident information with Aadhar numbers masked for security. Requires Resident role.",
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": makeResponseSchema({
                "type": "object",
                "properties": {
                  "id": { "type": "string" },
                  "name": { "type": "string" },
                  "phone": { "type": "string" },
                  "email": { "type": "string" },
                  "aadharNumber": { "type": "string", "example": "XXXX-XXXX-1234" },
                  "avatar": { "type": "string", "nullable": true },
                  "vehicles": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "id": { "type": "string" },
                        "plateNumber": { "type": "string" }
                      }
                    }
                  }
                }
              })
            }
          }
        }
      }
    },
    "put": {
      "tags": ["Residents"],
      "summary": "Update resident profile details",
      "description": "Updates profile details, including name, phone, aadharNumber, avatar, and active registered vehicle plates. Requires Resident role.",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "name": { "type": "string" },
                "phone": { "type": "string" },
                "aadharNumber": { "type": "string", "example": "123412341234" },
                "avatar": { "type": "string" },
                "vehicles": {
                  "type": "array",
                  "items": { "type": "string" },
                  "example": ["MH12AB1234"]
                }
              }
            }
          }
        },
      },
      "responses": {
        "200": {
          "description": "Profile updated successfully",
          "content": {
            "application/json": {
              "schema": successStatusSchema
            }
          }
        }
      }
    }
  },
  "/api/society/resident/vehicles/search": {
    "get": {
      "tags": ["Residents"],
      "summary": "Search vehicle ownership details",
      "description": "Searches for a vehicle's owner information by typing its registration plate number. Requires Resident role.",
      "parameters": [
        {
          "name": "plateNumber",
          "in": "query",
          "required": true,
          "schema": { "type": "string" }
        }
      ],
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": makeResponseSchema(vehicleSchema)
            }
          }
        },
        "404": { "description": "Vehicle plate number not registered" }
      }
    }
  },
  "/api/society/resident/vehicles/{id}/notify-blocking": {
    "post": {
      "tags": ["Residents"],
      "summary": "Report vehicle parking obstruction",
      "description": "Sends push alerts and warning emails to the owner of an obstructive vehicle. Requires Resident role.",
      "parameters": [
        { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
      ],
      "responses": {
        "200": {
          "description": "Notification dispatched successfully",
          "content": {
            "application/json": {
              "schema": successStatusSchema
            }
          }
        }
      }
    }
  },
  "/api/society/amenities/book": {
    post: {
      tags: ["Amenities"],
      summary: "Reserve an amenity timeslot",
      description: "Books a timeslot on a specific date for an amenity. Prevents double bookings. Requires Resident role.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                amenityId: { type: "string", example: "uuid-of-tennis-court" },
                date: { type: "string", format: "date", example: "2026-07-15" },
                timeslot: { type: "string", example: "04:00 PM - 06:00 PM" },
              },
              required: ["amenityId", "date", "timeslot"],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Timeslot reserved successfully",
          content: {
            "application/json": {
              schema: makeResponseSchema(bookingSchema)
            }
          }
        },
        409: { description: "Conflict - Timeslot already reserved" },
      },
    },
  }
};
