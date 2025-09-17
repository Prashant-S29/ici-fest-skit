/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { env } from "@/env";
import type { LogConfig } from "@/types";

// Performance configuration from environment variables
const PERFORMANCE_CONFIG = {
  LOG_LEVEL: (process.env.PERFORMANCE_LOG_LEVEL as LogConfig) || "normal",
  SLOW_THRESHOLD: parseInt(
    process.env.PERFORMANCE_SLOW_THRESHOLD ?? "1000",
    10,
  ),
  CRITICAL_THRESHOLD: parseInt(
    process.env.PERFORMANCE_CRITICAL_THRESHOLD ?? "5000",
    10,
  ),
  MEMORY_ALERT_MB: parseInt(
    process.env.PERFORMANCE_MEMORY_ALERT_MB ?? "500",
    10,
  ),
  METRICS_RETENTION: parseInt(
    process.env.PERFORMANCE_METRICS_RETENTION ?? "1000",
    10,
  ),
} as const;

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();

  return {
    header: opts.headers,
    db,
    session,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

// Performance metrics storage for monitoring
interface PerformanceMetrics {
  procedure: string;
  duration: number;
  memory: number;
  timestamp: Date;
  userId?: string;
  success: boolean;
  error?: string;
  type: "query" | "mutation" | "subscription";
}

// In-memory storage (consider using Redis in production)
const performanceMetrics: PerformanceMetrics[] = [];

/**
 * Enhanced Performance Middleware with configurable logging and monitoring
 */
const performanceMiddleware = t.middleware(
  async ({ path, type, next, ctx }) => {
    const start = Date.now();
    const startMemory = process.memoryUsage();

    // Get user information for tracking
    const userId = ctx.session?.user?.id;

    let result;
    let error: string | undefined;
    let success = true;

    try {
      result = await next();
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : "Unknown error";

      // Only log errors if log level allows it
      if (
        PERFORMANCE_CONFIG.LOG_LEVEL === "detailed" ||
        PERFORMANCE_CONFIG.LOG_LEVEL === "errors-only"
      ) {
        console.error(`❌ Error in ${type}.${path}:`, error);
      }
      throw err; // Re-throw the error
    } finally {
      const duration = Date.now() - start;
      const endMemory = process.memoryUsage();
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
      const memoryMB = (memoryDelta / 1024 / 1024).toFixed(2);

      // Store metrics for monitoring
      const metrics: PerformanceMetrics = {
        procedure: `${type}.${path}`,
        duration,
        memory: memoryDelta,
        timestamp: new Date(),
        userId,
        success,
        error,
        type: type,
      };

      // Store in memory with configurable retention limit
      performanceMetrics.push(metrics);
      if (performanceMetrics.length > PERFORMANCE_CONFIG.METRICS_RETENTION) {
        performanceMetrics.shift();
      }

      // Conditional logging based on configuration
      const shouldLog = (level: "detailed" | "normal" | "errors-only") => {
        if (level === "detailed") return true;
        if (level === "errors-only") return !success;
        if (level === "normal") {
          return !success || duration > PERFORMANCE_CONFIG.SLOW_THRESHOLD;
        }
        return false;
      };

      if (shouldLog(PERFORMANCE_CONFIG.LOG_LEVEL)) {
        const logPrefix = `[${new Date().toISOString()}]`;
        const procedureInfo = `${type.toUpperCase()}.${path}`;
        const performanceInfo = `${duration}ms | ${memoryMB}MB`;
        const userInfo = userId
          ? `User: ${userId.substring(0, 8)}...`
          : "Anonymous";
        const statusEmoji = success ? "✅" : "❌";

        // Performance-based logging with configurable thresholds
        if (duration > PERFORMANCE_CONFIG.CRITICAL_THRESHOLD) {
          console.error(
            `🚨 CRITICAL ${logPrefix} ${procedureInfo} | ${performanceInfo} | ${userInfo} ${statusEmoji}`,
          );
          console.error(
            `   └─ This query is extremely slow and needs immediate attention!`,
          );
        } else if (duration > PERFORMANCE_CONFIG.SLOW_THRESHOLD * 2) {
          console.error(
            `🐌 VERY SLOW ${logPrefix} ${procedureInfo} | ${performanceInfo} | ${userInfo} ${statusEmoji}`,
          );
          console.error(
            `   └─ Consider optimizing this query or adding caching`,
          );
        } else if (duration > PERFORMANCE_CONFIG.SLOW_THRESHOLD) {
          console.warn(
            `⚠️  SLOW ${logPrefix} ${procedureInfo} | ${performanceInfo} | ${userInfo} ${statusEmoji}`,
          );
          console.warn(`   └─ This query is slower than expected`);
        } else if (duration > PERFORMANCE_CONFIG.SLOW_THRESHOLD / 2) {
          console.log(
            `⏳ MODERATE ${logPrefix} ${procedureInfo} | ${performanceInfo} | ${userInfo} ${statusEmoji}`,
          );
        } else if (PERFORMANCE_CONFIG.LOG_LEVEL === "detailed") {
          console.log(
            `⚡ FAST ${logPrefix} ${procedureInfo} | ${performanceInfo} | ${userInfo} ${statusEmoji}`,
          );
        }
      }

      // Database connection health check (randomly on 1% of requests)
      if (Math.random() < 0.01) {
        try {
          const dbStart = Date.now();
          await ctx.db.$queryRaw`SELECT 1`;
          const dbLatency = Date.now() - dbStart;

          if (dbLatency > 500) {
            console.warn(`⚠️  Database latency high: ${dbLatency}ms`);
          } else {
            console.log(`💾 Database health: ${dbLatency}ms`);
          }
        } catch (dbError) {
          if (PERFORMANCE_CONFIG.LOG_LEVEL !== "errors-only") {
            console.error("❌ Database health check failed:", dbError);
          }
        }
      }

      // Alert on consistent slow performance (check last 5 calls for this procedure)
      const recentSameProcedure = performanceMetrics
        .filter((m) => m.procedure === metrics.procedure)
        .slice(-5);

      if (recentSameProcedure.length >= 5) {
        const avgDuration =
          recentSameProcedure.reduce((sum, m) => sum + m.duration, 0) /
          recentSameProcedure.length;
        if (avgDuration > PERFORMANCE_CONFIG.SLOW_THRESHOLD * 2) {
          console.error(
            `🚨 PERFORMANCE ALERT: ${metrics.procedure} averaging ${avgDuration.toFixed(0)}ms over last 5 calls`,
          );
          console.error(
            `   └─ Recent calls: ${recentSameProcedure.map((m) => `${m.duration}ms`).join(", ")}`,
          );
        }
      }

      // Memory usage alerts with configurable threshold
      const memoryUsedMB = memoryDelta / (1024 * 1024);
      if (memoryUsedMB > PERFORMANCE_CONFIG.MEMORY_ALERT_MB) {
        console.warn(`🧠 HIGH MEMORY USAGE: used ${memoryMB}MB`);
      }
    }

    return result;
  },
);

/**
 * Development timing middleware (kept for compatibility)
 * This adds artificial delay in development to simulate network latency
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  if (
    process.env.NODE_ENV === "development" &&
    PERFORMANCE_CONFIG.LOG_LEVEL === "detailed"
  ) {
    console.log(
      `[TRPC-TIMING] ${path} took ${end - start}ms to execute (includes artificial delay)`,
    );
  }

  return result;
});

/**
 * Base procedure with performance monitoring
 */
const baseProcedure = t.procedure.use(performanceMiddleware);

/**
 * Public (unauthenticated) procedure with performance monitoring
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = baseProcedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure with performance monitoring
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = baseProcedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (
      !ctx.session ||
      !ctx.session.user ||
      (ctx.session.user.role !== "COORDINATOR" &&
        ctx.session.user.role !== "ADMIN")
    ) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    if (ctx.session.user.role === "COORDINATOR") {
      if (!ctx.session.user.coordinatorEmail) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const coordinatorEmail = await ctx.db.event.findUnique({
        where: {
          coordinatorEmail: ctx.session.user.coordinatorEmail,
        },
        select: {
          coordinatorEmail: true,
        },
      });

      if (!coordinatorEmail) {
        console.error("You are not authorized to access this event");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
    }

    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

// Super Admin Procedure Middleware
export const superAdminProcedureMiddleware = t.middleware(
  async ({ ctx, next }) => {
    const superAdminPassHeader = ctx.header.get("super_admin_pass");

    if (
      !superAdminPassHeader ||
      superAdminPassHeader !== env.SUPER_ADMIN_PASS
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid or missing SUPER_ADMIN_PASS header",
      });
    }

    return next();
  },
);

// Admin Procedure Middleware
export const adminProcedureMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or missing SUPER_ADMIN_PASS header",
    });
  }

  return next();
});

// Super Admin Procedure with performance monitoring
export const superAdminProcedure = baseProcedure.use(
  superAdminProcedureMiddleware,
);

// Admin Procedure with performance monitoring
export const adminProcedure = baseProcedure.use(adminProcedureMiddleware);

// Standalone monitored procedure (for backward compatibility)
export const monitoredProcedure = baseProcedure;

/**
 * Export performance metrics for monitoring dashboard
 */

export const getPerformanceMetrics = () => {
  const now = Date.now();
  const last24h = performanceMetrics.filter(
    (m) => now - m.timestamp.getTime() < 24 * 60 * 60 * 1000,
  );

  const summary = {
    totalRequests: last24h.length,
    successRate:
      last24h.length > 0
        ? (
            (last24h.filter((m) => m.success).length / last24h.length) *
            100
          ).toFixed(2) + "%"
        : "0%",
    averageDuration:
      last24h.length > 0
        ? Math.round(
            last24h.reduce((sum, m) => sum + m.duration, 0) / last24h.length,
          )
        : 0,
    slowQueries: last24h.filter(
      (m) => m.duration > PERFORMANCE_CONFIG.SLOW_THRESHOLD,
    ).length,
    criticalQueries: last24h.filter(
      (m) => m.duration > PERFORMANCE_CONFIG.CRITICAL_THRESHOLD,
    ).length,
    errors: last24h.filter((m) => !m.success).length,

    topSlowProcedures: Object.entries(
      last24h.reduce(
        (acc, m) => {
          if (!acc[m.procedure]) {
            acc[m.procedure] = { total: 0, count: 0, errors: 0 };
          }

          const proc = acc[m.procedure];

          if (!proc) return acc;

          proc.total += m.duration;
          proc.count += 1;
          if (!m.success) proc.errors += 1;

          return acc;
        },
        {} as Record<string, { total: number; count: number; errors: number }>,
      ),
    )
      .map(([procedure, stats]) => ({
        procedure,
        averageDuration: Math.round(stats.total / stats.count),
        totalCalls: stats.count,
        errorRate: ((stats.errors / stats.count) * 100).toFixed(1) + "%",
      }))
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 10),
  };

  return {
    summary,
    recentMetrics: last24h.slice(-50), // Last 50 requests
    rawMetrics: performanceMetrics.slice(-100), // Last 100 for detailed analysis
  };
};

/**
 * Clear performance metrics (useful for testing or resetting)
 */
export const clearPerformanceMetrics = () => {
  performanceMetrics.length = 0;
  if (PERFORMANCE_CONFIG.LOG_LEVEL !== "errors-only") {
    console.log("🗑️  Performance metrics cleared");
  }
};

/**
 * Export performance configuration for use in other modules
 */
export { PERFORMANCE_CONFIG };
