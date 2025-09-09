import { z } from "zod";
import { api } from "@/trpc/server";
import { type NextRequest, NextResponse } from "next/server";
import { AdminLoginSchema } from "@/schema/admin.schema";

const ADMIN_ORIGINS = [
  "https://ici-fest-skit.vercel.app",
  "http://localhost:3000",
];

// Security headers validation
function validateSecurityHeaders(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");

  console.log(origin)

  if (!origin || origin?.startsWith("http://localhost")) {
    console.log("local")
    const superAdminPass = request.headers.get("super_admin_pass");
    const testingSecret = request.headers.get("TESTING_SECRET");

    console.log(superAdminPass, process.env.SUPER_ADMIN_PASS)
    console.log(testingSecret, process.env.TESTING_SECRET)

    return (
      superAdminPass === process.env.SUPER_ADMIN_PASS &&
      testingSecret === process.env.TESTING_SECRET
    );
  }

  if (!origin || !ADMIN_ORIGINS.includes(origin)) return false;
  if (referer && !ADMIN_ORIGINS.some((o) => referer.startsWith(o)))
    return false;
  if (!userAgent || userAgent.length < 20) return false;

  // Check super admin pass in prod too
  const superAdminPass = request.headers.get("super_admin_pass");
  if (!superAdminPass || superAdminPass !== process.env.SUPER_ADMIN_PASS) {
    return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    if (!validateSecurityHeaders(request)) {
      return NextResponse.json(
        { error: "Forbidden: Invalid request source" },
        { status: 403 },
      );
    }

    const clientIp =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";

    // Validate request body
    const json = (await request.json()) as unknown;
    const body = AdminLoginSchema.parse(json);
    const { adminId, password } = body;

    if (!adminId || !password) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const data = await api.admin.addAdmin({
      adminId,
      password,
    });

    if (!data) {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }

    console.log(
      `Admin created: ${adminId} from IP: ${clientIp} at ${new Date().toISOString()}`,
    );

    return NextResponse.json(
      {
        data,
        message: "Admin added successfully",
        error: null,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
    console.error("Error adding admin:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
