"use client";
import React from "react";
import Link from "next/link";

// Data
import { NavbarData } from "./data";

// Components
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui";
import { AdminProfile } from "../AdminProfile";
import { useSession } from "next-auth/react";

export const Navbar: React.FC = () => {
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 z-20 flex w-full items-center justify-between border-b bg-white px-[150px] py-5">
      <div className="flex gap-5">
        <p className="text-2xl font-bold">
          <span data-highlighted-text>ICI</span> Fest
        </p>
      </div>

      <nav className="flex items-center gap-5">
        <NavigationMenu>
          <NavigationMenuList>
            {NavbarData.map((data, index) => (
              <div key={index}>
                {!session && data.isRestricted ? (
                  ""
                ) : (
                  <NavigationMenuItem key={index}>
                    <Link href={data.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        {data.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )}
              </div>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {session && <AdminProfile data={session} status={status} />}
      </nav>
    </header>
  );
};
