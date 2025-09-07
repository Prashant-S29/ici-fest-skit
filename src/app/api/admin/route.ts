import { z } from "zod";
// import { type AdminSchema } from "@/schema/adminLogin.schema";
import { api } from "@/trpc/server";
import { type NextRequest, NextResponse } from "next/server";
import { type AdminLoginSchema } from "@/schema/admin.schema";

export async function POST(request: NextRequest) {
  try {
    const { adminId, password } = (await request.json()) as z.infer<
      typeof AdminLoginSchema
    >;

    if (!adminId || !password) {
      return NextResponse.json({
        error: "Invalid request body",
      });
    }

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
