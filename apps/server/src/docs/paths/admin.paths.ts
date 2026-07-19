import {
  makeResponseSchema,
  makeArrayResponseSchema,
  successStatusSchema,
  noticeSchema,
  dueSchema,
  bookingSchema,
  paymentConfigSchema,
  complaintSchema,
} from "../schemas";

export const adminPaths = {
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
  "/api/society/admin/notices": {
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
                banner: { type: "string", nullable: true, example: "https://res.cloudinary.com/banner.jpg" },
                bannerPublicId: { type: "string", nullable: true, example: "notices/banner_id" },
                endDate: { type: "string", nullable: true, example: "2026-07-20" },
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
  "/api/society/admin/notices/{id}": {
    delete: {
      tags: ["Notices"],
      summary: "Delete a notice announcement",
      description: "Deletes a notice by ID and cleans up its banner asset from Cloudinary. Requires Admin role.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Notice ID",
        },
      ],
      responses: {
        200: {
          description: "Notice deleted successfully",
          content: {
            "application/json": {
              schema: successStatusSchema
            }
          }
        },
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
        },
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
  "/api/society/admin/bookings": {
    get: {
      tags: ["Amenities"],
      summary: "List all amenity booking requests",
      description: "Fetches all pending, approved, and rejected amenity slot bookings. Requires Admin role.",
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: makeArrayResponseSchema(bookingSchema)
            }
          }
        }
      }
    }
  },
  "/api/society/admin/bookings/{id}/respond": {
    patch: {
      tags: ["Amenities"],
      summary: "Approve or reject booking request",
      description: "Allows administrative reviews to resolve pending bookings. Requires Admin role.",
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
                status: { type: "string", enum: ["APPROVED", "REJECTED"], example: "APPROVED" }
              },
              required: ["status"]
            }
          }
        },
      },
      responses: {
        200: {
          description: "Booking status updated",
          content: {
            "application/json": {
              schema: makeResponseSchema(bookingSchema)
            }
          }
        }
      }
    }
  },
  "/api/society/admin/residents": {
    post: {
      tags: ["Residents"],
      summary: "Admin manually add resident member",
      description: "Allows society admins to record a new resident contact. Requires Admin role.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                aadharNumber: { type: "string" },
                image: { type: "string" }
              },
              required: ["name", "email"]
            }
          }
        },
      },
      responses: {
        201: {
          description: "Resident added successfully",
          content: {
            "application/json": {
              schema: successStatusSchema
            }
          }
        }
      }
    }
  },
  "/api/society/admin/residents/{id}": {
    put: {
      tags: ["Residents"],
      summary: "Admin edit resident contact details",
      description: "Allows admins to modify names, email addresses, and phone records of a member. Requires Admin role.",
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
                name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                aadharNumber: { type: "string" },
                image: { type: "string" }
              }
            }
          }
        },
      },
      responses: {
        200: {
          description: "Resident details updated successfully"
        }
      }
    },
    delete: {
      tags: ["Residents"],
      summary: "Admin remove resident contact",
      description: "Deletes a resident contact record from the directory list. Requires Admin role.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        200: {
          description: "Resident removed successfully"
        }
      }
    }
  },
  "/api/society/admin/flats/allocate": {
    put: {
      tags: ["Setup"],
      summary: "Allocate a flat unit",
      description: "Assigns a specific flat unit to a user. Requires Admin role.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                userId: { type: "string" },
                flatId: { type: "string" },
                role: { type: "string", enum: ["owner", "tenant"] }
              },
              required: ["userId", "flatId", "role"]
            }
          }
        },
      },
      responses: {
        200: {
          description: "Flat unit allocated successfully"
        }
      }
    }
  },
  "/api/society/admin/payment/config": {
    get: {
      tags: ["Dues"],
      summary: "Get Razorpay accounts config",
      description: "Retrieves the Razorpay credential parameters. Requires Admin role.",
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: makeResponseSchema(paymentConfigSchema)
            }
          }
        }
      }
    },
    put: {
      tags: ["Dues"],
      summary: "Update Razorpay configuration",
      description: "Updates or sets dynamic Razorpay secret keys for routing billing transactions. Requires Admin role.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                razorpayKeyId: { type: "string" },
                razorpayKeySecret: { type: "string" }
              },
              required: ["razorpayKeyId", "razorpayKeySecret"]
            }
          }
        },
      },
      responses: {
        200: {
          description: "Razorpay keys updated successfully"
        }
      }
    }
  },
  "/api/society/admin/staff/{id}/aadhar-url": {
    get: {
      tags: ["Staff"],
      summary: "Get staff secure Aadhar view URL",
      description: "Retrieves a short-lived, signed download URL for the target staff provider's Aadhar attachment. Requires Admin role.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        200: {
          description: "Success",
          content: {
            "application/json": {
              schema: makeResponseSchema({
                type: "object",
                properties: {
                  url: { type: "string", example: "https://res.cloudinary.com/..." }
                }
              })
            }
          }
        }
      }
    }
  },
  "/api/society/admin/staff/{id}/avatar": {
    delete: {
      tags: ["Staff"],
      summary: "Delete staff avatar file",
      description: "Deletes the staff member's profile image from Cloudinary and updates their record. Requires Admin role.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        200: {
          description: "Avatar removed successfully"
        }
      }
    }
  },
  "/api/society/admin/staff/{id}/aadhar": {
    delete: {
      tags: ["Staff"],
      summary: "Delete staff Aadhar attachment file",
      description: "Deletes the staff member's private Aadhar document attachment from Cloudinary and updates their record. Requires Admin role.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } }
      ],
      responses: {
        200: {
          description: "Aadhar attachment removed successfully"
        }
      }
    }
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
  }
};
