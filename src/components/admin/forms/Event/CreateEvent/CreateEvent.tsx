/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Zod and RHF
import type { z } from "zod";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// tRPC
// import { TRPCError } from "@trpc/server";

// Hooks
import { useMounted } from "@/hooks";
// import { api } from "@/trpc/server";

// Schema
import {
  CreateEventSchema,
  type PartialUpdateEventSchema,
} from "@/schema/event.schema";

// utils and Global Hooks
import { createUpload } from "@/utils/uploadthing";
import { useCoverImageUploader, useImageUploader } from "@/global/hooks";
import { EVENT_FORM_DEFAULTS } from "@/global/formDefaults";
import { api } from "@/trpc/react";

// Data
import { CreateEventFormData } from "./data";

// Components
import { Button, Form } from "@/components/ui";
import { RegistrationFormDialog } from "../RegistrationFormDialog";
import { RegistrationFormUpdateDialog } from "../RegistrationFormUpdateDialog";
import { ScheduleFormDialog } from "../ScheduleFormDialog";
import { ScheduleFormUpdateDialog } from "../ScheduleFormUpdateDialog";
import { FormFieldProvider } from "../../FieldsProvider";
import { CoordinatorFormDialog } from "../CoordinatorFormDialog";
import { CoordinatorFormUpdateDialog } from "../CoordinatorFormUpdateDialog";
import { EventWindow } from "../EventWindow";
import { toast } from "sonner";
import { FormLoader } from "../FormLoader";
import { checkIfEventExists } from "@/utils/apis";
import { createTRPCContext } from "@/server/api/trpc";

// Type inference for the form schema
type CreateEventFormDataType = z.infer<typeof CreateEventSchema>;

interface Props {
  data?: z.infer<typeof PartialUpdateEventSchema>;
  state: "CREATE" | "UPDATE";
}

