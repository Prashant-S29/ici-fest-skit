import { YEAR } from "@/global";
import React from "react";

export const About: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-extrabold">
        <span data-highlighted-text>ICI</span> Fest
      </h1>
      <p className="mt-1 w-[550px] text-base leading-tight">
        ICI fest aims at aspiring the young brains to showcase their skills and
        compete with others by participating in various technical events and
        workshop. Register today to make yourself stand out among all odds.
      </p>
      <h3 className="mt-2 text-base font-bold">
        Date for ICI Fest&apos;{YEAR}
      </h3>
      <p>
        08<sup>th</sup> to 10<sup>th</sup> November 2024
      </p>
      <h3 className="mt-2 text-base font-bold">Venue</h3>
      <p>SKIT Campus, Ram Nagariya Rd, Jagatpura, Jaipur </p>
    </div>
  );
};
