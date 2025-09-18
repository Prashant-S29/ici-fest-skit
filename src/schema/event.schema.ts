import { z } from "zod";

export const ReviewRequestStatusSchema = z.enum(
  ["NONE", "PENDING", "APPROVED", "REJECTED"],
  {
    errorMap: () => ({
      message:
        "Review request status must be either 'NONE', 'PENDING', 'APPROVED', or 'REJECTED'.",
    }),
  },
);

// Enum Schemas
export const RegistrationTypeSchema = z.enum(["TEAM", "INDIVIDUAL", "BOTH"], {
  errorMap: () => ({
    message: "Registration type must be either 'TEAM' or 'INDIVIDUAL'.",
  }),
});

// Enum Schemas
export const BranchTypeSchema = z.enum(
  ["CSE", "CSE_AI", "CSE_DS", "CSE_IOT", "IT", "ECE", "CE", "EE", "ME"],
  {
    errorMap: () => ({
      message: "Branch must be either one of these",
    }),
  },
);

export const EventCategorySchema = z.enum(
  ["EVENT", "WORKSHOP", "EXHIBITION", "HACKATHON"],
  {
    errorMap: () => ({
      message:
        "Event category must be 'EVENT', 'WORKSHOP', 'EXHIBITION', or 'HACKATHON'.",
    }),
  },
);

// Registration Status Schema
export const RegistrationStatusSchema = z.enum(["UPCOMING", "OPEN", "CLOSED"], {
  errorMap: () => ({
    message:
      "Registration status must be either 'UPCOMING', 'OPEN', or 'CLOSED'.",
  }),
});

// Event Registration Form Schema
export const EventRegistrationFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required."),
  formURL: z.string().url("Form URL must be a valid URL."),
  formAmount: z
    .number()
    .int("Form amount must be an integer.")
    .nonnegative("Form amount must be non-negative."),

  // Metadata
  isActive: z.boolean().default(true),
  status: z.number().int("Status must be an integer.").default(0),

  // Optional event relation
  eventId: z
    .string()
    .uuid("Event ID must be a valid UUID.")
    .nullable()
    .optional(),
});

// Event Coordinator Schema
export const EventCoordinatorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Coordinator name is required."),
  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, "Mobile number must be a 10-digit numeric value."),
  branch: BranchTypeSchema,
  year: z
    .number()
    .int("Year must be an integer.")
    .min(1, "Year can at least be 1 year.")
    .max(4, "Year can at most be 4 years."),

  // Optional event relation
  eventId: z
    .string()
    .uuid("Event ID must be a valid UUID.")
    .nullable()
    .optional(),
});

// Event Schedule Schema
export const EventScheduleSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Schedule title is required."),
  date: z.string().min(1, "Date is required."),
  startTime: z.number().int("Start time must be an integer."),
  endTime: z.number().int("End time must be an integer."),
  venue: z.string().min(1, "Venue is required."),

  // Optional event relation
  eventId: z
    .string()
    .uuid("Event ID must be a valid UUID.")
    .optional()
    .nullable(),
});

// Coordinator Managed Data Schema
export const CoordinatorManagedData = z.object({
  id: z.string().uuid().optional(),
  // about
  shortDescription: z
    .string()
    .min(1, "At least 1 words are required.")
    .max(2000, "Maximum 2000 words are allowed."),
  description: z
    .string()
    .min(1, "At least 1 words are required.")
    .max(5000, "Maximum 5000 words are allowed."),

  // assets
  whatsappGroupURL: z.string().url("WhatsApp group URL must be a valid URL."),
  brochure: z.string().url("Brochure URL must be a valid URL."),
  coverImage: z.string(),
  images: z.array(z.string()).max(5, "Maximum 5 images are allowed."),

  // rules
  judgementCriteria: z.string().optional(),
  disqualificationCriteria: z.string().optional(),

  // materials provided
  materialsProvided: z.string().optional(),
});

// Main Event Schema
export const EventSchema = z.object({
  id: z.string().uuid().optional(),

  // Dashboard
  title: z
    .string()
    .min(4, "Title must be at least 4 characters long.")
    .max(20, "Title must be at most 20 characters long."),
  slug: z.string().min(1, "Slug is required."),
  dbPassword: z
    .string()
    .min(6, "Database password must be at least 6 characters long."),
  coordinatorEmail: z.string().email("Invalid email"),

  category: EventCategorySchema,

  // about
  shortDescription: z.string().optional(),
  description: z.string().optional(),

  // assets
  whatsappGroupURL: z.string().optional(),
  brochure: z.string(),
  coverImage: z.string(),
  images: z.array(z.string()).max(5, "Maximum 5 images are allowed."),

  // rules
  judgementCriteria: z.string().optional(),
  disqualificationCriteria: z.string().optional(),

  // resources
  materialsProvided: z.string().optional(),

  // Schedule
  schedule: z
    .array(EventScheduleSchema)
    // .min(1, "At least one schedule is required.")
    .max(5, "Maximum 5 schedules are allowed."),

  // Registration
  durationInDays: z
    .number()
    .int("Duration must be an integer.")
    .positive("Duration must be a positive number."),
  registrationType: RegistrationTypeSchema,
  registrationForm: z
    .array(EventRegistrationFormSchema)
    // .min(1, "At least one Registration Form is required.")
    .max(7, "Maximum 7 Registration Forms are allowed."),

  // Coordinators
  coordinators: z
    .array(EventCoordinatorSchema)
    // .min(1, "At least one coordinator is required.")
    .max(3, "Maximum 3 coordinators are allowed."),

  // review request status
  reviewRequestStatus: ReviewRequestStatusSchema.default("NONE").optional(),

  // Controllers config
  registrationStatus: RegistrationStatusSchema.default("UPCOMING"),
  isHidden: z.boolean().default(false),
});
// .strict();

// Input Schemas (for creation)
export const CreateEventRegistrationFormSchema =
  EventRegistrationFormSchema.omit({ id: true });
export const CreateEventCoordinatorSchema = EventCoordinatorSchema.omit({
  id: true,
});
export const CreateEventScheduleSchema = EventScheduleSchema.omit({ id: true });
export const CreateEventSchema = EventSchema.omit({ id: true });

export const CreateCoordinatorManagedData = CoordinatorManagedData.omit({
  id: true,
});

// new Schedule Schema
export const CreateNewEventScheduleSchema = EventScheduleSchema.omit({
  id: true,
  eventId: true,
});

// Partial Update Schemas
export const PartialUpdateEventRegistrationFormSchema =
  EventRegistrationFormSchema.partial();
export const PartialUpdateEventCoordinatorSchema =
  EventCoordinatorSchema.partial();
export const PartialUpdateEventScheduleSchema = EventScheduleSchema.partial();
export const PartialUpdateEventSchema = EventSchema.partial();
export const PartialUpdateCoordinatorManagedData =
  CoordinatorManagedData.partial();
