/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import React from "react";
import { useEffect, useState } from "react";

// Hooks
import { useMounted } from "@/hooks";

// Schema
import {
  CreateEventScheduleSchema,
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
} from "@/components/ui";

// Constants
import { SCHEDULE_FORM_DEFAULTS } from "@/global/formDefaults";

// Utils
import { convertDateStringToMin, convertMinToDate } from "@/utils/timeHandler";
import { convertDateTimeToDate } from "@/utils/dateHandler";

interface Props {
  append?: UseFieldArrayAppend<z.infer<typeof CreateEventSchema>, "schedule">;
  update?: UseFieldArrayUpdate<z.infer<typeof CreateEventSchema>, "schedule">;
  remove?: UseFieldArrayRemove;
  updateIndex?: number;
  removeIndex?: number;
  data?: z.infer<typeof CreateEventScheduleSchema>;
  state: "CREATE" | "UPDATE" | "DELETE";
  trigger?: React.ReactNode;
  isFormSubmitting: boolean;
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
    data ? new Date(convertMinToDate(data.startTime)) : new Date(),
  );
  const [endTime, setEndTime] = useState<Date>(
    data ? new Date(convertMinToDate(data.endTime)) : new Date(),
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

    console.log("useEffect");

    if (!data) {
      console.log("no data found");
      return;
    }
    form.reset(data);

    console.log("data found");

    setStartTime(new Date(convertMinToDate(data.startTime)));
    setEndTime(new Date(convertMinToDate(data.endTime)));

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
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
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
            {/* Fill the below details for add a registration form */}
            {/* This schedule will be displayed on the schedule page. */}
            {/* <br /> */}
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
            {/* <section className="rounded-lg border bg-[#f7f7f7] px-5 py-3">
              <p className="text-sm font-semibold leading-tight">
                Hide this form instead ?{" "}
              </p>
              <p className="mt-1 text-sm leading-tight">
                When you hide a form, it will no longer appear in the list of
                forms on the registration page. You can unhide it at any time.
              </p>

              <Button size="sm" variant="default" className="mt-3">
                Hide this form
              </Button>
            </section> */}

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
            <form className="space-y-3">
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

                {/* Event Date */}
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

                  {/* Time */}
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
