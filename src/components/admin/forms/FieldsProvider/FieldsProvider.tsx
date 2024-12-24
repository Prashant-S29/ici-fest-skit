"use client";

import React, { useState } from "react";

// Icons
import { CopyIcon, EveHidden, EyeVisible } from "@/icons";

// Types
import type { CreateEventFormFieldConfigProps } from "@/types";

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
import type { CreateEventSchema } from "@/schema/event.schema";
import { CoverImageUploadField } from "../../common/CoverImageUploader";

interface Props {
  field: CreateEventFormFieldConfigProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<z.infer<typeof CreateEventSchema>, any, undefined>;
  isFormSubmitting: boolean;
  isEventDeleting: boolean;
}

export const FormFieldProvider: React.FC<Props> = ({
  field,
  form,
  isFormSubmitting,
  isEventDeleting,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { copyToClipboard } = useCopyToClipboard();

  // Generate Password
  const generatePassword = () => {
    const password = Math.random().toString(36).substring(2, 15);
    form.clearErrors("dbPassword");
    form.setValue("dbPassword", password);
    handleCopyPassword(password);

    return password;
  };

  // Copy Password
  const handleCopyPassword = (password: string | undefined) => {
    if (!password) return;
    copyToClipboard(password);
    toast.info("Password Copied");
  };

  // Copy Slug
  const handleCopySlug = (slug: string | undefined) => {
    if (!slug) return;
    copyToClipboard(slug);
    toast.info("Event Id Copied", {
      description: "Event Id has been copied to clipboard.",
    });
  };
  const formatTitle = (title: string): string => {
    // Allow only letters (a-z, A-Z) and spaces
    let formattedTitle = title.replace(/[^a-zA-Z\s]/g, "");

    // Prevent consecutive spaces but allow single spaces
    formattedTitle = formattedTitle.replace(/ {2,}/g, " ");

    // Trim leading and trailing spaces
    return formattedTitle;
  };

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
                <div className="flex w-full gap-3">
                  <div className="relative w-full">
                    <Input
                      placeholder={field.fieldPlaceholder}
                      className={cn(
                        field.className,
                        "w-full px-5 py-5 font-medium",
                      )}
                      type={
                        field.fieldName === "dbPassword"
                          ? showPassword
                            ? "text"
                            : "password"
                          : field.fieldDataType
                      }
                      {...fieldProps}
                      value={
                        fieldProps.value as
                          | string
                          | number
                          | readonly string[]
                          | undefined
                      }
                      onChange={(e) => {
                        fieldProps.onChange(e);
                        let value = e.target.value;

                        // Restrict special characters for 'title' and 'slug'
                        if (
                          field.fieldName === "title"
                          // field.fieldName === "slug"
                        ) {
                          value = formatTitle(value);
                          fieldProps.onChange(value);

                          // Generate slug
                          form.setValue(
                            "slug",
                            value.toLowerCase().replaceAll(" ", "-"),
                          );
                          form.clearErrors("slug");
                        }
                        if (field.fieldDataType === "number") {
                          const number = Number(e.target.value);
                          fieldProps.onChange(isNaN(number) ? 1 : number);
                        }
                      }}
                      disabled={
                        field.fieldName === "slug" ? true : isFormSubmitting || isEventDeleting
                      }
                    />

                    {/* Slug */}
                    {field.fieldName === "slug" && (
                      // fieldProps.value &&
                      <div className="absolute right-2 top-[50%] z-10 flex size-5 h-[calc(100%-16px)] w-fit -translate-y-1/2 items-center gap-2">
                        {fieldProps.value && (
                          <Button
                            type="button"
                            className="h-auto bg-white p-0 shadow-none hover:bg-white"
                            onClick={() =>
                              handleCopySlug(fieldProps.value as string)
                            }
                            disabled={isFormSubmitting || isEventDeleting}
                          >
                            <CopyIcon className="text-black/70" />
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Password */}
                    {field.fieldName === "dbPassword" && (
                      // fieldProps.value &&
                      <div className="absolute right-2 top-[50%] z-10 flex size-5 h-[calc(100%-16px)] w-fit -translate-y-1/2 items-center gap-2">
                        {fieldProps.value && (
                          <Button
                            type="button"
                            className="h-auto bg-white p-0 shadow-none hover:bg-white"
                            onClick={() =>
                              handleCopyPassword(fieldProps.value as string)
                            }
                            disabled={isFormSubmitting || isEventDeleting}
                          >
                            <CopyIcon className="text-black/70" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          className="h-auto bg-white p-0 shadow-none hover:bg-white"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isFormSubmitting || isEventDeleting}
                        >
                          {showPassword ? (
                            <EyeVisible className="text-black/70" />
                          ) : (
                            <EveHidden className="text-black/70" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  {field.fieldName === "dbPassword" && (
                    <Button
                      size="sm"
                      variant="default"
                      type="button"
                      className="h-auto px-5 py-2"
                      onClick={generatePassword}
                      disabled={isFormSubmitting || isEventDeleting}
                    >
                      Generate Password
                    </Button>
                  )}
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
                  disabled={
                    field.fieldName === "slug" ? true : isFormSubmitting
                  }
                />
              ) : field.fieldType.type === "select" ? (
                <Select
                  onValueChange={fieldProps.onChange}
                  defaultValue={
                    fieldProps.value ? fieldProps.value.toString() : ""
                  }
                  disabled={isFormSubmitting || isEventDeleting}
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
              ) : field.fieldType.type === "toggle" && (
                <div className="flex justify-end">
                  <Switch
                    disabled={isFormSubmitting || isEventDeleting}
                    checked={fieldProps.value as boolean}
                    onCheckedChange={fieldProps.onChange}
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
