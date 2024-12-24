import { AdminSchema } from "@/schema/adminLogin.schema";
import { createTRPCRouter, publicProcedure, superAdminProcedure } from "@/server/api/trpc";

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
