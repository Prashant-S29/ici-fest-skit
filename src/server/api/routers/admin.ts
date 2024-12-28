// import { AdminSchema } from "@/schema/adminLogin.schema";
import { AdminLoginSchema } from "@/schema/admin.schema";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";


export const adminRouter = createTRPCRouter({
  addAdmin: publicProcedure
    .input(AdminLoginSchema)
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
