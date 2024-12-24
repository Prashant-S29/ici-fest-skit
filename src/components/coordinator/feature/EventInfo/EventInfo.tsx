"use client";

import React from "react";

// api handler
import { api } from "@/trpc/react";

// Components
import { ResourceHandler } from "@/components/common";
import { PageLoader } from "@/components/common/PageLoader";
import { branchYearHandler } from "@/utils/branchYearHandler";
import { convertMinsToTimeString } from "@/utils/timeHandler";
import { Button } from "@/components/ui";
import Link from "next/link";
import { getEndpoint } from "@/utils/getEndpoint";
import { EventInfoForm } from "../../form";

interface Props {
  eventId: string;
  isAdmin?: boolean;
}

export const EventInfo: React.FC<Props> = ({ eventId, isAdmin }) => {
  const { data, isLoading, isFetched, refetch } =
    api.event.getEventBySlug.useQuery({
      slug: eventId,
    });

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#f7f7f7] px-[150px] py-[100px]">
        <div className="loader h-6 w-[150px] rounded-sm" />
        <EventInfoLoader />
      </div>
    );
  }

  if (!data) {
    return <ResourceHandler status="notFound" />;
  }

  return (
    <div className="min-h-screen w-full bg-[#f7f7f7] px-[150px] py-[100px]">
      {isLoading ? (
        <EventInfoLoader />
      ) : (
        <div>
          <section className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">{data.title}</h1>

            {isAdmin && (
              <Button size="sm" variant="default" asChild>
                <Link href={`/admin/dashboard/events/${data.slug}`}>
                  Edit Event Details
                </Link>
              </Button>
            )}
          </section>
          <div className="mt-5 overflow-hidden rounded-lg border bg-white">
            <div className="w-full border-b px-5 py-4">
              <h3 className="text-sm font-semibold">Event Details</h3>
              <p className="text-xs text-black/70">
                These details are provided by the Event Admin. If case of any
                mis-match, please contact the Event Admin.
              </p>
            </div>

            <div className="px-5 py-4">
              <div className="grid grid-cols-3 gap-5">
                <div>
                  <p className="text-xs text-black/70">Title</p>
                  <h2 className="text-sm font-medium">{data.title}</h2>
                </div>
                <div>
                  <p className="text-xs text-black/70">Event Id</p>
                  <h2 className="text-sm font-medium">{data.slug}</h2>
                </div>
                <div>
                  <p className="text-xs text-black/70">
                    Event Duration in Days
                  </p>
                  <h2 className="text-sm font-medium">{data.durationInDays}</h2>
                </div>
                <div>
                  <p className="text-xs text-black/70">Event Page URL</p>
                  <Link
                    href={getEndpoint(`events/${data.slug}`)}
                    className="text-sm font-medium text-blue-600 underline"
                  >
                    URL
                  </Link>
                </div>
                {data.coordinators && (
                  <div>
                    <p className="text-xs text-black/70">
                      Event Coordinator(s) ({data.coordinators.length})
                    </p>

                    <div className="gap-5">
                      {data.coordinators.map((coordinator, index) => (
                        <div key={index}>
                          <h2 className="text-sm font-medium">
                            {coordinator.name}{" "}
                            <span className="text-xs text-black/70">
                              (
                              {branchYearHandler({
                                branch: coordinator.branch,
                                year: coordinator.year,
                              })}{" "}
                              &#x2022; {coordinator.mobile})
                            </span>
                          </h2>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.registrationForm && (
                  <div>
                    <p className="text-xs text-black/70">
                      Event Registration Form(s) ({data.registrationForm.length}
                      )
                    </p>

                    <div className="gap-5">
                      {data.registrationForm.map((registrationForm, index) => (
                        <div key={index}>
                          <h2 className="text-sm font-medium">
                            <Link
                              href={registrationForm.formURL}
                              className="text-blue-600 underline"
                              target="_blank"
                            >
                              {registrationForm.title}
                            </Link>{" "}
                            <span className="text-xs text-black/70">
                              (
                              {registrationForm.isActive
                                ? "Active"
                                : "Not Active"}{" "}
                              &#x2022;{" "}
                              {registrationForm.formAmount === 0
                                ? "Free of Cost"
                                : `₹${registrationForm.formAmount}`}
                              )
                            </span>
                          </h2>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.schedule && (
                  <div className="col-span-3">
                    <p className="text-xs text-black/70">
                      Event Schedule(s) ({data.schedule.length})
                    </p>

                    <div className="gap-5">
                      {data.schedule.map((schedule, index) => (
                        <div key={index}>
                          <h2 className="text-sm font-medium">
                            {schedule.title}{" "}
                            <span className="text-xs text-black/70">
                              ({convertMinsToTimeString(schedule.startTime)} -{" "}
                              {convertMinsToTimeString(schedule.endTime)}{" "}
                              &#x2022; {schedule.venue})
                            </span>
                          </h2>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <EventInfoForm
            state="UPDATE"
            slug={eventId}
            data={{
              id: data.id,
              brochure: data.brochure ?? "",
              coverImage: data.coverImage ?? "",
              images: data.images,
              judgementCriteria: data.judgementCriteria ?? "",
              disqualificationCriteria: data.disqualificationCriteria ?? "",
              whatsappGroupURL: data.whatsappGroupURL ?? "",
              shortDescription: data.shortDescription ?? "",
              description: data.description ?? "",
            }}
          />
        </div>
      )}
    </div>
  );
};

const EventInfoLoader = () => {
  return (
    <div className="mt-5 rounded-lg border bg-white">
      <div className="w-full border-b px-5 py-4">
        <h3 className="text-sm font-semibold">Event Details</h3>
        <p className="text-xs text-black/70">
          These details are provided by the Event Admin. If case of any
          mis-match, please contact the Event Admin.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-5 px-5 py-4">
        <div>
          <p className="text-xs text-black/70">Title</p>
          <div className="loader mt-1 h-3 w-[150px] rounded-full" />
        </div>
        <div>
          <p className="text-xs text-black/70">Event Id</p>
          <div className="loader mt-1 h-3 w-[150px] rounded-full" />
        </div>
        <div>
          <p className="text-xs text-black/70">Event Duration in Days</p>
          <div className="loader mt-1 h-3 w-[150px] rounded-full" />
        </div>
        <div>
          <p className="text-xs text-black/70">Event Page URL</p>
          <div className="loader mt-1 h-3 w-[150px] rounded-full" />
        </div>
        <div>
          <p className="text-xs text-black/70">Event Coordinator(s) (0)</p>
          <div className="loader mt-1 h-3 w-[150px] rounded-full" />
        </div>
        <div>
          <p className="text-xs text-black/70">
            Event Registration Form(s) (0)
          </p>
          <div className="loader mt-1 h-3 w-[150px] rounded-full" />
        </div>
        <div>
          <p className="text-xs text-black/70">Event Schedule(s) (0)</p>
          <div className="loader mt-1 h-3 w-[150px] rounded-full" />
        </div>
      </div>
    </div>
  );
};
