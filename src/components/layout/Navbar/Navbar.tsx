"use client";

import { Button } from "@/components/ui/button";
import { NAVBAR_TRANSITION_POINT } from "@/global";
import useScrollProgress from "@/hooks/useScrollProgress";
import Link from "next/link";
import React from "react";
import { NavLinkData } from "./data";

export const Navbar: React.FC = () => {
  const { y } = useScrollProgress();

  return (
    <header
      className={`fixed top-0 z-20 flex w-full items-center justify-between border-b  px-[50px] py-4 transition-all duration-200 ${y > NAVBAR_TRANSITION_POINT ? "bg-white border-gray-200" : " bg-white/10 border-transparent backdrop-blur-sm"}`}
    >
      <div className="flex items-center gap-4">
        <div className="max-w-[200px]">
          <div className="flex w-full justify-center">
            <div className="size-[40px] rounded-sm bg-gray-200" />
          </div>
          <p className="mt-1 text-center text-[10px]  leading-tight font-semibold">
            Swami Keshvanand Institute of Technology, M&G, Jaipur
          </p>
        </div>
        <div className="max-w-[200px]">
          <div className="flex w-full justify-center">
            <div className="size-[40px] rounded-sm bg-gray-200" />
          </div>
          <p className="mt-1 text-center text-[10px]  leading-tight font-semibold">
            Indian Concrete Institute Rajasthan State Center
          </p>
        </div>
      </div>
      <nav className="flex items-center gap-5">
        <ul className="flex items-center gap-5 text-sm font-semibold">
          {NavLinkData.map((data, index) => (
            <li key={index}>
              <Link href={data.href}>
                <p className="border-primary px-[10px] uppercase duration-100 hover:border-b-[3px] hover:pb-[8px]">
                  {data.label}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="h-5 w-[1px] bg-black" aria-hidden="true" />
        <Button variant="default" size="lg" className="font-semibold">
          Register Now
        </Button>
      </nav>
    </header>
  );
};
