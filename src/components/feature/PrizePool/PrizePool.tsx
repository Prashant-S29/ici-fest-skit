import React from "react";

// Constants
import { YEAR } from "@/global";

export const PrizePool: React.FC = () => {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <h1 className="text-3xl font-extrabold">
        <span data-highlight-text>Prize Pool</span> for ICI Fest&apos;{YEAR}
      </h1>
    </div>
  );
};
