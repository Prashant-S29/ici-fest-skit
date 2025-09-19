/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import React from "react";
import { useEffect, useState } from "react";

// Hooks
import { useMounted } from "@/hooks";

// Schema
import {
  CreateNewEventScheduleSchema,
  type PartialUpdateEventScheduleSchema,
} from "@/schema/event.schema";

// Zod and RHF
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useForm } from "react-hook-form";

// Icons
import { Plus } from "lucide-react";

// Components
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  TimePicker,
} from "@/components/ui";

// Constants
import { SCHEDULE_FORM_DEFAULTS } from "@/global/formDefaults";

// Utils
import { convertDateTimeToMin, convertMinToDate } from "@/utils/timeHandler";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";

interface Props {
  data?: z.infer<typeof PartialUpdateEventScheduleSchema>;
  state: "CREATE" | "UPDATE" | "DELETE";
  trigger?: React.ReactNode | null;
  refetch?: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<unknown, unknown>>;
}

// Helper function to convert minutes to Date object for TimePicker
const convertMinutesToTimeDate = (minutes: number): Date => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const date = new Date();
  date.setHours(hours, mins, 0, 0);
  return date;
};

// Helper function to parse different date formats and normalize them
const parseDate = (dateString: string | Date): Date => {
  if (dateString instanceof Date) {
    return dateString;
  }

  // Handle ISO format: "2025-09-26T18:30:00.000Z"
  if (dateString.includes("T") && dateString.includes("Z")) {
    return new Date(dateString);
  }

  // Handle YYYY-MM-DD format: "2025-09-26"
  const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnlyRegex.exec(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);

    if (!year || !month || !day) return new Date();

    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  // Handle "DD Month, YYYY" format: "27 September, 2025"
  if (dateString.includes(",")) {
    return new Date(dateString);
  }

  // Fallback to Date constructor
  return new Date(dateString);
};

// Helper function to convert Date to ISO string (your required format)
const dateToISOString = (date: Date): string => {
  // Create a new date at noon to avoid timezone issues
  const localDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12, // Set to noon to avoid timezone edge cases
    0,
    0,
    0,
  );
  return localDate.toISOString();
};

