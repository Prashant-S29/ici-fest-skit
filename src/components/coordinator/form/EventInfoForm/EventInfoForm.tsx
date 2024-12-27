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

export const EventInfoForm: React.FC<Props> = ({ data, state, slug }) => {
  const updateCoordinatorManagedDataMutation =
    api.event.updateCoordinatorManagedDataById.useMutation();

  const updateReviewRequestStatusMutation =
    api.event.updateReviewRequestStatus.useMutation();

  const { images: coverImage, setImages: setCoverImage } =
    useCoverImageUploader();
  const { images: images, setImages: setImages } = useImageUploader();

  const form = useForm<CreateCoordinatorManagedDataType>({
    resolver: zodResolver(CreateCoordinatorManagedData),
    defaultValues: data ?? COORDINATOR_MANAGED_FORM_DEFAULTS,
  });

  // handle file upload
  const handleImagesUpload = async () => {
    if (images.length === 0) {
      return [];
    }

    const { done } = await createUpload("imageUploader", {
      files: images,
    });

    const data = await done();
    form.setValue(
      "images",
      data.map((file) => file.url),
    );

    const uploadedImages = data.map((file) => file.url);

    return uploadedImages;
  };

  const handleCoverImagesUpload = async () => {
    if (coverImage.length === 0) {
      return "";
    }

    const { done } = await createUpload("imageUploader", {
      files: coverImage,
    });

    const data = await done();
    form.setValue("coverImage", data[0]?.url || "");

    const uploadedCoverImage = data[0]?.url || "";
    return uploadedCoverImage;
  };

  const onSubmit = async () => {
    const updatedData = form.getValues();
    console.log(updatedData);

    try {
      const images = await handleImagesUpload();
      const coverImage = await handleCoverImagesUpload();

      const res = await updateCoordinatorManagedDataMutation.mutateAsync({
        slug,
        ...updatedData,
        images: data?.images ? [...data.images, ...images] : images,
        coverImage: data?.coverImage ? data.coverImage : coverImage,
      });

      await updateReviewRequestStatusMutation.mutateAsync({
        slug,
        status: "PENDING",
      });

      console.log(res);
      toast.success("Event info updated successfully");
      // form.reset(COORDINATOR_MANAGED_FORM_DEFAULTS);
      // console.log(res);
    } catch (error) {
      console.log(error);
      toast.error("Error updating event info");

      // form.reset(COORDINATOR_MANAGED_FORM_DEFAULTS);
    }
    location.reload();
  };

  return (
    <div>
      <div className="w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
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
                      uploadedImages={data?.images}
                      slug={slug}
                      uploadedCoverImage={data?.coverImage}
                    />
                  ))}
                </div>
              </div>
            ))}
          </form>
        </Form>
      </div>
    </div>
  );
};
