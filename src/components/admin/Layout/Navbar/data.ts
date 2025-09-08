import type { NavLinkDataType } from "@/types";

export const NavbarData: (NavLinkDataType & {
  isRestricted: boolean;
})[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    isRestricted: true,
  },
  {
    label: "Events",
    href: "/admin/dashboard/events",
    isRestricted: true,
  },
  {
    label: "Schedule",
    href: "/admin/dashboard/schedule",
    isRestricted: true,
  },
  // {
  //   label: "Core Team",
  //   href: "/admin/dashboard/core-team",
  //   isRestricted: true,
  // },

  //   {
  //     label: "Dashboard",
  //     href: "/admin/dashboard",
  //   },
];
