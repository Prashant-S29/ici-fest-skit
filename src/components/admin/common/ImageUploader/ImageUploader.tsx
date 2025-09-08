/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Image from "next/image";

// Zod, RDZ and RHF
import type { z } from "zod";
import { useDropzone } from "react-dropzone";
import {
  useFormContext,
  Controller,
  type UseFormReturn,
  type UseFormSetValue,
} from "react-hook-form";

// utils
import { cn } from "@/lib/utils";

// Icons
import { UploadIcon } from "@/icons";
import { X } from "lucide-react";

// Components
// import { Button, ToastProps } from "@/components/ui";

// Schema
import type { CreateCoordinatorManagedData } from "@/schema/event.schema";
import { useToast } from "@/hooks";
import { useImageUploader } from "@/global/hooks";
import { ImagePreview } from "@/components/common";
// import { handleFileDelete, utapi } from "@/utils/uploadthing";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

interface FileWithPreview extends File {
  preview: string;
}

interface ImageUploadFieldProps {
  maxFiles?: number;
  minFiles?: number;
  maxSizePerFileInMB?: number;
  form: UseFormReturn<
    z.infer<typeof CreateCoordinatorManagedData>,
    any,
    undefined
  >;
  isFormSubmitting: boolean;
  uploadedImages?: string[];
  slug: string;
}

// Custom hook to manage file upload logic

interface UseImageUploadFieldProps {
  maxFiles: number;
  maxSizePerFileInMB: number;
  setValue: UseFormSetValue<z.infer<typeof CreateCoordinatorManagedData>>;
  setStagedFiles: (files: FileWithPreview[]) => void;
  stagedFiles: FileWithPreview[];
  images: FileWithPreview[];
  setImages: (images: FileWithPreview[]) => void;
  slug: string;
}

