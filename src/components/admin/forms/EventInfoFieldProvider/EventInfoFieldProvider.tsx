"use client";

import React, { useState } from "react";

// Icons
import { CopyIcon, EveHidden, EyeVisible } from "@/icons";

// Types
import type { CreateCoordinatorManageFormFieldConfigProps } from "@/types";

// Zod and RHF
import { type z } from "zod";
import { type UseFormReturn } from "react-hook-form";

// Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Input,
  Textarea,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
} from "@/components/ui";
import { ImageUploadField } from "../../common/ImageUploader";
import { toast } from "sonner";

// Utils and custom hooks
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks";

// schemas
import type { CreateCoordinatorManagedData } from "@/schema/event.schema";
import { CoverImageUploadField } from "../../common/CoverImageUploader";

interface Props {
  field: CreateCoordinatorManageFormFieldConfigProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<z.infer<typeof CreateCoordinatorManagedData>, any, undefined>;
  isFormSubmitting: boolean;
}

export const EventInfoFieldProvider: React.FC<Props> = ({
  field,
  form,
  isFormSubmitting,
}) => {
  return (
    <FormField
      key={field.fieldName}
      control={form.control}
      name={field.fieldName}
      render={({ field: fieldProps }) => (
        <FormItem className="flex gap-[50px] space-y-0">
          <div className="min-w-[400px] max-w-[400px]">
            <FormLabel className="leading-tight">{field.fieldTitle}</FormLabel>
            <FormDescription className="text-xs text-black/70">
              {field.fieldDescription}
            </FormDescription>
          </div>
          <FormControl className="m-0">
            <div className="w-full">
              {field.fieldType.type === "input" ? (
                <div className="w-full">
                  <Input
                    placeholder={field.fieldPlaceholder}
                    className={cn(
                      field.className,
                      "w-full px-5 py-5 font-medium",
                    )}
                    {...fieldProps}
                    disabled={isFormSubmitting}
                    type={field.fieldDataType}
                  />
                </div>
              ) : field.fieldType.type === "textarea" ? (
                <Textarea
                  placeholder={field.fieldPlaceholder}
                  className={cn(
                    field.className,
                    "w-full px-5 py-4 font-medium",
                  )}
                  // type={field.fieldDataType}
                  {...fieldProps}
                  value={
                    fieldProps.value as
                      | string
                      | number
                      | readonly string[]
                      | undefined
                  }
                />
              ) : field.fieldType.type === "select" ? (
                <Select
                  onValueChange={fieldProps.onChange}
                  defaultValue={
                    fieldProps.value ? fieldProps.value.toString() : ""
                  }
                  disabled={isFormSubmitting}
                >
                  <SelectTrigger className="h-[44px] px-5">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.fieldType.options?.map((option, index) => (
                      <SelectItem key={index} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.fieldType.type === "upload" &&
                field.fieldName === "images" ? (
                <div>
                  <ImageUploadField
                    maxFiles={5}
                    maxSizePerFileInMB={4}
                    form={form}
                    isFormSubmitting={isFormSubmitting}
                  />
                </div>
              ) : (
                <div>
                  <CoverImageUploadField
                    maxFiles={1}
                    maxSizePerFileInMB={4}
                    form={form}
                    isFormSubmitting={isFormSubmitting}
                    
                  />
                </div>
              )}
              <FormMessage className="mt-1 px-1 text-xs" />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};
