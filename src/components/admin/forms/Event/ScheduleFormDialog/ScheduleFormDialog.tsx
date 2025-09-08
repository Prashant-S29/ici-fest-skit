/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import React from "react";
import { useEffect, useState } from "react";

// Hooks
import { useMounted } from "@/hooks";

// Schema
import {
  CreateEventScheduleSchema,
  type PartialUpdateEventScheduleSchema,
  type CreateEventSchema,
} from "@/schema/event.schema";

// Zod and RHF
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useForm } from "react-hook-form";

import type {
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFieldArrayUpdate,
} from "react-hook-form";

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
  DatePicker,
  TimePicker,
  Textarea,
} from "@/components/ui";

// Constants
import { SCHEDULE_FORM_DEFAULTS } from "@/global/formDefaults";

// Utils
import {
  convertDateStringToMin,
  convertMinsToTimeString,
  convertMinToDate,
} from "@/utils/timeHandler";
import { convertDateTimeToDate } from "@/utils/dateHandler";
import { api } from "@/trpc/react";
import { PageLoader } from "@/components/common/PageLoader";
import { toast } from "sonner";

interface Props {
  append?: UseFieldArrayAppend<z.infer<typeof CreateEventSchema>, "schedule">;
  update?: UseFieldArrayUpdate<z.infer<typeof CreateEventSchema>, "schedule">;
  remove?: UseFieldArrayRemove;
  updateIndex?: number;
  removeIndex?: number;
  data?: z.infer<typeof PartialUpdateEventScheduleSchema>;
  state: "CREATE" | "UPDATE" | "DELETE" | "UPDATE_BY_COORDINATOR";
  trigger?: React.ReactNode;
  isFormSubmitting: boolean;
  setAllSchedulesInfo?: React.Dispatch<
    React.SetStateAction<
      | {
          info: string | null | undefined;
        }[]
      | undefined
    >
  >;
}

export const ScheduleFormDialog: React.FC<Props> = ({
  append,
  update,
  remove,
  updateIndex,
  removeIndex,
  data,
  state,
  trigger,
  isFormSubmitting,
}) => {
  const [open, setOpen] = useState(false);

  const [startTime, setStartTime] = useState<Date>(
    data ? new Date(convertMinToDate(data.startTime || 0)) : new Date(),
  );
  const [endTime, setEndTime] = useState<Date>(
    data ? new Date(convertMinToDate(data.endTime || 0)) : new Date(),
  );

  const isMounted = useMounted();

  type CreateEventScheduleData = z.infer<typeof CreateEventScheduleSchema>;
  const form = useForm<CreateEventScheduleData>({
    resolver: zodResolver(CreateEventScheduleSchema),
    defaultValues: data ? data : SCHEDULE_FORM_DEFAULTS,
  });

  useEffect(() => {
    setStartTime(new Date());
    setEndTime(new Date());

    if (!data) {
      return;
    }
    form.reset(data);

    setStartTime(new Date(convertMinToDate(data.startTime || 0)));
    setEndTime(new Date(convertMinToDate(data.endTime || 0)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, open]);

  // add form data
  const handleAddForm = (formData: CreateEventScheduleData) => {
    if (append) {
      const data = formatFormData(formData);

      append(data);
      // form.
      form.reset(SCHEDULE_FORM_DEFAULTS);
      setOpen(false);
    }
  };

  const handleUpdateForm = (formData: CreateEventScheduleData) => {
    if (update && updateIndex !== undefined) {
      const data = formatFormData(formData);
      update(updateIndex, data);
      form.reset(SCHEDULE_FORM_DEFAULTS);
      setOpen(false);
    } else {
      console.warn("Update function or index is missing");
    }
  };

  const handleFormRemove = () => {
    if (remove && removeIndex !== undefined) {
      remove(removeIndex);
      setOpen(false);
    } else {
      console.warn("Remove function or index is missing");
    }
  };

  // Determine submit handler based on state
  const submitHandler = (() => {
    switch (state) {
      case "CREATE":
        return handleAddForm;
      case "UPDATE":
        return handleUpdateForm;
      case "DELETE":
        return handleFormRemove;
      default:
        return handleAddForm;
    }
  })();

  const formatFormData = (formData: CreateEventScheduleData) => {
    return {
      ...formData,
      startTime: convertDateStringToMin(startTime.toString()),
      endTime: convertDateStringToMin(endTime.toString()),
      date: convertDateTimeToDate(formData.date),
    };
  };

  if (!isMounted) {
    return <PageLoader />;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="default" size="sm" disabled={isFormSubmitting}>
            <Plus className="h-4 w-4" /> Add New Schedule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className={`${state === "UPDATE_BY_COORDINATOR" ? "max-w-[700px]" : "max-w-[500px]"}`}
      >
        <DialogHeader>
          <DialogTitle>
            {state === "DELETE"
              ? "Delete Schedule Form"
              : state === "CREATE"
                ? "New Schedule Form"
                : state === "UPDATE_BY_COORDINATOR"
                  ? "Add Schedule Info"
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
            ) : state === "UPDATE_BY_COORDINATOR" ? (
              <span>
                {data?.title} &#x2022; {data?.date} &#x2022;{" "}
                {convertMinsToTimeString(data?.startTime || 0)} -{" "}
                {convertMinsToTimeString(data?.endTime || 0)}
              </span>
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
                onClick={handleFormRemove}
              >
                Delete this form
              </Button>
            </section>
          </div>
        ) : (
          <Form {...form}>
            <form className="space-y-3 px-1">
              <div className="flex flex-col gap-4">
                {/* Form Title */}
                {state !== "UPDATE_BY_COORDINATOR" && (
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="gap-[50px] space-y-0">
                        <div className="leading-tight">
                          <FormLabel className="leading-tight">Title</FormLabel>
                          <FormDescription className="text-xs text-black/70">
                            If your event have multiple schedules, you can add
                            it as a{" "}
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
                )}

                {/* Start Date | End Date */}
                {state !== "UPDATE_BY_COORDINATOR" && (
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
                          <DatePicker
                            value={
                              field.value ? new Date(field.value) : undefined
                            }
                            onChange={(date) =>
                              field.onChange(date?.toISOString())
                            }
                          />
                        </FormControl>
                        <FormMessage className="px-1" />
                      </FormItem>
                    )}
                  />
                )}

                {/* Time */}
                {state !== "UPDATE_BY_COORDINATOR" && (
                  <section className="mt-2 grid grid-cols-2 place-items-center gap-3">
                    {/* Start Time */}
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
                )}

                {/* Venue */}
                {state !== "UPDATE_BY_COORDINATOR" && (
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
                )}
              </div>
              <DialogFooter>
                <div className="flex gap-2">
                  <DialogClose asChild>
                    <Button variant="secondary" size="sm">
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button
                    variant="default"
                    size="sm"
                    type="button"
                    form="registrationFormDialogForm"
                    className={`${state === "UPDATE" ? "bg-green-600 hover:bg-green-600/90" : ""}`}
                    onClick={form.handleSubmit(submitHandler)}
                  >
                    {state === "CREATE" ? "Add" : "Update"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