export const CreateEventForm: React.FC<Props> = ({ data }) => {
  const isMounted = useMounted();
  const router = useRouter();

  // Delete event mutation
  const deleteEventMutation = api.event.deleteEventBySlug.useMutation();


  const [isEventDeleting, setIsEventDeleting] = useState(false);

  // handling event window
  const [showEventWindow, setShowEventWindow] = useState(false);

  // Create event mutation
  const createEventMutation = api.event.createEvent.useMutation();

  // Update event mutation
  const updateEventMutation = api.event.updateEventById.useMutation();

  // const { images } = useImageUploader();
  // const { images: coverImage } = useCoverImageUploader();

  const { id, ...restData } = data ?? {};

  const form = useForm<CreateEventFormDataType>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: data ? restData : EVENT_FORM_DEFAULTS,
  });

  // Registration From Array
  const registrationFormArray = useFieldArray({
    control: form.control,
    name: "registrationForm",
  });

  // Schedule From Array
  const scheduleFormArray = useFieldArray({
    control: form.control,
    name: "schedule",
  });

  // Coordinator From Array
  const coordinatorFormArray = useFieldArray({
    control: form.control,
    name: "coordinators",
  });

  // handle file upload
  // const handleImagesUpload = async () => {
  //   if (images.length === 0) return;

  //   const { done } = await createUpload("imageUploader", {
  //     files: images,
  //   });

  //   const data = await done();
  //   form.setValue(
  //     "images",
  //     data.map((file) => file.url),
  //   );
  // };

  // const handleCoverImagesUpload = async () => {
  //   if (coverImage.length === 0) return;

  //   const { done } = await createUpload("imageUploader", {
  //     files: coverImage,
  //   });

  //   const data = await done();
  //   form.setValue("coverImage", data[0]?.url || "");
  // };

  const handleFormSubmit: SubmitHandler<
    z.infer<typeof CreateEventSchema>
  > = async () => {
    const formData = { ...data, ...form.getValues() };
    try {
      if (data) {
        if (data.slug !== formData.slug) {
          const isEventExists = await checkIfEventExists({
            slug: formData.slug,
          });
          if (isEventExists) {
            toast.error("Event with this id already exists");
            return;
          }
        }
        await updateEventMutation.mutateAsync(formData);
        toast.success("Event updated successfully");
      } else {
        const isEventExists = await checkIfEventExists({ slug: formData.slug });
        if (isEventExists) {
          toast.error("Event with this id already exists");
          return;
        }
        await createEventMutation.mutateAsync(formData);
        toast.success("Event created successfully");
        setShowEventWindow(true);
      }

      form.reset(EVENT_FORM_DEFAULTS);
      router.push("/admin/dashboard/events");
    } catch (error) {
      console.log("error", error);
      toast.error(`Error in ${data ? "updating" : "creating"} event`, {
        description: JSON.stringify(error),
      });
    }
  };

  const handleDeleteEvent = async () => {
    if (data?.slug) {
      setIsEventDeleting(true);
      await deleteEventMutation.mutateAsync({ slug: data.slug });
      toast.success("Event deleted successfully");
      setIsEventDeleting(false);
      router.push("/admin/dashboard/events");
    }
  };

  if (!isMounted) {
    return <FormLoader />;
  }

  return (
    <div>
      {showEventWindow && (
        <EventWindow
          open={showEventWindow}
          setOpen={setShowEventWindow}
          eventId={form.getValues("slug")}
          eventName={form.getValues("title")}
          eventDbPassword={form.getValues("dbPassword")}
          eventDbURL={`https://icifest.skit.ac.in/event/${form.getValues("slug")}/dashboard`}
        />
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="mt-5 space-y-3"
        >
          {/* Form Header and Submit button */}
          <section className="flex items-center justify-between">
            <section>
              <h1 className="text-lg font-semibold leading-tight">
                {data ? (
                  <span>
                    Update Event{" "}
                    <span className="text-black/50">({data.title})</span>
                  </span>
                ) : (
                  "Add New Event"
                )}
              </h1>
              <p className="text-black/70">Update the event details below.</p>
            </section>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                type="submit"
                className="w-full"
                loading={form.formState.isSubmitting || isEventDeleting}
                disabled={form.formState.isSubmitting || isEventDeleting}
              >
                {data ? "Update Event" : "Add Event"}
              </Button>
            </div>

            {/* {JSON.stringify(form.formState.errors)} */}
          </section>

          {CreateEventFormData.map((category, index) => (
            <div key={index} className="overflow-hidden rounded-xl border">
              <div className="border-b bg-white px-5 py-4">
                <p className="text-sm font-semibold">{category.category}</p>
              </div>
              <div className="flex flex-col gap-5 bg-white px-5 py-4">
                {category.fields.map((field, index) => (
                  <FormFieldProvider
                    key={index}
                    field={field}
                    form={form}
                    isFormSubmitting={form.formState.isSubmitting }
                    isEventDeleting={isEventDeleting}
                  />
                ))}

                {category.categoryId === "registration" && (
                  <div>
                    <div className="gap-[50px]">
                      <section className="flex items-center justify-between">
                        <section className="min-w-[400px] max-w-[400px]">
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: form.getFieldState("registrationForm")
                                .invalid
                                ? "#ef4444"
                                : "black",
                            }}
                          >
                            Registration Forms (
                            {form.getValues("registrationForm").length})
                          </p>
                          <p className="text-xs text-gray-500">
                            These forms will be displayed on the registration
                            page.
                          </p>
                        </section>
                        <div className="flex justify-between">
                          <RegistrationFormDialog
                            append={registrationFormArray.append}
                            state="CREATE"
                            isFormSubmitting={form.formState.isSubmitting}
                          />

                          {/* {JSON.stringify(
                            ,
                          )} */}
                        </div>
                      </section>
                      {form.getFieldState("registrationForm").invalid && (
                        <p className="mt-1 text-xs font-medium text-destructive">
                          {
                            form.getFieldState("registrationForm").error
                              ?.message
                          }
                        </p>
                      )}

                      {/* {JSON.stringify(registrationFormArray.fields)} */}
                    </div>

                    {registrationFormArray.fields.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {registrationFormArray.fields.map((field, index) => (
                          <RegistrationFormUpdateDialog
                            key={index}
                            data={field}
                            update={registrationFormArray.update}
                            updateIndex={index}
                            remove={registrationFormArray.remove}
                            removeIndex={index}
                            isFormSubmitting={form.formState.isSubmitting}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {category.categoryId === "schedule" && (
                  <div>
                    <div className="gap-[50px]">
                      <section className="flex items-center justify-between">
                        <section className="min-w-[400px] max-w-[400px]">
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: form.getFieldState("schedule").invalid
                                ? "#ef4444"
                                : "black",
                            }}
                          >
                            Schedules ({form.getValues("schedule").length})
                          </p>
                          <p className="text-xs text-gray-500">
                            These schedules will be displayed on the schedule
                            section.
                          </p>
                        </section>
                        <div className="flex justify-between">
                          <ScheduleFormDialog
                            append={scheduleFormArray.append}
                            state="CREATE"
                            isFormSubmitting={form.formState.isSubmitting}
                          />
                        </div>
                      </section>
                      {form.getFieldState("schedule").invalid && (
                        <p className="mt-1 text-xs font-medium text-destructive">
                          {form.getFieldState("schedule").error?.message}
                        </p>
                      )}
                    </div>

                    {scheduleFormArray.fields.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {scheduleFormArray.fields.map((field, index) => (
                          <ScheduleFormUpdateDialog
                            key={index}
                            data={field}
                            update={scheduleFormArray.update}
                            updateIndex={index}
                            remove={scheduleFormArray.remove}
                            removeIndex={index}
                            isFormSubmitting={form.formState.isSubmitting}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Coordinators */}
                {category.categoryId === "coordinators" && (
                  <div>
                    <div className="gap-[50px]">
                      <section className="flex items-center justify-between">
                        <section className="min-w-[400px] max-w-[400px]">
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: form.getFieldState("coordinators").invalid
                                ? "#ef4444"
                                : "black",
                            }}
                          >
                            Coordinators (
                            {form.getValues("coordinators").length || 0})
                          </p>
                          <p className="text-xs text-gray-500">
                            These will be displayed on the event page.
                          </p>
                        </section>
                        <div className="flex justify-between">
                          <CoordinatorFormDialog
                            append={coordinatorFormArray.append}
                            state="CREATE"
                            isFormSubmitting={form.formState.isSubmitting}
                          />
                        </div>
                      </section>
                      {form.getFieldState("coordinators").invalid && (
                        <p className="mt-1 text-xs font-medium text-destructive">
                          {form.getFieldState("coordinators").error?.message}
                        </p>
                      )}
                    </div>

                    {/* {JSON.stringify(coordinatorFormArray.fields)} */}

                    {coordinatorFormArray.fields.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {coordinatorFormArray.fields.map((field, index) => (
                          <CoordinatorFormUpdateDialog
                            key={index}
                            data={field}
                            update={coordinatorFormArray.update}
                            updateIndex={index}
                            remove={coordinatorFormArray.remove}
                            removeIndex={index}
                            isFormSubmitting={form.formState.isSubmitting}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {data && (
            <div className="overflow-hidden rounded-xl border border-destructive">
              <div className="border-b border-destructive bg-white px-5 py-4">
                <p className="text-sm font-semibold">Delete Zone</p>
              </div>
              <div className="flex gap-5 bg-white px-5 py-4">
                <div className="min-w-[400px] max-w-[400px]">
                  <p className="text-sm font-medium leading-tight">
                    Delete this Event
                  </p>
                  <p className="text-xs text-black/70">
                    This action cannot be undone.
                    <br />
                    <span className="font-medium">
                      If you are not sure what to do, consider hiding the event
                      instead.
                    </span>
                  </p>
                </div>
                <div className="flex w-full justify-end">
                  <Button
                    size="sm"
                    variant="destructive"
                    type="submit"
                    className="w-fit"
                    loading={form.formState.isSubmitting || isEventDeleting}
                    disabled={form.formState.isSubmitting || isEventDeleting}
                    onClick={handleDeleteEvent}
                  >
                    Delete Event
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};
