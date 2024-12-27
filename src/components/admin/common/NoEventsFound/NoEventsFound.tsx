import React from "react";

export const NoEventsFound: React.FC = () => {
  return (
    <div className="mt-4 flex h-[70vh] w-full items-center justify-center">
      <div>
        <div className="relative h-[180px]">
          <div className="absolute left-1/2 top-1/2 h-[180px] w-[300px] origin-bottom-left -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-3xl bg-gray-300" />
          <div className="absolute left-1/2 top-1/2 flex h-[180px] w-[300px] -translate-x-1/2 -translate-y-1/2 flex-col justify-between rounded-3xl bg-gray-100 p-[30px]">
            <div className="h-9 w-[50px] rounded-lg bg-gray-300" />
            <div className="flex gap-3">
              <div className="h-5 w-[50px] rounded-lg bg-gray-300" />
              <div className="h-5 w-[50px] rounded-lg bg-gray-300" />
              <div className="h-5 w-[50px] rounded-lg bg-gray-300" />
            </div>
          </div>
        </div>
        <p className="mt-5 text-center text-base font-semibold">
          No Events Found
        </p>
        <p className="text-center text-sm leading-tight">
          Add a new event to get started
        </p>
      </div>
    </div>
  );
};
