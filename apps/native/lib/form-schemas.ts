import { z } from "zod";

// ── Auth Forms ──────────────────────────────────────────
export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

// ── Onboarding Forms ────────────────────────────────────
export const createSocietySchema = z.object({
  name: z.string().min(1, "Society name is required"),
  slug: z
    .string()
    .min(1, "Society code is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
});

export const joinSocietySchema = z.object({
  slug: z.string().min(1, "Society code is required"),
  role: z.enum(["resident", "guard"]),
});

export const setupStructureSchema = z.object({
  towers: z
    .array(
      z.object({
        name: z.string().min(1, "Tower name is required"),
        flats: z
          .array(z.object({ number: z.string().min(1, "Flat number is required") }))
          .min(1, "At least one flat is required"),
      }),
    )
    .min(1, "At least one tower is required"),
});

// ── Admin Forms ─────────────────────────────────────────
export const createNoticeSchema = z.object({
  title: z.string().min(1, "Notice title is required"),
  content: z.string().min(1, "Notice content is required"),
  banner: z.string().optional().nullable(),
  bannerPublicId: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const createPollSchema = z.object({
  question: z.string().min(1, "Poll question is required"),
  options: z
    .array(z.object({ value: z.string().min(1, "Option cannot be empty") }))
    .min(2, "At least two options are required")
    .max(5, "Maximum 5 options allowed"),
});

export const createAmenitySchema = z.object({
  name: z.string().min(1, "Amenity name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  capacity: z.string().optional(),
});

export const createStaffSchema = z.object({
  name: z.string().min(1, "Staff name is required"),
  phone: z.string().min(1, "Phone number is required"),
  role: z.string().min(1, "Staff role is required"),
  code: z.string().optional(),
  aadharNumber: z.string().optional(),
  aadharPublicId: z.string().optional(),
  vehicleNumber: z.string().optional(),
  avatar: z.string().optional(),
});

export const assignFlatSchema = z.object({
  userId: z.string().min(1, "Please select a member"),
  flatId: z.string().min(1, "Please select a flat"),
});

// ── Resident Forms ──────────────────────────────────────
export const raiseComplaintSchema = z.object({
  title: z.string().min(1, "Complaint title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["PLUMBING", "ELECTRICAL", "SECURITY", "CLEANLINESS", "OTHERS"]),
  flatId: z.string().min(1, "Please select your flat"),
  images: z.array(z.string()).optional(),
  imagePublicIds: z.array(z.string()).optional(),
});

export const preApproveGuestSchema = z.object({
  name: z.string().min(1, "Guest name is required"),
  phone: z.string().min(1, "Guest phone is required"),
  purpose: z.string().optional(),
  flatId: z.string().min(1, "Please select your flat"),
});

export const bookAmenitySchema = z.object({
  date: z
    .string()
    .min(1, "Please select a date")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  timeslot: z.string().min(1, "Please select a time slot"),
  purpose: z.string().optional(),
});

// ── Guard Forms ─────────────────────────────────────────
export const registerVisitorSchema = z.object({
  name: z.string().min(1, "Visitor name is required"),
  phone: z.string().min(1, "Visitor phone is required"),
  purpose: z.string().optional(),
  type: z.enum(["GUEST", "DELIVERY", "CAB", "STAFF"]),
  flatId: z.string().min(1, "Please select a flat"),
});

export const verifyPasscodeSchema = z.object({
  code: z
    .string()
    .min(1, "Passcode is required")
    .length(6, "Passcode must be exactly 6 characters"),
});

// ── Inferred Types ──────────────────────────────────────
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type CreateSocietyFormData = z.infer<typeof createSocietySchema>;
export type JoinSocietyFormData = z.infer<typeof joinSocietySchema>;
export type SetupStructureFormData = z.infer<typeof setupStructureSchema>;
export type CreateNoticeFormData = z.infer<typeof createNoticeSchema>;
export type CreatePollFormData = z.infer<typeof createPollSchema>;
export type CreateAmenityFormData = z.infer<typeof createAmenitySchema>;
export type CreateStaffFormData = z.infer<typeof createStaffSchema>;
export type AssignFlatFormData = z.infer<typeof assignFlatSchema>;
export type RaiseComplaintFormData = z.infer<typeof raiseComplaintSchema>;
export type PreApproveGuestFormData = z.infer<typeof preApproveGuestSchema>;
export type BookAmenityFormData = z.infer<typeof bookAmenitySchema>;
export type RegisterVisitorFormData = z.infer<typeof registerVisitorSchema>;
export type VerifyPasscodeFormData = z.infer<typeof verifyPasscodeSchema>;

export const generateDuesSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be a positive number"),
  month: z.string().min(1, "Month is required"),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
});
export type GenerateDuesFormData = z.infer<typeof generateDuesSchema>;

// ── Resident Management Forms ───────────────────────────
export const createResidentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  aadharNumber: z
    .string()
    .optional()
    .refine((v) => !v || v.length === 12, "Aadhar must be exactly 12 digits"),
  image: z.string().optional(),
});

export const updateResidentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().optional(),
  aadharNumber: z
    .string()
    .optional()
    .refine((v) => !v || v.length === 12, "Aadhar must be exactly 12 digits"),
  image: z.string().optional(),
  aadharPublicId: z.string().optional().nullable(),
});

export const allocateFlatSchema = z.object({
  occupancyStatus: z.enum(["VACANT", "OWNER_OCCUPIED", "RENTED"]),
  ownerId: z.string().nullable(),
  memberCount: z.string().regex(/^\d+$/, "Must be a number"),
  vehicleMemberCount: z.string().regex(/^\d+$/, "Must be a number"),
  residentIds: z.array(z.string()),
});

// ── Treasury Forms ──────────────────────────────────────
export const createBudgetSchema = z.object({
  title: z.string().min(1, "Budget title is required"),
  allocatedAmount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be a positive number"),
});

export const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be a positive number"),
  category: z.enum(["MAINTENANCE", "UTILITIES", "SALARIES", "FESTIVAL", "REPAIRS", "OTHERS"]),
  description: z.string().optional(),
  budgetId: z.string().optional(),
});

export const createFestivalSchema = z.object({
  name: z.string().min(1, "Festival name is required"),
  description: z.string().optional(),
  budget: z
    .string()
    .min(1, "Budget amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Budget must be a positive number"),
});

export type CreateResidentFormData = z.infer<typeof createResidentSchema>;
export type UpdateResidentFormData = z.infer<typeof updateResidentSchema>;
export type AllocateFlatFormData = z.infer<typeof allocateFlatSchema>;
export type CreateBudgetFormData = z.infer<typeof createBudgetSchema>;
export type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;
export type CreateFestivalFormData = z.infer<typeof createFestivalSchema>;
