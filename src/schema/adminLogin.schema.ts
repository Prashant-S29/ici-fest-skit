import { z } from "zod";

export const AdminSchema = z.object({
  adminId: z
    .string()
    .min(1, "Admin ID is required.")
    .max(50, "Admin ID is too long."),
  password: z
    .string()
    .min(6, "Database password must be at least 6 characters long."),
});
