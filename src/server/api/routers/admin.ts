// import { AdminSchema } from "@/schema/adminLogin.schema";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

const AdminSchema = z.object({
  adminId: z.string().min(1, "Admin ID is required."),
  password: z
    .string()
    .min(6, "Database password must be at least 6 characters long."),
});

export const adminRouter = createTRPCRouter({
  addAdmin: publicProcedure
    .input(AdminSchema)
    .mutation(async ({ ctx, input }) => {
      const admin = await ctx.db.admin.create({
        data: {
          adminId: input.adminId,
          password: input.password,
        },
      });

      return admin;
    }),
});
