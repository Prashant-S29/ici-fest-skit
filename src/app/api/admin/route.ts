import { z } from "zod";
// import { type AdminSchema } from "@/schema/adminLogin.schema";
import { api } from "@/trpc/server";
import { type NextRequest, NextResponse } from "next/server";

const AdminSchema = z.object({
  adminId: z.string().min(1, "Admin ID is required."),
  password: z
    .string()
    .min(6, "Database password must be at least 6 characters long."),
});

export async function POST(request: NextRequest) {
  try {
    const { adminId, password } = (await request.json()) as z.infer<
      typeof AdminSchema
    >;

    if (!adminId || !password) {
      return NextResponse.json({
        error: "Invalid request body",
      });
    }

    // Validate request body
    const data = await api.admin.addAdmin({
      adminId: adminId,
      password: password,
    });

    if (!data) {
      return NextResponse.json(
        {
          error: "Internal Server Error",
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      {
        data: data,
        message: "Admin added successfully",
        error: null,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.format(),
        },
        { status: 400 },
      );
    }
    console.error("Error adding admin:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
