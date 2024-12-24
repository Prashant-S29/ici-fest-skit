/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Zod and RHF
import type { z } from "zod";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Hooks
import { useMounted } from "@/hooks";
// import { api } from "@/trpc/server";

// Components
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  Textarea,
} from "@/components/ui";

import {
  CreateCoordinatorManagedData,
  CreateEventScheduleSchema,
  PartialUpdateEventScheduleSchema,
  type PartialUpdateCoordinatorManagedData,
} from "@/schema/event.schema";
import {
  COORDINATOR_FORM_DEFAULTS,
  COORDINATOR_MANAGED_FORM_DEFAULTS,
} from "@/global/formDefaults";
import { CreateEventInfoFormData } from "./data";
import { EventInfoFieldProvider } from "@/components/admin/forms/EventInfoFieldProvider";
import { ScheduleFormDialog } from "@/components/admin/forms/Event/ScheduleFormDialog";
import { DeleteIcon } from "@/icons";
import { convertMinsToTimeString } from "@/utils/timeHandler";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useCoverImageUploader, useImageUploader } from "@/global/hooks";
import { createUpload } from "@/utils/uploadthing";

// Type inference for the form schema
type CreateCoordinatorManagedDataType = z.infer<
  typeof CreateCoordinatorManagedData
>;

interface Props {
  data?: z.infer<typeof PartialUpdateCoordinatorManagedData>;
  slug: string;
  state: "CREATE" | "UPDATE";
}

export const EventInfoForm: React.FC<Props> = ({
  data,
  state,
  slug,
}) => {
  //   const updateEventMutation = api.event.updateEventInfoBySlug.useMutation();

  const { images: coverImage, setImages: setCoverImage } =
    useCoverImageUploader();
  const { images: images, setImages: setImages } = useImageUploader();

  const form = useForm<CreateCoordinatorManagedDataType>({
    resolver: zodResolver(CreateCoordinatorManagedData),
    defaultValues: COORDINATOR_MANAGED_FORM_DEFAULTS,
  });

  // handle file upload
  const handleImagesUpload = async () => {
    if (images.length === 0) return;

    const { done } = await createUpload("imageUploader", {
      files: images,
    });

    const data = await done();
    form.setValue(
      "images",
      data.map((file) => file.url),
    );
  };

  const handleCoverImagesUpload = async () => {
    if (coverImage.length === 0) return;

    const { done } = await createUpload("imageUploader", {
      files: coverImage,
    });

    const data = await done();
    form.setValue("coverImage", data[0]?.url || "");
  };

//   const onSubmit = async () => {
//     // console.log(data);

//     try {
//       await handleImagesUpload();
//       await handleCoverImagesUpload();

//       const updatedData = form.getValues();

//       const res = await updateEventMutation.mutateAsync({
//         ...updatedData,
//         slug,
//       });
//       toast.success("Event info updated successfully");
//       form.reset(EVENT_INFO_FORM_DEFAULTS);
//       console.log(res);
//     } catch (error) {
//       console.log(error);
//       toast.error("Error updating event info");
//       form.reset(EVENT_INFO_FORM_DEFAULTS);
//     }
//   };

  return (
    <div>
      <div className="w-full">
        <Form {...form}>
          <form
            // onSubmit={form.handleSubmit(onSubmit)}
            className="mt-5 space-y-3"
          >
            <div className="mt-5 flex w-full items-center justify-between rounded-lg border bg-white px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold">Event Information</h3>
                <p className="text-xs text-black/70">
                  Please fill the below details for the event. These details
                  will be displayed on the event page.
                </p>
              </div>
              <Button
                loading={form.formState.isSubmitting}
                disabled={form.formState.isSubmitting}
                size="sm"
                variant="default"
              >
                Update Event Details
              </Button>
            </div>

            {/* {JSON.stringify(images)} */}

            {CreateEventInfoFormData.map((category, index) => (
              <div key={index} className="overflow-hidden rounded-xl border">
                <div className="border-b bg-white px-5 py-4">
                  <p className="text-sm font-semibold">
                    {category.category}{" "}
                    {category.isOptional && (
                      <span className="italic text-black/50">(optional)</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col gap-5 bg-white px-5 py-4">
                  {category.fields.map((field, index) => (
                    <EventInfoFieldProvider
                      key={index}
                      field={field}
                      form={form}
                      isFormSubmitting={form.formState.isSubmitting}
                    />
                  ))}

                  {/* Structure */}
                  {/* {category.categoryId === "structure" && (
                    <div>
                      <div className="gap-[50px]">
                        <section className="flex justify-between gap-[50px]">
                          <section className="min-w-[400px] max-w-[400px]">
                            <p className="text-sm font-medium">Schedule Info</p>
                            <p className="text-xs text-black/70">
                              Explain what will be happening on these schedules.
                            </p>
                          </section>
                          <div className="grid w-full grid-cols-2 gap-3">
                            {schedule && schedule.length > 0 ? (
                              schedule.map((scheduleData, index) => (
                                <ScheduleFormDialog
                                  key={index}
                                  data={{
                                    date: scheduleData.date,
                                    startTime: scheduleData.startTime,
                                    endTime: scheduleData.endTime,
                                    venue: scheduleData.venue,
                                    title: scheduleData.title,
                                    info: scheduleData.info
                                      ? scheduleData.info
                                      : "",
                                    id: scheduleData.id || "",
                                  }}
                                  updateIndex={index}
                                  setAllSchedulesInfo={setAllSchedulesInfo}
                                  state="UPDATE_BY_COORDINATOR"
                                  isFormSubmitting={form.formState.isSubmitting}
                                  trigger={
                                    <div className="w-full cursor-pointer rounded-md border px-3 py-2">
                                      <p className="text-xs text-black/70">
                                        {scheduleData.title} &#x2022;{" "}
                                        {convertMinsToTimeString(
                                          scheduleData.startTime || 0,
                                        )}{" "}
                                        -{" "}
                                        {convertMinsToTimeString(
                                          scheduleData.endTime || 0,
                                        )}{" "}
                                        &#x2022; {scheduleData.venue}
                                      </p>
                                      {allSchedulesInfo && (
                                        <p className="mt-1 line-clamp-3 text-xs">
                                          Info -{" "}
                                          {allSchedulesInfo[index]?.info ||
                                            "not provided"}
                                        </p>
                                      )}
                                    </div>
                                  }
                                />
                              ))
                            ) : (
                              <p>No schedules added yet</p>
                            )}
                          </div>
                        </section>
                      </div>
                    </div>
                  )} */}
                </div>
              </div>
            ))}
          </form>
        </Form>
      </div>
    </div>
  );
};
