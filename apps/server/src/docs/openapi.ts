export const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Portl API Reference",
    version: "1.0.0",
    description: "Documentation for the Portl Smart Society Operations Platform APIs. Guard, Resident, and Admin specific operations.",
  },
  servers: [
    {
      url: "http://192.168.31.93:3000",
      description: "Development Server",
    },
  ],
  tags: [
    { name: "Setup", description: "Admin operations to initialize society structures" },
    { name: "Residents", description: "Resident search for guard operations" },
    { name: "Visitors", description: "Visitor check-ins, pre-approvals, entries, exits and gate calls" },
    { name: "Notices", description: "Society Notice board updates" },
    { name: "Polls", description: "Interactive community voting polls" },
    { name: "Complaints", description: "Helpdesk support complaint tickets" },
    { name: "Amenities", description: "Amenity schedules and reservations" },
    { name: "Staff", description: "Society staff and service provider registry" },
    { name: "Notifications", description: "Device push tokens registration and in-app alert history logs" },
  ],
  paths: {
    "/api/society/setup": {
      post: {
        tags: ["Setup"],
        summary: "Set up Society structure (Towers & Flats)",
        description: "Creates towers and flats for a society. Requires Admin role.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  towers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", example: "Tower A" },
                        flats: {
                          type: "array",
                          items: { type: "string" },
                          example: ["101", "102", "103"],
                        },
                      },
                      required: ["name", "flats"],
                    },
                  },
                },
                required: ["towers"],
              },
            },
          },
        },
        responses: {
          201: { description: "Created towers and flats successfully" },
          400: { description: "Invalid validation inputs" },
          403: { description: "Forbidden - Requires Admin role" },
        },
      },
    },
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
          201: { description: "Visitor registered successfully, status PENDING" },
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
          200: { description: "Passcode verified, visitor checked in" },
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
          200: { description: "Visitor marked as checked out" },
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
          200: { description: "Success" },
        },
      },
    },
    "/api/society/visitors/pending": {
      get: {
        tags: ["Visitors"],
        summary: "List pending gate calls for Resident",
        description: "Fetches pending visitor requests targetting the logged-in resident's flats. Requires Resident role.",
        responses: {
          200: { description: "Success" },
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
          200: { description: "Response updated successfully" },
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
          201: { description: "Guest pass pre-approved successfully" },
        },
      },
    },
    "/api/society/notices": {
      get: {
        tags: ["Notices"],
        summary: "Get notices list",
        description: "Retrieves notice board updates. Open to all roles.",
        responses: {
          200: { description: "Success" },
        },
      },
      post: {
        tags: ["Notices"],
        summary: "Publish a notice",
        description: "Creates a new notice and notifies all residents. Requires Admin role.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Water Supply Shutdown Notice" },
                  content: { type: "string", example: "Water supply will be offline tomorrow from 10 AM to 1 PM for maintenance." },
                },
                required: ["title", "content"],
              },
            },
          },
        },
        responses: {
          201: { description: "Notice published successfully" },
        },
      },
    },
    "/api/society/polls": {
      get: {
        tags: ["Polls"],
        summary: "List community polls",
        description: "Retrieves polls in the society with option vote percentages and whether the user has voted. Requires Resident or Admin roles.",
        responses: {
          200: { description: "Success" },
        },
      },
      post: {
        tags: ["Polls"],
        summary: "Create a poll",
        description: "Creates a new voting poll. Requires Admin role.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  question: { type: "string", example: "Should we allow vehicles on the lawn?" },
                  options: {
                    type: "array",
                    items: { type: "string" },
                    example: ["Yes", "No", "Undecided"],
                  },
                },
                required: ["question", "options"],
              },
            },
          },
        },
        responses: {
          201: { description: "Poll created successfully" },
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
          201: { description: "Vote logged successfully" },
          409: { description: "Conflict - User has already voted" },
        },
      },
    },
    "/api/society/complaints": {
      get: {
        tags: ["Complaints"],
        summary: "List complaints tickets",
        description: "Fetches tickets. Residents see only their raised complaints, while Admins retrieve all tickets. Requires Resident or Admin roles.",
        responses: {
          200: { description: "Success" },
        },
      },
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
                },
                required: ["title", "description", "category"],
              },
            },
          },
        },
        responses: {
          201: { description: "Complaint raised successfully" },
        },
      },
    },
    "/api/society/complaints/{id}": {
      patch: {
        tags: ["Complaints"],
        summary: "Update ticket status",
        description: "Changes the status of a complaint (PENDING, IN_PROGRESS, RESOLVED) and sends a notification update. Requires Admin role.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Complaint ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "RESOLVED"], example: "RESOLVED" },
                },
                required: ["status"],
              },
            },
          },
        },
        responses: {
          200: { description: "Complaint ticket status updated" },
        },
      },
    },
    "/api/society/amenities": {
      get: {
        tags: ["Amenities"],
        summary: "Get amenities list",
        description: "Fetches amenities and bookings logs. Requires Resident or Admin roles.",
        responses: {
          200: { description: "Success" },
        },
      },
      post: {
        tags: ["Amenities"],
        summary: "Create a new amenity",
        description: "Allows admins to initialize a new amenity. Requires Admin role.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Tennis Court" },
                  description: { type: "string", example: "Synthetic grass court" },
                  location: { type: "string", example: "Block C Ground" },
                  capacity: { type: "number", example: 4 },
                },
                required: ["name"],
              },
            },
          },
        },
        responses: {
          201: { description: "Created successfully" },
        },
      },
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
          201: { description: "Timeslot reserved successfully" },
          409: { description: "Conflict - Timeslot already reserved" },
        },
      },
    },
    "/api/society/staff": {
      get: {
        tags: ["Staff"],
        summary: "Get staff directory",
        description: "Retrieves contacts of society service providers. Open to all roles.",
        responses: {
          200: { description: "Success" },
        },
      },
      post: {
        tags: ["Staff"],
        summary: "Add a staff provider",
        description: "Creates a new staff/service provider record. Requires Admin role.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Ram Singh" },
                  phone: { type: "string", example: "9988776655" },
                  role: { type: "string", example: "PLUMBER" },
                  code: { type: "string", example: "B-101" },
                },
                required: ["name", "phone", "role"],
              },
            },
          },
        },
        responses: {
          201: { description: "Staff provider added successfully" },
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
          200: { description: "Push token registered successfully" },
        },
      },
    },
    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Get in-app notification logs",
        description: "Retrieves user notification history logs. Open to all roles.",
        responses: {
          200: { description: "Success" },
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
          200: { description: "Notification marked as read" },
        },
      },
    },
    "/api/society/my-membership": {
      get: {
        tags: ["Setup"],
        summary: "Get current user society membership",
        description: "Checks if user belongs to any society and returns their role status.",
        responses: {
          200: { description: "Success" },
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
          201: { description: "Joined society successfully" },
          400: { description: "Validation inputs failed" },
        },
      },
    },
    "/api/society/staff/{id}": {
      delete: {
        tags: ["Staff"],
        summary: "Remove staff provider",
        description: "Deletes a staff provider record. Requires Admin role.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Staff ID",
          },
        ],
        responses: {
          200: { description: "Deleted successfully" },
        },
      },
    },
    "/api/society/members": {
      get: {
        tags: ["Setup"],
        summary: "List all society members with flats",
        description: "Retrieves list of all members and their active flat assignments. Requires Admin role.",
        responses: {
          200: { description: "Success" },
        },
      },
    },
    "/api/society/towers": {
      get: {
        tags: ["Setup"],
        summary: "List all towers and flats structure",
        description: "Retrieves the structural configuration of towers and flat nodes in the society. Requires Admin or Resident role.",
        responses: {
          200: { description: "Success" },
        },
      },
    },
    "/api/society/residents/assign-flat": {
      patch: {
        tags: ["Setup"],
        summary: "Assign a resident to flat",
        description: "Links a member to a flat structure. Requires Admin role.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  userId: { type: "string", example: "user-id-here" },
                  flatId: { type: "string", example: "flat-id-here" },
                },
                required: ["userId", "flatId"],
              },
            },
          },
        },
        responses: {
          200: { description: "Assigned flat successfully" },
        },
      },
    },
    "/api/society/visitors/history": {
      get: {
        tags: ["Visitors"],
        summary: "Get visitor logs checkout history",
        description: "Fetches historical records (EXITED or REJECTED logs). Requires Guard or Admin role.",
        responses: {
          200: { description: "Success" },
        },
      },
    },
  },
};
