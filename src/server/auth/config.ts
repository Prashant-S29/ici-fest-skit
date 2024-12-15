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
    } & DefaultSession["user"];
  }
}

// Define the shape of credentials
type Credential = {
  adminId?: string;
  password?: string;
  eventId?: string;
};

export const authConfig: NextAuthConfig = {
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
      },
      async authorize(credentials: Credential | null) {
        const { adminId, eventId, password } = credentials ?? {};

        // Handle admin login
        if (adminId && password) {
          const admin = await db.admin.findUnique({
            where: { adminId },
          });

          if (!admin) {
            throw new Error("Invalid admin ID");
          }

          // TODO: bcrypt the password
          const isPasswordCorrect = password === admin.password; // password === admin.password;

          if (!isPasswordCorrect) {
            throw new Error("Invalid admin password");
          }

          return {
            id: admin.id,
            role: "ADMIN",
          };
        }

        // Handle event login
        if (eventId && password) {
          const event = await db.event.findUnique({
            where: { slug: eventId },
          });

          if (!event) {
            throw new Error("Invalid event ID");
          }

          return {
            id: event.id,
            eventId: event.id,
          };
        }

        // If no valid login credentials are provided
        return null;
      },
    }),
  ],

  callbacks: {
    // Customize the session to include our additional user properties
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
      }
      return session;
    },

    // Customize the JWT to include additional user properties
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }

      return token;
    },
  },
};
