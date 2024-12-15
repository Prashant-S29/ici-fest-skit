"use client";

import React from "react";
import { useParams } from "next/navigation";

const EventPage: React.FC = () => {
  const params: {
    slug: string;
  } = useParams();

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <section className="text-center">
        <p>Event Page: {params.slug}</p>
      </section>
    </div>
  );
};

export default EventPage;