// Helper function to convert ISO string to YYYY-MM-DD format for HTML date input
const isoToDateInputValue = (isoString: string): string => {
  const date = parseDate(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to convert HTML date input value (YYYY-MM-DD) to ISO string
const dateInputValueToISO = (dateValue: string): string => {
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return new Date().toISOString();

  const date = new Date(year, month - 1, day, 12, 0, 0, 0); // Set to noon

  return date.toISOString();
};

export const NewScheduleDialog: React.FC<Props> = ({
  state,
  data,
  trigger,
  refetch,
}) => {
  // mutations
  const createScheduleMutation = api.schedule.createSchedule.useMutation();
  const updateScheduleMutation = api.schedule.updateScheduleById.useMutation();
  const deleteScheduleMutation = api.schedule.deleteScheduleById.useMutation();

  const [open, setOpen] = useState(false);

  // Initialize time states with proper conversion
  const [startTime, setStartTime] = useState<Date>(() => {
    if (data && typeof data.startTime === "number") {
      return convertMinutesToTimeDate(data.startTime);
    }
    return new Date();
  });

  const [endTime, setEndTime] = useState<Date>(() => {
    if (data && typeof data.endTime === "number") {
      return convertMinutesToTimeDate(data.endTime);
    }
    return new Date();
  });

  const isMounted = useMounted();

  type CreateEventScheduleData = z.infer<typeof CreateNewEventScheduleSchema>;
  const form = useForm<CreateEventScheduleData>({
    resolver: zodResolver(CreateNewEventScheduleSchema),
    defaultValues: data
      ? {
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          venue: data.venue,
          title: data.title,
        }
      : SCHEDULE_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (!data) {
      // Reset to current time when no data
      const now = new Date();
      setStartTime(now);
      setEndTime(now);
      return;
    }

    // Reset form with data
    form.reset(data);

    // Set time states with proper conversion from minutes
    if (typeof data.startTime === "number") {
      setStartTime(convertMinutesToTimeDate(data.startTime));
    }
    if (typeof data.endTime === "number") {
      setEndTime(convertMinutesToTimeDate(data.endTime));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, open]);

  //   add form data
  const handleAddForm = async (formData: CreateEventScheduleData) => {
    console.log("[New Schedule] formData", formData);

    const simpleDateString = formData.date.split("T")[0] ?? ""; // "2025-09-27"
    const data = await createScheduleMutation.mutateAsync({
      title: formData.title,
      date: simpleDateString,
      startTime: convertDateTimeToMin(startTime),
      endTime: convertDateTimeToMin(endTime),
      venue: formData.venue,
    });

    if (data) {
      toast.success("Schedule created successfully");
      setOpen(false);
      form.reset(SCHEDULE_FORM_DEFAULTS);
      if (refetch) {
        await refetch();
      }
      return;
    }
    toast.error("Error in creating schedule");
    setOpen(false);
    form.reset(SCHEDULE_FORM_DEFAULTS);
  };

  // update form
  const handleUpdateForm = async (formData: CreateEventScheduleData) => {
    if (!data?.id) return;

    // Parse the date and convert to ISO string
    const parsedDate = parseDate(formData.date);
    const isoDateString = dateToISOString(parsedDate);

    const res = await updateScheduleMutation.mutateAsync({
      id: data?.id,
      ...formData,
      date: isoDateString,
      startTime: convertDateTimeToMin(startTime),
      endTime: convertDateTimeToMin(endTime),
    });
    if (res) {
      toast.success("Schedule updated successfully");
      setOpen(false);
      form.reset(SCHEDULE_FORM_DEFAULTS);
      if (refetch) {
        await refetch();
      }
      return;
    }
    toast.error("Error in updating schedule");
    form.reset(SCHEDULE_FORM_DEFAULTS);
    setOpen(false);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteForm = async () => {
    if (!data?.id) return;
    setIsDeleting(true);
    const res = await deleteScheduleMutation.mutateAsync({ id: data.id });
    if (res) {
      toast.success("Schedule deleted successfully");
      setOpen(false);
      form.reset(SCHEDULE_FORM_DEFAULTS);
      if (refetch) {
        await refetch();
      }
      setIsDeleting(false);
      return;
    }
    setIsDeleting(false);
    toast.error("Error in deleting schedule");
    setOpen(false);
    form.reset(SCHEDULE_FORM_DEFAULTS);
  };

  // Determine submit handler based on state
  const submitHandler = (() => {
    switch (state) {
      case "CREATE":
        return handleAddForm;
      case "UPDATE":
        return handleUpdateForm;
      case "DELETE":
        return handleDeleteForm;
      default:
        return handleAddForm;
    }
  })();

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="default" size="sm">
            <Plus className="h-4 w-4" /> Add New Schedule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={`max-w-[500px]`}>
        <DialogHeader>
          <DialogTitle>
            {state === "DELETE"
              ? "Delete Schedule Form"
              : state === "CREATE"
                ? "New Schedule Form"
                : "Edit Schedule Form"}
          </DialogTitle>
          <DialogDescription className="leading-tight">
            {state === "DELETE" ? (
              <span>
                <span className="font-semibold">
                  This action can&apos;t be undone.
                </span>{" "}
                Are you sure you want to delete{" "}
                <span className="font-semibold">{data?.title}</span>
              </span>
            ) : state === "CREATE" ? (
              "Fill the below details for add a schedule"
            ) : (
              <span>
                Fill the below details for update{" "}
                <span className="font-semibold">{data?.title}</span>
              </span>
            )}
            <br />
          </DialogDescription>
        </DialogHeader>

        {state === "DELETE" ? (
          <div className="-mt-2">
            <section className="mt-3 flex justify-end gap-2">
              <DialogClose asChild>
                <Button size="sm" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>

              <Button
                size="sm"
                variant="destructive"
                loading={isDeleting}
                disabled={isDeleting}
                onClick={handleDeleteForm}
              >
                Delete this form
              </Button>
            </section>
          </div>
        ) : (
          <Form {...form}>
            <form
              className="space-y-3"
              onSubmit={form.handleSubmit(submitHandler)}
            >
              <div className="flex flex-col gap-4">
                {/* Form Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="gap-[50px] space-y-0">
                      <div className="leading-tight">
                        <FormLabel className="leading-tight">Title</FormLabel>
                        <FormDescription className="text-xs text-black/70">
                          If your event have multiple schedules, you can add it
                          as a <br />
                          <span className="font-semibold">
                            Your Event Name - Round 1
                          </span>
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="w-full">
                          <Input
                            placeholder="Schedule Title"
                            className="mt-2 px-5 py-5 font-medium"
                            {...field}
                          />
                          <FormMessage className="mt-1 px-1" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Event Date - Using Native HTML Date Input */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="gap-[50px] space-y-2">
                      <div className="leading-tight">
                        <FormLabel className="leading-tight">Date</FormLabel>
                        <FormDescription className="text-xs text-black/70">
                          Date of your event / round.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="date"
                          className="mt-2 flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          min="2025-01-01"
                          max="2025-12-31"
                          value={
                            field.value ? isoToDateInputValue(field.value) : ""
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              const isoString = dateInputValueToISO(
                                e.target.value,
                              );

                              console.log("ISO String:", isoString);
                              field.onChange(isoString);
                            }
                          }}
                        />
                      </FormControl>

                      <FormMessage className="px-1" />
                    </FormItem>
                  )}
                />

                {/* Start Time */}
                <section className="mt-2 grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={() => (
                      <FormItem className="gap-[50px] space-y-2">
                        <div className="leading-tight">
                          <FormLabel className="leading-tight">
                            Start Time
                          </FormLabel>
                          <FormDescription className="text-xs text-black/70">
                            Start time of your event
                          </FormDescription>
                        </div>
                        <FormControl>
                          <TimePicker
                            date={startTime}
                            setDate={setStartTime}
                            showSeconds={false}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* End Time */}
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={() => (
                      <FormItem className="gap-[50px] space-y-2">
                        <div className="leading-tight">
                          <FormLabel className="leading-tight">
                            End Time
                          </FormLabel>
                          <FormDescription className="text-xs text-black/70">
                            End time of your event
                          </FormDescription>
                        </div>
                        <FormControl>
                          <TimePicker
                            date={endTime}
                            setDate={setEndTime}
                            showSeconds={false}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </section>

                {/* Venue */}
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem className="gap-[50px] space-y-0">
                      <div className="leading-tight">
                        <FormLabel className="leading-tight">Venue</FormLabel>
                        <FormDescription className="text-xs text-black/70">
                          Venue where the event will be held
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="w-full">
                          <Input
                            placeholder="Venue"
                            className="mt-2 px-5 py-5 font-medium"
                            {...field}
                          />
                          <FormMessage className="mt-1 px-1" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <div
                  className={`flex w-full ${state === "UPDATE" ? "justify-between" : "justify-end"}`}
                >
                  {state === "UPDATE" && (
                    <div>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={form.formState.isSubmitting || isDeleting}
                        loading={isDeleting}
                        type="button"
                        onClick={handleDeleteForm}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <DialogClose asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={form.formState.isSubmitting || isDeleting}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      loading={form.formState.isSubmitting}
                      disabled={form.formState.isSubmitting || isDeleting}
                      variant="default"
                      size="sm"
                      className={`${state === "UPDATE" ? "bg-green-600 hover:bg-green-600/90" : ""}`}
                    >
                      {state === "CREATE" ? "Add" : "Update"}
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
