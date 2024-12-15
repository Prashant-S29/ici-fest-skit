import { YEAR } from "@/global";
import React from "react";
import { FooterData } from "./data";
import Link from "next/link";
import { SocialIcons } from "@/icons";

export const Footer: React.FC = () => {
  return (
    <footer className="p-[50px]">
      <div className="rounded-3xl bg-black px-[50px] py-[40px]">
        <h1 className="text-3xl font-extrabold text-white">
          <span data-highlighted-text>ICI</span> Fest&apos;
          <span data-highlighted-text>{YEAR}</span>
        </h1>
        <div className="mt-5 flex gap-[100px]">
          <div>
            <p className="flex items-center gap-2 text-sm text-white">
              <SocialIcons.MapIcon />
              Address
            </p>
            <p className="mt-2 max-w-[350px] pl-5 text-sm text-white/50 duration-200 hover:text-white">
              <Link href="/">
                SKIT Campus, Ram Nagariya Rd, Shivam Nagar, Jagatpura, Jaipur,
                Rajasthan 302017
                <br />
                <u className="underline-offset-2">see on map</u>
              </Link>
            </p>
          </div>
          {FooterData.map((data, index) => (
            <div key={index} className="flex flex-col gap-4">
              <p className="flex items-center gap-2 text-sm text-white font-medium">
                <data.icon />
                {data.category}
              </p>
              <ul className="-mt-2 flex flex-col gap-1 pl-5">
                {data.links.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm text-white/50">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="my-5 h-[1px] w-full bg-white/50" />
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/50">All rights reserved</p>
          <p className="text-xs text-white/50">&copy; 2023 Ici Fest</p>
        </div>
      </div>
    </footer>
  );
};
