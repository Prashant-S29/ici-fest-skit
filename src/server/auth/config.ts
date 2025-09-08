import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@/server/db";
import { env } from "@/env";
import { Role } from "@prisma/client";

// Extend the default session types to include custom properties
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      eventId?: string;
      coordinatorEmail?: string;
    } & DefaultSession["user"];
  }
}

// Define the shape of credentials
type Credential = {
  adminId?: string;
  password?: string;
  eventId?: string;
  coordinatorEmail?: string;
};

export const authConfig: NextAuthConfig = {
  // @ts-expect-error - refer to this https://github.com/prisma/prisma/issues/25857
  adapter: PrismaAdapter(db),
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {
        adminId: { label: "Admin ID", type: "text" },
        password: { label: "Password", type: "password" },
        eventId: { label: "Event ID", type: "text" },
        coordinatorEmail: { label: "Coordinator Email", type: "text" },
      },
      async authorize(
        credentials: Partial<Record<keyof Credential, unknown>> | null,
      ) {
        if (!credentials) return null;

        const adminId = credentials.adminId as string | undefined;
        const password = credentials.password as string | undefined;
        const eventId = credentials.eventId as string | undefined;
        const coordinatorEmail = credentials.coordinatorEmail as
          | string
          | undefined;

        try {
          // Handle admin login
          if (adminId && password) {
            const admin = await db.admin.findUnique({
              where: { adminId },
            });

            if (!admin) {
              return null; // Will be handled as "Account not found" in frontend
            }

            // TODO: bcrypt the password
            const isPasswordCorrect = password === admin.password;

            if (!isPasswordCorrect) {
              return null; // Will be handled as "Invalid Email or Password" in frontend
            }

            return {
              id: admin.adminId,
              role: Role.ADMIN,
            };
          }

          // Handle coordinator login
          if (eventId && password && coordinatorEmail) {
            const event = await db.event.findUnique({
              where: { slug: eventId, coordinatorEmail },
            });

            if (!event) {
              return null; // Will be handled as "Account not found" in frontend
            }

            // TODO: bcrypt the password
            const isPasswordCorrect = password === event.dbPassword;

            if (!isPasswordCorrect) {
              return null; // Will be handled as "Invalid Email or Password" in frontend
            }

            return {
              id: event.slug,
              role: Role.COORDINATOR,
              coordinatorEmail: event.coordinatorEmail,
            };
          }

          // If no valid login credentials are provided
          return null;
        } catch (error) {
          // Log the error for debugging but don't throw it
          console.error("Authentication error:", error);
          return null; // Will be handled as "Server error" in frontend
        }
      },
    }),
  ],

  callbacks: {
    // Customize the session to include our additional user properties
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.eventId = token.eventId;
        session.user.coordinatorEmail = token.coordinatorEmail;
      }
      return session;
    },

    // Customize the JWT to include additional user properties
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
        token.coordinatorEmail = user.coordinatorEmail;
      }

      return token;
    },
  },
};