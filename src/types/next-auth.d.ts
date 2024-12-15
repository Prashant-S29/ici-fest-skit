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
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
  }
}

export interface DefaultUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}
