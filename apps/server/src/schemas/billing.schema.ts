import { z } from "zod";

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
