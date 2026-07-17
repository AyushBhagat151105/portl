import { z } from "zod";

export const setupSocietySchema = z.object({
  towers: z.array(
    z.object({
      name: z.string().min(1, "Tower name is required"),
      flats: z.array(z.string().min(1, "Flat number is required")),
    })
  ),
});

export const createNoticeSchema = z.object({
  title: z.string().min(1, "Notice title is required"),
  content: z.string().min(1, "Notice content is required"),
  banner: z.string().optional().nullable(),
  bannerPublicId: z.string().optional().nullable(),
});

export const createPollSchema = z.object({
  question: z.string().min(1, "Poll question is required"),
  options: z.array(z.string().min(1)).min(2, "At least two options are required"),
});

export const votePollSchema = z.object({
  optionIndex: z.number().int().nonnegative("Option index must be a non-negative integer"),
});

export const raiseComplaintSchema = z.object({
  title: z.string().min(1, "Complaint title is required"),
  description: z.string().min(1, "Complaint description is required"),
  category: z.enum(["PLUMBING", "ELECTRICAL", "SECURITY", "CLEANLINESS", "OTHERS"]),
  flatId: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  imagePublicIds: z.array(z.string()).optional(),
});

export const updateComplaintSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED"]),
});

export const registerVisitorSchema = z.object({
  name: z.string().min(1, "Visitor name is required"),
  phone: z.string().min(1, "Visitor phone is required"),
  purpose: z.string().optional(),
  type: z.enum(["GUEST", "DELIVERY", "CAB", "STAFF"]),
  flatId: z.string().min(1, "Flat ID is required"),
});

export const verifyPasscodeSchema = z.object({
  code: z.string().length(6, "Passcode must be exactly 6 characters"),
});

export const respondVisitorSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const preApproveGuestSchema = z.object({
  name: z.string().min(1, "Guest name is required"),
  phone: z.string().min(1, "Guest phone is required"),
  purpose: z.string().optional(),
  flatId: z.string().min(1, "Flat ID is required"),
});

export const bookAmenitySchema = z.object({
  amenityId: z.string().min(1, "Amenity ID is required"),
  date: z.string().min(1, "Date is required"), // Expecting ISO date string e.g. "2026-07-15"
  timeslot: z.string().min(1, "Timeslot is required"), // e.g. "10:00 AM - 12:00 PM"
  purpose: z.string().optional(),
});

export const respondBookingSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "CANCELLED"]),
});

export const registerPushTokenSchema = z.object({
  token: z.string().min(1, "Push token is required"),
});

export const joinSocietySchema = z.object({
  slug: z.string().min(1, "Society slug is required"),
  role: z.enum(["resident", "guard"] as const).refine((v) => ["resident", "guard"].includes(v), {
    message: "Role must be resident or guard",
  }),
});

export const assignFlatSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  flatId: z.string().min(1, "Flat ID is required"),
});

export const allocateFlatSchema = z.object({
  flatId: z.string().min(1, "Flat ID is required"),
  ownerId: z.string().optional().nullable(),
  occupancyStatus: z.enum(["VACANT", "OWNER_OCCUPIED", "RENTED"]),
  memberCount: z.number().int().nonnegative().optional(),
  vehicleMemberCount: z.number().int().nonnegative().optional(),
  residentIds: z.array(z.string()).optional(),
});

export const createAmenitySchema = z.object({
  name: z.string().min(1, "Amenity name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number().int().positive().optional(),
});

export const createStaffSchema = z.object({
  name: z.string().min(1, "Staff name is required"),
  phone: z.string().min(1, "Phone number is required"),
  role: z.string().min(1, "Staff role is required"),
  code: z.string().optional(),
  aadharNumber: z.string().optional().nullable(),
  aadharPublicId: z.string().optional().nullable(),
  vehicleNumber: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(1, "Staff name is required").optional(),
  phone: z.string().min(1, "Phone number is required").optional(),
  role: z.string().min(1, "Staff role is required").optional(),
  code: z.string().optional().nullable(),
  aadharNumber: z.string().optional().nullable(),
  aadharPublicId: z.string().optional().nullable(),
  vehicleNumber: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

export const generateDuesSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  month: z.string().min(1, "Month is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

export const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
});

export const updatePaymentConfigSchema = z.object({
  razorpayKeyId: z.string().min(1, "Razorpay Key ID is required"),
  razorpayKeySecret: z.string().min(1, "Razorpay Key Secret is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional().nullable(),
  aadharNumber: z.string().length(12, "Aadhar must be exactly 12 digits").regex(/^\d+$/, "Aadhar must be digits only").optional().nullable(),
  image: z.string().optional().nullable(),
});

export const registerVehicleSchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  makeModel: z.string().optional().nullable(),
  type: z.enum(["CAR", "BIKE"]),
  flatId: z.string().optional().nullable(),
});

export const createBudgetSchema = z.object({
  title: z.string().min(1, "Budget title is required"),
  allocatedAmount: z.number().positive("Amount must be positive"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export const createExpenseSchema = z.object({
  title: z.string().min(1, "Expense title is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum(["MAINTENANCE", "UTILITIES", "SALARIES", "FESTIVAL", "REPAIRS", "OTHERS"]),
  description: z.string().optional().nullable(),
  date: z.string().min(1, "Date is required"),
  budgetId: z.string().optional().nullable(),
});

export const createFestivalSchema = z.object({
  name: z.string().min(1, "Festival name is required"),
  description: z.string().optional().nullable(),
  date: z.string().min(1, "Date is required"),
  allocatedBudget: z.number().positive().optional(),
});
