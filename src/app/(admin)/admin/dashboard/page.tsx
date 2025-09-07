"use client";

import { useSession } from "next-auth/react";
import React from "react";

const Admin: React.FC = () => {
  const { data, status } = useSession();

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-1">
      Admin Dashboard
      {JSON.stringify(data)}
    </main>
  );
};

export default Admin;
