"use client";

import { Hero } from "@/components/feature";
import React, { useEffect } from "react";

const Home: React.FC = () => {
  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        "https://ici-fest-skit.vercel.app/api/v1/schedule?type=all&page=1&limit=20",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            TESTING_SECRET: "5eGW9SH4dakBXFLT2U5zDl4F8fPiAwPf",
          },
          cache:"no-cache"
        },
      );
      const data = await res.json();
      console.log(data);
    }

    fetchData();
  }, []);

  return (
    <main className="px-[50px]">
      <Hero />
    </main>
  );
};

export default Home;
