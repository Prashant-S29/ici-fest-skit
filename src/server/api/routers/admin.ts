import { AdminLoginSchema } from "@/schema/admin.schema";
import { createTRPCRouter, superAdminProcedure } from "@/server/api/trpc";

export const adminRouter = createTRPCRouter({
  addAdmin: superAdminProcedure
    .input(AdminLoginSchema)
    .mutation(async ({ ctx, input }) => {
      // check if admin already exists
      const existingAdmin = await ctx.db.admin.findUnique({
        where: {
          adminId: input.adminId,
        },
        select: {
          id: true,
        },
      });

      if (existingAdmin) {
        throw new Error("Admin already exists");
      }

      const admin = await ctx.db.admin.create({
        data: {
          adminId: input.adminId,
          password: input.password,
        },
      });

      return admin;
    }),
});
