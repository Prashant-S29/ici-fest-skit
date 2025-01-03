import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { eventRouter } from "./routers/event";
import { adminRouter } from "./routers/admin";
import { scheduleRouter } from "./routers/schedule";
import { fileRouter } from "./routers/files";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin: adminRouter,
  event: eventRouter,
  schedule: scheduleRouter,
  file: fileRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
