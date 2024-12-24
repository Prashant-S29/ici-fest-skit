"use client";

import React from "react";

// Forms
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import { CreateEventForm, FormLoader } from "@/components/admin/forms";
import { ResourceHandler } from "@/components/common";

const Event: React.FC = () => {
  const params: {
    slug: string;
  } = useParams();

  const { data, isLoading } = api.event.getEventBySlug.useQuery({
    slug: params.slug,
  });

  return (
    <div className="bg-[#f7f7f7]">
      {isLoading ? (
        <div className="h-screen w-full px-[150px] py-[100px]">
          <FormLoader />
        </div>
      ) : data ? (
        <div className="min-h-screen px-[150px] py-[100px]">
          <CreateEventForm data={data} state="UPDATE" />
        </div>
      ) : (
        <ResourceHandler status="notFound" />
      )}
    </div>
  );
};

export default Event;
