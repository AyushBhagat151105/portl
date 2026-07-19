export const makeResponseSchema = (dataSchema: any) => ({
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    data: dataSchema,
  },
});

export const makeArrayResponseSchema = (itemSchema: any) =>
  makeResponseSchema({
    type: "array",
    items: itemSchema,
  });

export const successStatusSchema = makeResponseSchema({
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
  },
});

export const visitorSchema = {
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

export const noticeSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "not-123" },
    title: { type: "string", example: "Water Supply Notice" },
    content: { type: "string", example: "Water supply will be offline tomorrow for maintenance." },
    banner: { type: "string", nullable: true, example: "https://cloudinary/notices/banner.jpg" },
    bannerPublicId: { type: "string", nullable: true, example: "notices/banner_public_id" },
    authorId: { type: "string", example: "admin-id" },
    organizationId: { type: "string", example: "org-456" },
    createdAt: { type: "string", format: "date-time" },
  },
};

export const pollSchema = {
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

export const complaintSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "comp-123" },
    title: { type: "string", example: "Water Leakage" },
    description: { type: "string", example: "Main kitchen pipe leakage" },
    category: { type: "string", enum: ["PLUMBING", "ELECTRICAL", "SECURITY", "CLEANLINESS", "OTHERS"], example: "PLUMBING" },
    status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "RESOLVED"], example: "PENDING" },
    resolvedAt: { type: "string", format: "date-time", nullable: true },
    images: { type: "array", items: { type: "string" }, example: ["https://res.cloudinary.com/complaints/1.jpg"] },
    imagePublicIds: { type: "array", items: { type: "string" }, example: ["complaints/1_public"] },
    flatId: { type: "string", nullable: true },
    raisedById: { type: "string" },
    organizationId: { type: "string" },
    createdAt: { type: "string" },
  },
};

export const amenitySchema = {
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

export const bookingSchema = {
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

export const staffSchema = {
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

export const notificationSchema = {
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

export const membershipSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "memb-123" },
    userId: { type: "string" },
    organizationId: { type: "string" },
    role: { type: "string", example: "resident" },
    status: { type: "string", example: "approved" },
  },
};

export const dueSchema = {
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

export const budgetSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "bud-123" },
    name: { type: "string", example: "Yearly Maintenance Budget" },
    allocatedAmount: { type: "number", example: 500000 },
    spentAmount: { type: "number", example: 120000 },
    year: { type: "number", example: 2026 },
    organizationId: { type: "string" },
    createdAt: { type: "string" },
  },
};

export const expenseSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "exp-123" },
    amount: { type: "number", example: 15000 },
    description: { type: "string", example: "Elevator repair service" },
    category: { type: "string", example: "REPAIRS" },
    date: { type: "string", example: "2026-07-16" },
    budgetId: { type: "string", example: "bud-123" },
    organizationId: { type: "string" },
    createdAt: { type: "string" },
  },
};

export const fixedDepositSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "fd-123" },
    bankName: { type: "string", example: "KDCC Bank Mahemdavad" },
    amount: { type: "number", example: 700000 },
    interestRate: { type: "number", nullable: true, example: 7.5 },
    startDate: { type: "string", format: "date-time" },
    maturityDate: { type: "string", format: "date-time", nullable: true },
    status: { type: "string", example: "ACTIVE" },
    organizationId: { type: "string" },
    createdAt: { type: "string" },
  },
};

export const festivalSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "fest-123" },
    name: { type: "string", example: "Diwali Celebration" },
    description: { type: "string", example: "Diwali community lighting and dinner" },
    date: { type: "string", example: "2026-11-08" },
    allocatedBudget: { type: "number", example: 50000 },
    organizationId: { type: "string" },
    createdAt: { type: "string" },
  },
};

export const vehicleSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "veh-123" },
    plateNumber: { type: "string", example: "MH12AB1234" },
    ownerName: { type: "string", example: "John Doe" },
    ownerPhone: { type: "string", example: "9876543210" },
    ownerFlat: { type: "string", example: "Tower A - 101" },
  },
};

export const paymentConfigSchema = {
  type: "object",
  properties: {
    id: { type: "string", example: "pay-123" },
    razorpayKeyId: { type: "string", example: "rzp_test_xxxx" },
    organizationId: { type: "string" },
  },
};
