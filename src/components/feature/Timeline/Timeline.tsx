"use client";

import { Button } from "@/components/ui";
import { FEST_START_DATE, YEAR } from "@/global";
import React, { useState } from "react";
import { TimelineData } from "./data";
import { convertMinsToTimeString } from "@/utils/timeHandler";

export const Timeline: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="py-[30px]">
      <p className="text-center text-3xl font-extrabold">
        Timeline for ICI Fest&apos;<span data-highlighted-text>{YEAR}</span>
      </p>

      <div className="mt-3 flex justify-center gap-3">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <Button
              key={index}
              variant={activeTab === index ? "default" : "outline"}
              size="lg"
              className="h-auto rounded-full px-8 py-4 font-semibold"
              onClick={() => setActiveTab(index)}
            >
              Day {index + 1}
            </Button>
          ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 px-[250px]">
        {TimelineData.map((data, index) => {
          const dayDifference = Math.floor(
            (Date.parse(data.eventDate) - Date.parse(FEST_START_DATE)) /
              (1000 * 60 * 60 * 24),
          );

          return (
            <div
              key={index}
              className="w-full rounded-xl border-2 border-primary px-5 py-4"
              style={{
                display: activeTab === dayDifference ? "block" : "none",
              }}
            >
              <p className="text-base font-bold">{data.eventName}</p>
              <p className="text-sm">
                {convertMinsToTimeString(data.startTime)} -{" "}
                {convertMinsToTimeString(data.endTime)} &#x2022; Football Ground
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
