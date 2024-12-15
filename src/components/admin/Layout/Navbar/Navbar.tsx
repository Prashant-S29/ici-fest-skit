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

export const Navbar: React.FC = () => {
  return (
    <header className="fixed  z-20 top-0 flex w-full items-center justify-between border-b bg-white px-[150px] py-5">
      <div className="flex gap-5">
        <p className="text-2xl font-bold">
          <span data-highlighted-text>ICI</span> Fest
        </p>
      </div>

      <nav className="flex gap-5">
        <NavigationMenu>
          <NavigationMenuList>
            {NavbarData.map((data, index) => (
              <NavigationMenuItem key={index}>
                <Link href={data.href} legacyBehavior passHref >
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {data.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <AdminProfile />
      </nav>
    </header>
  );
};
