/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import React, { useState } from "react";

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
import { ReviewUpdateStatusPill } from "@/app/(admin)/admin/dashboard/events/eventTableConfig";
import { toast } from "sonner";

interface Props {
  eventId: string;
  isAdmin?: boolean;
}

export const EventInfo: React.FC<Props> = ({ eventId, isAdmin }) => {
  const apiUtils = api.useUtils();

  const { data, isLoading, error } = api.event.getEventBySlug.useQuery(
    {
      slug: eventId,
    },
    {
      retry: false,
    },
  );

  const [isRequestApproving, setIsRequestApproving] = useState(false);
  const [isRequestRejecting, setIsRequestRejecting] = useState(false);

  // Check if the main query has an unauthorized error
  const isUnauthorized = error?.data?.code === "UNAUTHORIZED";

  const {
    data: coordinatorManagedData,
    isLoading: isCoordinatorLoading,
    error: coordinatorError,
  } = api.event.getCoordinatorManagedDataById.useQuery(
    {
      slug: eventId,
    },
    {
      enabled: !isUnauthorized,
    },
  );

  const updateEventMutation = api.event.updateEventInfoBySlug.useMutation();

  // Show unauthorized error immediately if detected
  if (isUnauthorized) {
    return <ResourceHandler status="unauthorized" />;
  }

  // Also check coordinator data query for unauthorized error
  if (coordinatorError?.data?.code === "UNAUTHORIZED") {
    return <ResourceHandler status="unauthorized" />;
  }

  if (isLoading || isCoordinatorLoading) {
    return (
      <div className="min-h-screen w-full bg-[#f7f7f7] px-[250px] py-[100px]">
        <div className="loader h-6 w-[150px] rounded-sm" />
        <EventInfoLoader />
      </div>
    );
  }

  if (!data) {
    return <ResourceHandler status="notFound" />;
  }

  const handleApproveReviewRequest = async () => {
    setIsRequestApproving(true);

    try {
      await updateEventMutation.mutateAsync({
        slug: eventId,
        reviewRequestStatus: "APPROVED",
        brochure: coordinatorManagedData?.brochure || "",
        coverImage: coordinatorManagedData?.coverImage || "",
        images: coordinatorManagedData?.images,
        judgementCriteria: coordinatorManagedData?.judgementCriteria || "",
        disqualificationCriteria:
          coordinatorManagedData?.disqualificationCriteria || "",
        whatsappGroupURL: coordinatorManagedData?.whatsappGroupURL || "",
        shortDescription: coordinatorManagedData?.shortDescription || "",
        description: coordinatorManagedData?.description || "",
        materialsProvided: coordinatorManagedData?.materialsProvided || "",
      });
      toast.success("Review Request Updated Successfully");

      await apiUtils.event.getCoordinatorManagedDataById.invalidate();
    } catch (error) {
      console.error("Error in updating review request", error);
    } finally {
      setIsRequestApproving(false);
    }
  };

  const handleRejectReviewRequest = async () => {
    setIsRequestRejecting(true);

    try {
      await updateEventMutation.mutateAsync({
        slug: eventId,
        reviewRequestStatus: "REJECTED",
      });
      toast.success("Review Request Rejected Successfully");
    } catch (error) {
      console.error("Error in rejecting review request", error);
    } finally {
      setIsRequestRejecting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f7f7] px-[250px] py-[100px]">
      {isLoading ? (
        <EventInfoLoader />
      ) : (
        <div>
          <section className="flex items-center justify-between">
            <section className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{data.title}</h1>
              {data.reviewRequestStatus && (
                <ReviewUpdateStatusPill status={data.reviewRequestStatus} />
              )}
            </section>

            {isAdmin && (
              <Button size="sm" variant="default" asChild>
                <Link href={`/admin/dashboard/events/${data.slug}`}>
                  Edit Event Details
                </Link>
              </Button>
            )}
          </section>

          {isAdmin && data.reviewRequestStatus === "PENDING" && (
            <div className="mt-5 overflow-hidden rounded-lg border bg-white">
              <div className="flex w-full justify-between gap-[100px] px-5 py-4">
                <section>
                  <h3 className="text-sm font-semibold">
                    Review Update Request
                  </h3>
                  <p className="text-xs text-black/70">
                    The coordinator has requested an update to the event
                    details. Please review the details and update the status
                  </p>
                </section>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    loading={isRequestRejecting}
                    disabled={isRequestRejecting}
                    onClick={handleRejectReviewRequest}
                  >
                    Reject Request
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    loading={isRequestApproving}
                    disabled={isRequestApproving}
                    onClick={handleApproveReviewRequest}
                  >
                    Approve Request
                  </Button>
                </div>
              </div>
            </div>
          )}

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
                      {data.coordinators.length === 0 ? (
                        <p className="mt-1 text-xs font-medium leading-tight text-destructive">
                          No Coordinators have been added yet.
                        </p>
                      ) : (
                        <>
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
                        </>
                      )}
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
                      {data.registrationForm.length === 0 ? (
                        <p className="mt-1 text-xs font-medium leading-tight text-destructive">
                          No Registration Forms have been added yet.
                        </p>
                      ) : (
                        <>
                          {data.registrationForm.map(
                            (registrationForm, index) => (
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
                            ),
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {data.schedule && (
                  <div className="col-span-3">
                    <p className="text-xs text-black/70">
                      Event Schedule(s) ({data.schedule.length})
                    </p>

                    <div className="gap-5">
                      {data.schedule.length === 0 ? (
                        <p className="mt-1 text-xs font-medium leading-tight text-destructive">
                          No Schedules have been added yet.
                        </p>
                      ) : (
                        <>
                          {data.schedule.map((schedule, index) => (
                            <div key={index}>
                              <h2 className="text-sm font-medium">
                                {schedule.title}{" "}
                                <span className="text-xs text-black/70">
                                  ({convertMinsToTimeString(schedule.startTime)}{" "}
                                  - {convertMinsToTimeString(schedule.endTime)}{" "}
                                  &#x2022; {schedule.venue})
                                </span>
                              </h2>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* {data} */}
          {/* {JSON.stringify(coordinatorManagedData)} */}
          <EventInfoForm
            state="CREATE"
            slug={eventId}
            data={{
              id: data.id,
              brochure: coordinatorManagedData?.brochure || "",
              coverImage: coordinatorManagedData?.coverImage || "",
              images: coordinatorManagedData?.images,
              judgementCriteria:
                coordinatorManagedData?.judgementCriteria || "",
              disqualificationCriteria:
                coordinatorManagedData?.disqualificationCriteria || "",
              whatsappGroupURL: coordinatorManagedData?.whatsappGroupURL || "",
              shortDescription: coordinatorManagedData?.shortDescription || "",
              description: coordinatorManagedData?.description || "",
              materialsProvided:
                coordinatorManagedData?.materialsProvided || "",
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
