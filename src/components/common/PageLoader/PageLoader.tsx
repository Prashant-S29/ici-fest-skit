import React from "react";

export const PageLoader: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <section className="text-center">
        <p className="text-xl font-bold">
          Welcome to <span data-highlighted-text>ICI</span> Fest
        </p>
        <p className="text-sm text-black/70">Your page is loading...</p>
      </section>
    </div>
  );
};
