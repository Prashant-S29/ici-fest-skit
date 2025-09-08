import { z } from "zod";

// Zod schema for form validation
export const AdminLoginSchema = z.object({
  adminId: z.string().min(1, "Admin ID is required"),
  password: z.string().min(1, "Password is required"),
});

export const CoordinatorLoginSchema = z.object({
  coordinatorEmail: z.string().email("Invalid email"),
  eventId: z.string().min(1, "Event ID is required"),
  password: z.string().min(1, "Password is required"),
});
