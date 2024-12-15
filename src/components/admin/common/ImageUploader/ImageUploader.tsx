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
import type { CreateEventSchema } from "@/schema/event.schema";
import { useToast } from "@/hooks";
import { useImageUploader } from "@/global/hooks";

interface FileWithPreview extends File {
  preview: string;
}

interface ImageUploadFieldProps {
  maxFiles?: number;
  minFiles?: number;
  maxSizePerFileInMB?: number;
  form: UseFormReturn<z.infer<typeof CreateEventSchema>, any, undefined>;
  isFormSubmitting: boolean;
}

// Custom hook to manage file upload logic

interface UseImageUploadFieldProps {
  maxFiles: number;
  maxSizePerFileInMB: number;
  setValue: UseFormSetValue<z.infer<typeof CreateEventSchema>>;
  setStagedFiles: (files: FileWithPreview[]) => void;
  stagedFiles: FileWithPreview[];
  images: FileWithPreview[];
  setImages: (images: FileWithPreview[]) => void;
}

const useImageUpload = ({
  maxFiles,
  maxSizePerFileInMB,
  setValue,
  setStagedFiles,
  stagedFiles,
  images,
  setImages,
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
      .map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      );

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
}) => {
  const { control, setValue } = useFormContext<
    z.infer<typeof CreateEventSchema>,
    any,
    undefined
  >();

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
                      or click to select files
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Preview Grid */}
            {stagedFiles.length > 0 && (
              <div>
                <div className="mt-4 grid grid-cols-5 gap-4">
                  {stagedFiles.map((file) => (
                    <div key={file.preview} className="group relative">
                      <Image
                        src={file.preview}
                        alt={file.name || "helloWorld"}
                        width={200}
                        height={200}
                        className="h-24 w-full rounded-lg border object-cover"
                        onLoad={() => URL.revokeObjectURL(file.preview)}
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(file)}
                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* <div className="mt-2">
                  <Button
                    size="sm"
                    disabled={isUploading}
                    onClick={() => handleFileUpload()}
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div> */}
              </div>
            )}
          </div>
        );
      }}
    />
  );
};
