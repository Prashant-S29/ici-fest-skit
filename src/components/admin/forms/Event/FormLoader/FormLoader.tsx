import React from "react";

export const FormLoader: React.FC = () => {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border">
          <div className="border-b bg-white px-5 py-4">
            <div className="loader h-5 w-[200px] rounded-full" />
          </div>
          <div className="flex flex-col gap-5 bg-white px-5 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex w-full gap-[50px]">
                <div className="min-w-[400px]">
                  <div className="loader h-4 w-[100px] rounded-full" />
                  <div className="loader mt-2 h-2 w-[50px] rounded-full" />
                  <div className="loader mt-1 h-2 w-[50px] rounded-full" />
                </div>
                <div className="w-full">
                  <div className="loader h-8 w-full rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
