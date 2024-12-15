"use client";

import React from "react";

// Forms
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import { CreateEventForm, FormLoader } from "@/components/admin/forms";

const Event: React.FC = () => {
  const params: {
    slug: string;
  } = useParams();

  const { data, isLoading } = api.event.getEventBySlug.useQuery({
    slug: params.slug,
  });

  return (
    <div className="min-h-screen bg-[#f7f7f7] px-[150px] py-[50px]">
      {isLoading ? (
        <FormLoader />
      ) : data ? (
        <CreateEventForm data={data} state="UPDATE" />
      ) : (
        <p>No event found</p>
      )}
    </div>
  );
};

export default Event;
