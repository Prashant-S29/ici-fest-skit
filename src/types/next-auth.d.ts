/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { type Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";
import { type DefaultJWT } from "next-auth/jwt";

import type { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      eventId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    eventId?: string;
  }
}

export interface DefaultUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}
