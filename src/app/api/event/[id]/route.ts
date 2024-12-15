import { NextResponse } from "next/server";
import { api } from "@/trpc/server";

export async function GET(req: Request) {
  try {
    const events = await api.event.getAllEvents();

    return NextResponse.json(
      {
        data: events,
        message: "Events fetched successfully.",
        error: null,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        data: null,
        message: "Events fetched failed.",
        error: error,
      },
      { status: 500 },
    );
  }
}
