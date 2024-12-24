"use client";

import { ourFileRouter } from "@/app/api/uploadthing/core";

// tRPC
import { TRPCReactProvider } from "@/trpc/react";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { Toaster } from "sonner";
import { extractRouterConfig } from "uploadthing/server";

export const Providers = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) => {
  return (
    <TRPCReactProvider>
      <SessionProvider session={session}>
        <Toaster richColors />
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        {children}
      </SessionProvider>
    </TRPCReactProvider>
  );
};
