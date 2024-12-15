"use client";

import React from "react";
import { api } from "@/trpc/react";

// Components
import { EventTable } from "@/components/admin/common/EventTable";
import { Button } from "@/components/ui";
import Link from "next/link";
import { RefreshIcon } from "@/icons";

const Events: React.FC = () => {
  const { data, isLoading, refetch, isFetching } =
    api.event.getAllEvents.useQuery();
  return (
    <div className="px-[150px] py-[50px]">
      <section className="flex w-full items-center justify-between">
        <p className="text-xl font-semibold">
          All Events{" "}
          <span className="text-gray-500">
            ({data ? data.formattedData?.length : 0})
          </span>
        </p>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className="border-dashed font-medium"
            onClick={() => refetch()}
          >
            <RefreshIcon />
            Refresh
          </Button>
          <Button
            size="sm"
            className="border-none font-semibold shadow-none"
            asChild
          >
            <Link href="/admin/dashboard/events/new">Add New Event</Link>
          </Button>
        </div>
      </section>
      {isLoading || isFetching ? (
        <EventsTableLoader />
      ) : data?.formattedData && data.formattedData.length > 0 ? (
        <EventTable data={data.formattedData} />
      ) : (
        <div className="flex items-center justify-center">
          <p>No Events Found</p>
        </div>
      )}
    </div>
  );
};

const EventsTableLoader: React.FC = () => {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-3">
        <div className="loader h-7 w-[250px] rounded-sm" />
        <div className="loader h-7 w-[50px] rounded-sm" />
      </div>

      <div className="mt-5">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="grid grid-cols-6 gap-5 border-b py-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center"
              >
                <div className="loader h-4 w-full rounded-full bg-gray-300" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
