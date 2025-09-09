import { z } from "zod";

// Zod schema for form validation
export const AdminLoginSchema = z.object({
  adminId: z.string().min(5, "Min 5 characters required for adminId"),
  password: z.string().min(8, "Min 8 characters required for password"),
});

export const CoordinatorLoginSchema = z.object({
  coordinatorEmail: z.string().email("Invalid email"),
  eventId: z.string().min(1, "Min 1 characters required for eventId"),
  password: z.string().min(8, "Min 8 characters required for password"),
});
