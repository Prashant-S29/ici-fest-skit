import {
  type CreateCoordinatorManagedData,
  // CreateEventInfoSchema,
  type CreateEventSchema,
} from "@/schema/event.schema";
import { type InputHTMLAttributes } from "react";
import type { IconType } from "react-icons";
import { type z } from "zod";

export type NavLinkDataType = {
  label: string;
  href: string;
};

export type StatsDataType = {
  label: string;
  value: string;
};

export type FooterDataType = {
  category: string;
  icon: IconType;
  links: {
    label: string;
    href: string;
  }[];
};

export type TimelineDataType = {
  eventName: string;
  eventDate: string;
  eventDay: number;
  startTime: number;
  endTime: number;
};

export type CreateEventFormFieldConfigProps = {
  fieldTitle: string;
  fieldDescription: React.ReactNode;
  fieldName: keyof z.infer<typeof CreateEventSchema>;
  fieldPlaceholder?: string;
  fieldType: {
    type: "input" | "textarea" | "select" | "toggle" | "upload";
    options?: {
      label: string;
      value: string;
    }[];
    uploadOptions?: {
      accept: string;
      maxSizePerFileInMegabyte: number;
      minFiles?: number;
      maxFiles: number;
    };
  };
  fieldDataType: InputHTMLAttributes<HTMLInputElement>["type"];
  className?: string;
};

export type CreateCoordinatorManageFormFieldConfigProps = {
  fieldTitle: string;
  fieldDescription: React.ReactNode;
  fieldName: keyof z.infer<typeof CreateCoordinatorManagedData>;
  fieldPlaceholder?: string;
  fieldType: {
    type: "input" | "textarea" | "select" | "toggle" | "upload";
    options?: {
      label: string;
      value: string;
    }[];
    uploadOptions?: {
      accept: string;
      maxSizePerFileInMegabyte: number;
      minFiles?: number;
      maxFiles: number;
    };
  };
  fieldDataType: InputHTMLAttributes<HTMLInputElement>["type"];
  className?: string;
};

export type CreateEventFormConfig = {
  category: string;
  categoryId:
    | "eventDashboard"
    | "basicInformation"
    | "registration"
    | "schedule"
    | "assets"
    | "coordinators"
    | "metadata"
    | "controllers"
    | "eventInfo";

  isOptional?: boolean;
  fields: CreateEventFormFieldConfigProps[];
};

export type CreateEventInfoFormConfig = {
  category: string;
  categoryId: "about" | "assets" | "rules" | "materials";
  isOptional?: boolean;
  fields: CreateCoordinatorManageFormFieldConfigProps[];
};


export type LogConfig = "detailed" | "normal" | "errors-only";