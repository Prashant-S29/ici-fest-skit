/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import {
  createTRPCRouter,
  // protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

import { z } from "zod";

// TODO: add validation, protectedProcedure

export const adminRouter = createTRPCRouter({
  getAdminByAdminId: publicProcedure
    .input(z.object({ adminId: z.string() }))
    .query(async ({ ctx, input }) => {
      const admin = await ctx.db.admin.findUnique({
        where: {
          adminId: input.adminId,
        },
      });
      return admin;
    }),
});
