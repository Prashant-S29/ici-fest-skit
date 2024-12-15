import type {
  CreateEventRegistrationFormSchema,
  CreateEventScheduleSchema,
  CreateEventSchema,
  EventCoordinatorSchema,
} from "@/schema/event.schema";
import type { z } from "zod";

export const EVENT_FORM_DEFAULTS: z.infer<typeof CreateEventSchema> = {
  title: "",
  shortDescription: "",
  description: "",
  slug: "",
  dbPassword: "",
  coverImage: "",
  whatsappGroupURL: "",
  images: [],
  durationInDays: 1,
  registrationType: "INDIVIDUAL",
  category: "EVENT",
  coordinators: [],
  registrationForm: [],
  schedule: [],
  isHidden: false,
  registrationStatus: "UPCOMING",
};

export const REGISTRATION_FORM_DEFAULTS: z.infer<
  typeof CreateEventRegistrationFormSchema
> = {
  formAmount: 0,
  formURL: "",
  title: "",
  isActive: true,
  status: 0,
};

export const SCHEDULE_FORM_DEFAULTS: z.infer<typeof CreateEventScheduleSchema> =
  {
    title: "",
    date: "",
    startTime: 0,
    endTime: 0,
    venue: "",
  };

export const COORDINATOR_FORM_DEFAULTS: z.infer<typeof EventCoordinatorSchema> =
  {
    name: "",
    mobile: "",
    branch: "CSE",
    year: 1,
  };
