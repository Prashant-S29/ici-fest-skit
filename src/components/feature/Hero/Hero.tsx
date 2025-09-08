import Link from "next/link";
import React from "react";

export const Hero: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <section className="text-center">
        <p>Welcome to ICI Fest 2025</p>
        <p>
          Go To Admin Dashboard - <Link href="/admin/dashboard">here</Link>
        </p>
        <p>
          Go To Coordinator Dashboard -{" "}
          <Link href="/coordinator/dashboard">here</Link>
        </p>
      </section>
    </div>
  );
};
