import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

const utapi = new UTApi();

export const fileRouter = createTRPCRouter({
  deleteFiles: protectedProcedure
    .input(z.object({ fileUrls: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const res = await utapi.deleteFiles(input.fileUrls);
      return res;
    }),
});
