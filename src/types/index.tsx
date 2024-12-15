import { CreateEventSchema } from "@/schema/event.schema";
import { InputHTMLAttributes } from "react";
import type { IconType } from "react-icons";
import { z } from "zod";

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

export type FormFieldConfigProps = {
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

export type FormConfigProps = {
  category: string;
  categoryId:
    | "eventDashboard"
    | "basicInformation"
    | "registration"
    | "schedule"
    | "assets"
    | "coordinators"
    | "metadata"
    | "controllers";

  isOptional?: boolean;
  fields: FormFieldConfigProps[];
};
