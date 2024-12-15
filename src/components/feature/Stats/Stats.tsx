import React from "react";

// Constants
import { YEAR } from "@/global";
import { statsData } from "./data";

export const Stats: React.FC = () => {
  return (
    <div className="py-[30px]">
      <h1 className="text-center text-3xl font-extrabold">
        Fest&apos; <span data-highlighted-text>{YEAR - 1}</span> Stats
      </h1>
      <div className="mt-8 flex justify-center gap-[50px]">
        {statsData.map((data, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-xl bg-gray-200 px-4 py-3"
          >
            <p
              data-highlighted-text
              className="text-3xl font-extrabold leading-none"
            >
              {data.value}
            </p>
            <p className="text-base font-semibold leading-none">{data.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
