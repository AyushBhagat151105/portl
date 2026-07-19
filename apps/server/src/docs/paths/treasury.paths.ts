import {
  makeResponseSchema,
  makeArrayResponseSchema,
  budgetSchema,
  expenseSchema,
  festivalSchema,
  fixedDepositSchema,
} from "../schemas";

export const treasuryPaths = {
  "/api/society/admin/treasury/budgets": {
    "get": {
      "tags": ["Treasury"],
      "summary": "Get yearly budgets list",
      "description": "Retrieves the allocation list of yearly/seasonal budgets. Requires Admin role.",
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": makeArrayResponseSchema(budgetSchema)
            }
          }
        }
      }
    },
    "post": {
      "tags": ["Treasury"],
      "summary": "Create a yearly budget",
      "description": "Initializes a yearly treasury budget tracker. Requires Admin role.",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "name": { "type": "string", "example": "Yearly Lift Repairs" },
                "allocatedAmount": { "type": "number", "example": 100000 },
                "year": { "type": "number", "example": 2026 }
              },
              "required": ["name", "allocatedAmount", "year"]
            }
          }
        },
      },
      "responses": {
        "201": {
          "description": "Budget created successfully",
          "content": {
            "application/json": {
              "schema": makeResponseSchema(budgetSchema)
            }
          }
        }
      }
    }
  },
  "/api/society/admin/treasury/expenses": {
    "get": {
      "tags": ["Treasury"],
      "summary": "Get logged expenses",
      "description": "Retrieves society expense records history. Requires Admin role.",
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": makeArrayResponseSchema(expenseSchema)
            }
          }
        }
      }
    },
    "post": {
      "tags": ["Treasury"],
      "summary": "Log a society expense",
      "description": "Logs a new expense, automatically adjusting the relevant budget's remaining/spent values. Requires Admin role.",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "amount": { "type": "number", "example": 4500 },
                "description": { "type": "string", "example": "Plumbing service charge" },
                "category": { "type": "string", "example": "REPAIRS" },
                "date": { "type": "string", "format": "date", "example": "2026-07-16" },
                "budgetId": { "type": "string", "example": "bud-uuid" }
              },
              "required": ["amount", "description", "category", "date", "budgetId"]
            }
          }
        },
      },
      "responses": {
        "201": {
          "description": "Expense logged successfully",
          "content": {
            "application/json": {
              "schema": makeResponseSchema(expenseSchema)
            }
          }
        }
      }
    }
  },
  "/api/society/admin/treasury/festivals": {
    "get": {
      "tags": ["Treasury"],
      "summary": "Get community festivals list",
      "description": "Retrieves the scheduled community festival calendar. Requires Admin role.",
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": makeArrayResponseSchema(festivalSchema)
            }
          }
        }
      }
    },
    "post": {
      "tags": ["Treasury"],
      "summary": "Schedule a community festival",
      "description": "Registers a new event with allocated community budget. Requires Admin role.",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "name": { "type": "string", "example": "Diwali Festival" },
                "description": { "type": "string", "example": "Community dinner" },
                "date": { "type": "string", "format": "date", "example": "2026-11-08" },
                "allocatedBudget": { "type": "number", "example": 35000 }
              },
              "required": ["name", "date"]
            }
          }
        },
      },
      "responses": {
        "201": {
          "description": "Festival scheduled successfully",
          "content": {
            "application/json": {
              "schema": makeResponseSchema(festivalSchema)
            }
          }
        }
      }
    }
  },
  "/api/society/admin/treasury/fds": {
    "get": {
      "tags": ["Treasury"],
      "summary": "Get all Fixed Deposits",
      "description": "Retrieves the list of Fixed Deposits assets. Requires Admin role.",
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": makeArrayResponseSchema(fixedDepositSchema)
            }
          }
        }
      }
    },
    "post": {
      "tags": ["Treasury"],
      "summary": "Create a Fixed Deposit",
      "description": "Logs a new Fixed Deposit asset registry. Requires Admin role.",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "bankName": { "type": "string", "example": "KDCC Bank Mahemdavad" },
                "amount": { "type": "number", "example": 700000 },
                "interestRate": { "type": "number", "example": 7.5 },
                "startDate": { "type": "string", "format": "date-time" },
                "maturityDate": { "type": "string", "format": "date-time" }
              },
              "required": ["bankName", "amount", "startDate"]
            }
          }
        },
      },
      "responses": {
        "201": {
          "description": "Fixed Deposit created successfully",
          "content": {
            "application/json": {
              "schema": makeResponseSchema(fixedDepositSchema)
            }
          }
        }
      }
    }
  },
  "/api/society/admin/treasury/fds/{id}": {
    "delete": {
      "tags": ["Treasury"],
      "summary": "Delete a Fixed Deposit",
      "description": "Deletes the target Fixed Deposit asset. Requires Admin role.",
      "parameters": [
        { "name": "id", "in": "path", "required": true, "schema": { type: "string" } }
      ],
      "responses": {
        "200": {
          "description": "Fixed Deposit deleted successfully"
        }
      }
    }
  },
  "/api/society/admin/treasury/reports/blocks": {
    "get": {
      "tags": ["Treasury"],
      "summary": "Get block-wise maintenance collections summary",
      "description": "Aggregates all paid maintenance collections grouped by flat blocks. Requires Admin role.",
      "responses": {
        "200": {
          "description": "Success",
          "content": {
            "application/json": {
              "schema": makeArrayResponseSchema({
                "type": "object",
                "properties": {
                  "blockName": { "type": "string", "example": "Block B" },
                  "amount": { "type": "number", "example": 118000 }
                }
              })
            }
          }
        }
      }
    }
  }
};
