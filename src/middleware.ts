import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/server/auth/index";
import { Role } from "@prisma/client";

const ADMIN_LOGIN_URL = "/admin/login";
const EVENT_LOGIN_URL = "/coordinator/login";

// admin restricted paths
const adminProtectedPaths = ["/admin/dashboard"];

// coordinator restricted paths
const eventProtectedPaths = ["/coordinator/dashboard"];

export async function middleware(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const { pathname } = url;


    const session = await auth();

    // check for admin restricted paths
    const isAdminProtectedPath = adminProtectedPaths.some((path) =>
      pathname.startsWith(path),
    );

    // check for coordinator restricted paths
    const isEventProtectedPath = eventProtectedPaths.some((path) =>
      pathname.startsWith(path),
    );



    // if no session and trying to access restricted paths
    if (!session) {
      if (isAdminProtectedPath) {
        return NextResponse.redirect(new URL(ADMIN_LOGIN_URL, request.url));
      } else if (isEventProtectedPath) {
        return NextResponse.redirect(new URL(EVENT_LOGIN_URL, request.url));
      }
      return NextResponse.next();
    }

    const isUserOnAdminLoginPage = pathname === ADMIN_LOGIN_URL;
    const isUserOnEventLoginPage = pathname === EVENT_LOGIN_URL;

    // check is session exists and user is on any login page
    if (isUserOnAdminLoginPage) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    if (isUserOnEventLoginPage) {
      return NextResponse.redirect(
        new URL("/coordinator/dashboard", request.url),
      );
    }

    // check for admin role for admin dashboard and sub-routes
    if (isAdminProtectedPath) {
      if (session.user && session.user.role === Role.ADMIN) {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    // check for coordinator role for event dashboard and sub-routes
    if (isEventProtectedPath) {
      // both admin and coordinator can access the event dashboard
      if (
        session.user &&
        (session.user.role === Role.ADMIN ||
          session.user.role === Role.COORDINATOR)
      ) {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error in middleware", error);
    return NextResponse.json(
      {
        error: "Authentication middleware failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const config = {
  matcher:  ["/admin/:path*", "/coordinator/:path*"],
};
