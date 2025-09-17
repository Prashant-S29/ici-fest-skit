import { type NextRequest, NextResponse } from "next/server";
import { api } from "@/trpc/server";
import { z } from "zod";

// CORS configuration for public website
const PUBLIC_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "").split(",");

// CORS headers
function setCORSHeaders(
  response: NextResponse,
  origin: string | null,
): NextResponse {
  if (origin && PUBLIC_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, TESTING_SECRET",
  );
  response.headers.set("Access-Control-Max-Age", "3600");

  // Add no-cache headers to CORS response
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Surrogate-Control", "no-store");

  return response;
}

// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const response = new NextResponse(null, { status: 200 });
  return setCORSHeaders(response, origin);
}

// Input validation schemas
const ScheduleQuerySchema = z.object({
  page: z
    .string()
    .nullable()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .nullable()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  type: z
    .enum(["all", "datewise"])
    .nullable()
    .transform((val) => val ?? "all"),
});

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");

  try {
    // CORS validation
    if (origin && !PUBLIC_ORIGINS.includes(origin)) {
      const response = NextResponse.json(
        { error: "CORS: Origin not allowed" },
        { status: 403 },
      );
      return response;
    }

    // Additional localhost testing secret validation
    if (origin?.includes("http://localhost")) {
      const testingSecret = request.headers.get("TESTING_SECRET");

      if (!testingSecret || testingSecret !== process.env.TESTING_SECRET) {
        const response = NextResponse.json(
          { error: "Unauthorized: Invalid or missing testing secret" },
          { status: 401 },
        );
        return setCORSHeaders(response, origin);
      }
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const rawQuery = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      type: searchParams.get("type"),
    };

    const validationResult = ScheduleQuerySchema.safeParse(rawQuery);

    if (!validationResult.success) {
      const response = NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
      return setCORSHeaders(response, origin);
    }

    const { page, limit, type } = validationResult.data;

    // Validate pagination limits
    if (page < 1 || page > 1000) {
      const response = NextResponse.json(
        { error: "Page must be between 1 and 1000" },
        { status: 400 },
      );
      return setCORSHeaders(response, origin);
    }

    if (limit < 1 || limit > 50) {
      const response = NextResponse.json(
        { error: "Limit must be between 1 and 50" },
        { status: 400 },
      );
      return setCORSHeaders(response, origin);
    }

    let data;

    // Route based on query parameters
    if (type === "datewise") {
      // Get date-wise paginated schedules
      data = await api.publicSchedule.getDateWisePaginatedSchedule({
        page,
        limit,
      });
    } else {
      // Get all paginated schedules
      data = await api.publicSchedule.getAllPaginatedSchedule({
        page,
        limit,
      });
    }

    const response = NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
          ETag: `"${Date.now()}"`,
          Vary: "Accept-Encoding, Authorization",
        },
      },
    );

    return setCORSHeaders(response, origin);
  } catch (error) {
    console.error("Public Schedule API Error:", error);

    const response = NextResponse.json(
      {
        success: false,
        data: null,
        error: "Internal server error",
        message: "An unexpected error occurred",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        },
      },
    );

    return setCORSHeaders(response, origin);
  }
}
