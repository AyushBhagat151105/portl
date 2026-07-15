const makeResponseSchema = (dataSchema: any) => ({
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    data: dataSchema,
  },
});

const makeArrayResponseSchema = (itemSchema: any) =>
  makeResponseSchema({
    type: "array",
    items: itemSchema,
  });

const successStatusSchema = makeResponseSchema({
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
  },
});

const visitorSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "vis-123" },
    name: { type: "string", example: "John Doe" },
    phone: { type: "string", example: "9876543210" },
    purpose: { type: "string", example: "Amazon Delivery" },
    type: { type: "string", enum: ["GUEST", "DELIVERY", "CAB", "STAFF"], example: "DELIVERY" },
    status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED", "EXITED"], example: "PENDING" },
    flatId: { type: "string", example: "flat-101" },
    registeredById: { type: "string", example: "user-guard-id" },
    organizationId: { type: "string", example: "org-456" },
    preApprovedCode: { type: "string", nullable: true, example: "123456" },
    createdAt: { type: "string", format: "date-time", example: "2026-07-15T12:00:00Z" },
    updatedAt: { type: "string", format: "date-time", example: "2026-07-15T12:05:00Z" },
  },
};

const noticeSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "not-123" },
    title: { type: "string", example: "Water Supply Notice" },
    content: { type: "string", example: "Water supply will be offline tomorrow for maintenance." },
    authorId: { type: "string", example: "admin-id" },
    organizationId: { type: "string", example: "org-456" },
    createdAt: { type: "string", format: "date-time" },
  },
};

const pollSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "poll-123" },
    question: { type: "string", example: "Allow pets on lawn?" },
    options: {
      type: "array",
      items: { type: "string" },
      example: ["Yes", "No"],
    },
    organizationId: { type: "string" },
    createdAt: { type: "string" },
  },
};

const complaintSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "comp-123" },
    title: { type: "string", example: "Water Leakage" },
    description: { type: "string", example: "Main kitchen pipe leakage" },
    category: { type: "string", enum: ["PLUMBING", "ELECTRICAL", "SECURITY", "CLEANLINESS", "OTHERS"], example: "PLUMBING" },
    status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "RESOLVED"], example: "PENDING" },
    flatId: { type: "string", nullable: true },
    raisedById: { type: "string" },
    organizationId: { type: "string" },
    createdAt: { type: "string" },
  },
};

const amenitySchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "am-123" },
    name: { type: "string", example: "Tennis Court" },
    description: { type: "string", example: "Synthetic grass" },
    location: { type: "string", example: "Ground C" },
    capacity: { type: "number", example: 4 },
    organizationId: { type: "string" },
  },
};

const bookingSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "book-123" },
    amenityId: { type: "string" },
    userId: { type: "string" },
    date: { type: "string", example: "2026-07-15" },
    timeslot: { type: "string", example: "04:00 PM - 06:00 PM" },
    createdAt: { type: "string" },
  },
};

const staffSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "st-123" },
    name: { type: "string", example: "Ram Singh" },
    phone: { type: "string", example: "9988776655" },
    role: { type: "string", example: "PLUMBER" },
    code: { type: "string", nullable: true },
    organizationId: { type: "string" },
  },
};

const notificationSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "notif-123" },
    userId: { type: "string" },
    title: { type: "string", example: "Gate Access Request" },
    body: { type: "string", example: "John Doe is requesting entry" },
    type: { type: "string", example: "GATE_CALL" },
    status: { type: "string", example: "UNREAD" },
    data: { type: "string", nullable: true },
    createdAt: { type: "string" },
  },
};

const membershipSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "memb-123" },
    userId: { type: "string" },
    organizationId: { type: "string" },
    role: { type: "string", example: "resident" },
    status: { type: "string", example: "approved" },
  },
};

const dueSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "due-123" },
    flatId: { type: "string" },
    amount: { type: "number", example: 2500 },
    month: { type: "string", example: "July 2026" },
    status: { type: "string", enum: ["PENDING", "PAID"], example: "PENDING" },
    dueDate: { type: "string", example: "2026-07-31" },
    paidAt: { type: "string", nullable: true },
    razorpayOrderId: { type: "string", nullable: true },
    razorpayPaymentId: { type: "string", nullable: true },
    organizationId: { type: "string" },
    createdAt: { type: "string" },
  },
};

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
    { name: "Dues", description: "Maintenance dues generation and Razorpay payment integrations" },
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
          201: {
            description: "Created towers and flats successfully",
            content: {
              "application/json": {
                schema: makeResponseSchema({
                  type: "object",
                  properties: {
                    towersCreated: { type: "number", example: 2 },
                    flatsCreated: { type: "number", example: 24 }
                  }
                })
              }
            }
          },
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
          201: {
            description: "Notice published successfully",
            content: {
              "application/json": {
                schema: makeResponseSchema(noticeSchema)
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
          201: {
            description: "Poll created successfully",
            content: {
              "application/json": {
                schema: makeResponseSchema(pollSchema)
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
          200: {
            description: "Complaint ticket status updated",
            content: {
              "application/json": {
                schema: makeResponseSchema(complaintSchema)
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
          201: {
            description: "Created successfully",
            content: {
              "application/json": {
                schema: makeResponseSchema(amenitySchema)
              }
            }
          },
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
          201: {
            description: "Staff provider added successfully",
            content: {
              "application/json": {
                schema: makeResponseSchema(staffSchema)
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
          200: {
            description: "Deleted successfully",
            content: {
              "application/json": {
                schema: makeResponseSchema({
                  type: "object",
                  properties: {
                    deleted: { type: "boolean", example: true }
                  }
                })
              }
            }
          },
        },
      },
    },
    "/api/society/members": {
      get: {
        tags: ["Setup"],
        summary: "List all society members with flats",
        description: "Retrieves list of all members and their active flat assignments. Requires Admin role.",
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: makeArrayResponseSchema({
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    userId: { type: "string" },
                    role: { type: "string" },
                    user: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        email: { type: "string" }
                      }
                    },
                    flats: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          number: { type: "string" },
                          tower: {
                            type: "object",
                            properties: {
                              name: { type: "string" }
                            }
                          }
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
          200: {
            description: "Assigned flat successfully",
            content: {
              "application/json": {
                schema: successStatusSchema
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
      }
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
      }
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
          }
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
      }
    },
    "/api/society/admin/dues": {
      get: {
        tags: ["Dues"],
        summary: "Get all maintenance dues logs",
        description: "Retrieves all society flat maintenance bills logs. Requires Admin role.",
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
      }
    },
    "/api/society/admin/dues/generate": {
      post: {
        tags: ["Dues"],
        summary: "Generate bills for all flats",
        description: "Creates pending maintenance dues for all registered flats and notifies residents. Requires Admin role.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  amount: { type: "number", example: 2500 },
                  month: { type: "string", example: "July 2026" },
                  dueDate: { type: "string", example: "2026-07-31" }
                },
                required: ["amount", "month", "dueDate"]
              }
            }
          }
        },
        responses: {
          201: {
            description: "Dues generated successfully",
            content: {
              "application/json": {
                schema: makeResponseSchema({
                  type: "object",
                  properties: {
                    generatedCount: { type: "number", example: 24 }
                  }
                })
              }
            }
          }
        }
      }
    },
    "/api/society/admin/dues/{id}/mark-paid": {
      patch: {
        tags: ["Dues"],
        summary: "Mark bill paid offline",
        description: "Manually reconciles pending dues paid offline via cash/cheque. Requires Admin role.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: {
            description: "Marked paid successfully",
            content: {
              "application/json": {
                schema: makeResponseSchema(dueSchema)
              }
            }
          }
        }
      }
    },
  },
};
