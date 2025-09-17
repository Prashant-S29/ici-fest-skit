import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    // AUTH_DISCORD_ID: z.string(),
    // AUTH_DISCORD_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),
    UPLOADTHING_TOKEN: z.string(),
    ADMIN_ID: z.string(),
    ADMIN_PASSWORD: z.string(),
    SUPER_ADMIN_PASS: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    TESTING_SECRET: z.string(),

    PERFORMANCE_LOG_LEVEL: z
      .enum(["detailed", "normal", "errors-only"])
      .default("detailed"),
    PERFORMANCE_SLOW_THRESHOLD: z.string().default("1000"),
    PERFORMANCE_CRITICAL_THRESHOLD: z.string().default("5000"),
    PERFORMANCE_MEMORY_ALERT_MB: z.string().default("500"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    // AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    // AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    DIRECT_URL: process.env.DIRECT_URL,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    ADMIN_ID: process.env.ADMIN_ID,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    SUPER_ADMIN_PASS: process.env.SUPER_ADMIN_PASS,
    TESTING_SECRET: process.env.TESTING_SECRET,
    PERFORMANCE_LOG_LEVEL: process.env.PERFORMANCE_LOG_LEVEL,
    PERFORMANCE_SLOW_THRESHOLD: process.env.PERFORMANCE_SLOW_THRESHOLD,
    PERFORMANCE_CRITICAL_THRESHOLD: process.env.PERFORMANCE_CRITICAL_THRESHOLD,
    PERFORMANCE_MEMORY_ALERT_MB: process.env.PERFORMANCE_MEMORY_ALERT_MB,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