const useImageUpload = ({
  maxFiles,
  maxSizePerFileInMB,
  setValue,
  setStagedFiles,
  stagedFiles,
  images,
  setImages,
  slug
}: UseImageUploadFieldProps) => {
  const { toast } = useToast();

  const onDrop = (acceptedFiles: File[]) => {
    const currentFiles = stagedFiles || [];

    // Validate file count
    const totalFiles = currentFiles.length + acceptedFiles.length;

    // check for max
    if (totalFiles > maxFiles) {
      // toast("")
      toast({
        title: "File upload limit reached",
        description: `Maximum of ${maxFiles} files allowed`,
        variant: "destructive",
      });
      // alert(`Maximum of ${maxFiles} files allowed`);
      return;
    }

    // Add preview to accepted files and validate size
    const validFiles: FileWithPreview[] = acceptedFiles
      .filter((file) => {
        // Check file size (convert MB to bytes)
        if (file.size > maxSizePerFileInMB * 1024 * 1024) {
          toast({
            title: "File Size exceeds",
            description: `File ${file.name} exceeds ${maxSizePerFileInMB} MB limit`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      })
      // .map((file) =>
      //   Object.assign(file, {
      //     preview: URL.createObjectURL(file),
      //   }),
      // );

      .map((file, index) => {
        const renamedFile = new File(
          [file],
          `${slug}_image_${index + 1}${file.name.substring(file.name.lastIndexOf("."))}`, // Add index and preserve file extension
          { type: file.type },
        );

        return Object.assign(renamedFile, {
          preview: URL.createObjectURL(renamedFile),
        });
      });

    // Combine existing and new files
    const updatedFiles = [...currentFiles, ...validFiles].slice(0, maxFiles);
    setStagedFiles(updatedFiles);

    // set files to global hook
    setImages(updatedFiles);

    // update field value
    const currentStagedFiles = updatedFiles.map((file) => file.preview);
    setValue("images", currentStagedFiles, { shouldValidate: true });
  };

  const removeFile = (fileToRemove: FileWithPreview) => {
    // Ensure stagedFiles is properly initialized
    const currentFiles = stagedFiles || [];

    // Filter out the file to remove
    const updatedFiles = currentFiles.filter(
      (file) => file.preview !== fileToRemove.preview,
    );

    // set files to global hook
    setImages(updatedFiles);

    // Revoke the old preview URL to free up resources
    URL.revokeObjectURL(fileToRemove.preview);

    // Update the form field value with the updated files
    const currentStagedFiles = updatedFiles.map((file) => file.preview);
    setValue("images", currentStagedFiles, { shouldValidate: true });

    // Update the local state to reflect the changes
    setStagedFiles(updatedFiles);
  };

  return { onDrop, removeFile };
};

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  maxFiles = 5,
  maxSizePerFileInMB = 4,
  form,
  isFormSubmitting,
  uploadedImages,
  slug,
}) => {
  const { control, setValue } = useFormContext<
    z.infer<typeof CreateCoordinatorManagedData>,
    any,
    undefined
  >();

  const router = useRouter();

  const [stagedFiles, setStagedFiles] = useState<FileWithPreview[]>([]);

  // hook to handle image upload to uploadthing
  const { images, setImages } = useImageUploader();

  // Use the custom hook
  const { onDrop, removeFile } = useImageUpload({
    maxFiles,
    maxSizePerFileInMB,
    setValue,
    setStagedFiles,
    stagedFiles,
    images,
    setImages,
    slug
  });

  // Use dropzone hook
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".webp"],
    },
    multiple: true,
    maxFiles,
    disabled: isFormSubmitting,
  });

  const deleteFilesMutation = api.file.deleteFiles.useMutation();
  const [isImageDeleting, setIsImageDeleting] = useState(false);

  const updateImageMutation = api.event.updateImages.useMutation();

  const [isAllImagesDeleted, setIsAllImagesDeleted] = useState(false);
  const [uploadedImagesLength, setUploadedImagesLength] = useState(
    uploadedImages ? uploadedImages.length : 0,
  );

  const updateReviewRequestStatusMutation =
    api.event.updateReviewRequestStatus.useMutation();

  const deleteUploadedImage = async ({
    url,
    setIsDeleting,
    setIsDeleted,
  }: {
    url: string;
    setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDeleted: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    setIsDeleting(true);
    setIsImageDeleting(true);

    const res = await deleteFilesMutation.mutateAsync({
      fileUrls: [url],
    });

    if (res.success) {
      if (!uploadedImages) return;

      const imageUpdateRes = await updateImageMutation.mutateAsync({
        slug,
        images: uploadedImages.filter((file) => file !== url),
      });

      if (imageUpdateRes.id) {
        uploadedImages = uploadedImages.filter((file) => file !== url);
        setUploadedImagesLength((preVal) => preVal - 1);

        await updateReviewRequestStatusMutation.mutateAsync({
          slug,
          status: "PENDING",
        });

        if (uploadedImages.length === 0) setIsAllImagesDeleted(true);
        setIsDeleted(true);
        toast.success("Image deleted successfully");
        // router.
        location.reload();
        return;
      }

      // setValue("images", uploadedImages.filter((file) => file !== url));

      setIsDeleting(false);
      setIsImageDeleting(false);
      return;
    }

    setIsDeleting(false);
    setIsImageDeleting(false);
    toast.error("Error deleting image");
  };
  return (
    <Controller
      name="images"
      control={control}
      render={() => {
        return (
          <div className="w-full">
            {/* Dropzone Area */}
            <div
              {...getRootProps()}
              className={cn(
                "group cursor-pointer rounded-xl border-2 border-dashed p-6 text-center",
                "flex h-[150px] items-center justify-center transition-colors duration-200",

                isFormSubmitting
                  ? "cursor-not-allowed hover:border-gray-200"
                  : isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-gray-300 hover:border-primary",
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center">
                <UploadIcon
                  className={cn(
                    "mb-1 h-7 w-7",
                    isDragActive ? "text-primary" : "text-gray-500",
                  )}
                />
                {isDragActive ? (
                  <p className="text-sm font-medium">Drop here</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      Drag n drop some files here
                    </p>
                    <p className="text-xs leading-none text-gray-500">
                      or click to select files (
                      {uploadedImages
                        ? uploadedImagesLength + stagedFiles.length
                        : stagedFiles.length}
                      /5)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Preview Grid */}
            {stagedFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-black/70">New Upload(s)</p>
                <div className="mt-1 grid grid-cols-5 gap-4">
                  {stagedFiles.map((file) => (
                    <div key={file.preview} className="group relative">
                      <ImagePreview src={file.preview} key={file.preview}>
                        <Image
                          src={file.preview}
                          alt={file.name || "helloWorld"}
                          width={200}
                          height={200}
                          className="h-24 w-full rounded-lg border object-cover"
                          // onLoad={() => URL.revokeObjectURL(file.preview)}
                        />
                      </ImagePreview>
                      <Button
                        size="icon"
                        type="button"
                        disabled={isImageDeleting}
                        onClick={() => removeFile(file)}
                        className="absolute right-1 top-1 h-auto w-fit rounded-full bg-red-500 p-1 text-white opacity-0 shadow-none transition-opacity hover:bg-red-500 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* {JSON.stringify(uploadedImages)} */}

            {/* {uploadedImages && uploadedImages.length > 0 && (
              <div>
                {uploadedImages.map((file, index) => (
                  <p key={index}>{file}</p>
                ))}
              </div>
            )} */}

            {/* Uploaded Image Grid*/}
            {!isAllImagesDeleted &&
              uploadedImages &&
              uploadedImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-black/70">Uploaded Image(s)</p>
                  <div className="mt-1 grid grid-cols-5 gap-4">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="group relative">
                        <ImageContainer
                          uploadedImage={file}
                          deleteUploadedImage={deleteUploadedImage}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        );
      }}
    />
  );
};

const ImageContainer = ({
  uploadedImage,
  deleteUploadedImage,
}: {
  uploadedImage: string;
  deleteUploadedImage: ({
    url,
    setIsDeleted,
  }: {
    url: string;
    setIsDeleted: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
  }) => Promise<void>;
}) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className={`group relative ${isDeleted && "hidden"}`}>
      <ImagePreview src={uploadedImage} loading={isDeleting}>
        <Image
          src={uploadedImage}
          alt="hello"
          width={200}
          height={200}
          className="h-24 w-full rounded-lg border object-cover"
          unoptimized
        />
      </ImagePreview>
      <Button
        size="icon"
        type="button"
        loading={isDeleting}
        disabled={isDeleting}
        // onClick={() => removeFile(file)}
        onClick={async () =>
          await deleteUploadedImage({
            url: uploadedImage,
            setIsDeleted: setIsDeleted,
            setIsDeleting: setIsDeleting,
          })
        }
        className="absolute right-1 top-1 h-auto w-fit rounded-full bg-red-500 p-1 text-white opacity-0 shadow-none transition-opacity hover:bg-red-500 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
