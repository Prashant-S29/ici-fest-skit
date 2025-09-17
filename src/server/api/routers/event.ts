/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

import {
  CreateEventSchema,
  PartialUpdateCoordinatorManagedData,
  PartialUpdateEventSchema,
} from "@/schema/event.schema";
import type {
  Event,
  EventCategory,
  RegistrationStatus,
  ReviewRequestStatus,
} from "@prisma/client";
import { z } from "zod";
import type { tableConfigDataType } from "@/app/(admin)/admin/dashboard/events/eventTableConfig";
import { getEndpoint } from "@/utils/getEndpoint";

// TODO: add validation, protectedProcedure

export type GetAllEventsResponse = {
  data: Event[] | null;
  formattedData: tableConfigDataType[] | null;
};

const ReorderEventsSchema = z.object({
  eventIds: z
    .array(z.string().min(1, "Event ID is required"))
    .min(1, "At least one event ID is required"),
  category: z.enum(["EVENT", "WORKSHOP", "EXHIBITION", "HACKATHON"]),
});

const GetEventsByCategorySchema = z.object({
  category: z.enum(["EVENT", "WORKSHOP", "EXHIBITION", "HACKATHON"]),
});

export const eventRouter = createTRPCRouter({
  // get all events
  getAllEvents: protectedProcedure.query(
    async ({ ctx }): Promise<GetAllEventsResponse> => {
      const events = await ctx.db.event.findMany({
        include: {
          coordinators: true,
          registrationForm: true,
          schedule: true,
        },
      });

      // Format the data
      const formattedData: tableConfigDataType[] = events.map((data) => ({
        id: data.id,
        title: data.title,
        eventId: data.slug,
        eventDbPassword: data.dbPassword,
        eventDbURL: getEndpoint(`coordinator/dashboard/${data.slug}`),
        isHidden: data.isHidden,
        registrationStatus: data.registrationStatus,
        coordinatorEmail: data.coordinatorEmail,
        reviewRequestStatus: data.reviewRequestStatus,
      }));

      return events
        ? {
            data: events,
            formattedData: formattedData,
          }
        : {
            data: null,
            formattedData: null,
          };
    },
  ),
  getEventsByCategory: adminProcedure
    .input(GetEventsByCategorySchema)
    .query(async ({ ctx, input }) => {
      const events = await ctx.db.event.findMany({
        where: {
          category: input.category,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          sequence: true,
          coordinatorEmail: true,
          dbPassword: true,
          isHidden: true,
          registrationStatus: true,
          reviewRequestStatus: true,
          createdAt: true,
        },
        orderBy: [{ sequence: "asc" }, { createdAt: "desc" }],
      });

      // Format the data for the admin table
      const formattedData: tableConfigDataType[] = events.map((data) => ({
        id: data.id,
        title: data.title,
        eventId: data.slug,
        eventDbPassword: data.dbPassword,
        eventDbURL: getEndpoint(`coordinator/dashboard/${data.slug}`),
        isHidden: data.isHidden,
        registrationStatus: data.registrationStatus,
        coordinatorEmail: data.coordinatorEmail,
        reviewRequestStatus: data.reviewRequestStatus,
      }));

      return {
        events,
        formattedData,
      };
    }),

  // Reorder events within a category
  reorderEvents: adminProcedure
    .input(ReorderEventsSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate that all events belong to the specified category
        const events = await ctx.db.event.findMany({
          where: {
            id: { in: input.eventIds },
            category: input.category,
          },
          select: { id: true },
        });

        if (events.length !== input.eventIds.length) {
          return {
            success: false,
            error: "INVALID_EVENTS",
            message:
              "Some events not found or do not belong to the specified category",
          };
        }

        // Use transaction to ensure data consistency
        await ctx.db.$transaction(async (tx) => {
          // Update sequence for each event
          for (let i = 0; i < input.eventIds.length; i++) {
            await tx.event.update({
              where: { id: input.eventIds[i] },
              data: { sequence: i + 1 },
            });
          }
        });

        return {
          success: true,
          message: "Events reordered successfully",
        };
      } catch (error) {
        console.error("Reorder error:", error);
        return {
          success: false,
          error: "DATABASE_ERROR",
          message: "Failed to reorder events",
        };
      }
    }),

  // Get all events grouped by category (for initial load of admin panel)
  getAllEventsGroupedByCategory: adminProcedure.query(async ({ ctx }) => {
    const categories = [
      "EVENT",
      "WORKSHOP",
      "EXHIBITION",
      "HACKATHON",
    ] as const;

    const result: Record<
      string,
      {
        events: {
          category: EventCategory;
          id: string;
          slug: string;
          title: string;
          dbPassword: string;
          coordinatorEmail: string;
          reviewRequestStatus: ReviewRequestStatus;
          registrationStatus: RegistrationStatus;
          isHidden: boolean;
          sequence: number;
          createdAt: Date;
        }[];
        formattedData: tableConfigDataType[];
      }
    > = {};

    for (const category of categories) {
      const events = await ctx.db.event.findMany({
        where: { category },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          sequence: true,
          coordinatorEmail: true,
          dbPassword: true,
          isHidden: true,
          registrationStatus: true,
          reviewRequestStatus: true,
          createdAt: true,
        },
        orderBy: [{ sequence: "asc" }, { createdAt: "desc" }],
      });

      const formattedData: tableConfigDataType[] = events.map((data) => ({
        id: data.id,
        title: data.title,
        eventId: data.slug,
        eventDbPassword: data.dbPassword,
        eventDbURL: getEndpoint(`coordinator/dashboard/${data.slug}`),
        isHidden: data.isHidden,
        registrationStatus: data.registrationStatus,
        coordinatorEmail: data.coordinatorEmail,
        reviewRequestStatus: data.reviewRequestStatus,
      }));

      result[category] = {
        events,
        formattedData,
      };
    }

    return result;
  }),

  // get event by id
  getEventById: protectedProcedure
    .input(z.object({ id: z.string().min(1, "id is required") }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: {
          id: input.id,
        },
        include: {
          coordinators: true,
          registrationForm: true,
          schedule: true,
        },
      });
      return event ?? null;
    }),

  // get event by slug
  getEventBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          coordinators: true,
          registrationForm: true,
          schedule: true,
        },
      });

      // return event satisfies z.infer<typeof PartialUpdateEventSchema> ?? null

      if (!event) return null;

      const formattedData: z.infer<typeof PartialUpdateEventSchema> = {
        category: event.category,
        coverImage: event.coverImage ?? undefined,
        dbPassword: event.dbPassword,
        coordinatorEmail: event.coordinatorEmail,
        description: event.description ?? undefined,
        shortDescription: event.shortDescription ?? undefined,
        durationInDays: event.durationInDays,
        images: event.images,
        isHidden: event.isHidden,
        registrationForm: event.registrationForm || [],
        registrationStatus: event.registrationStatus,
        schedule: event.schedule,
        slug: event.slug,
        title: event.title,
        coordinators: event.coordinators || [],
        registrationType: event.registrationType,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        reviewRequestStatus: event.reviewRequestStatus,
        id: event.id,
      };

      return formattedData;
    }),

  // create event
  createEvent: adminProcedure
    .input(CreateEventSchema)
    .mutation(async ({ ctx, input }) => {
      // return

      try {
        // Check if event with slug already exists
        const existingEventWithSlug = await ctx.db.event.findUnique({
          where: {
            slug: input.slug,
          },
        });

        if (existingEventWithSlug) {
          return {
            data: null,
            error: "SLUG_EXISTS",
            message: "An event with this slug already exists",
          };
        }

        // Check if event with coordinatorEmail already exists
        const existingEventWithEmail = await ctx.db.event.findUnique({
          where: {
            coordinatorEmail: input.coordinatorEmail,
          },
        });

        if (existingEventWithEmail) {
          return {
            data: null,
            error: "COORDINATOR_EMAIL_EXISTS",
            message: "An event with this coordinator email already exists",
          };
        }

        const event = await ctx.db.event.create({
          data: {
            // dashboard
            slug: input.slug,
            dbPassword: input.dbPassword,
            coordinatorEmail: input.coordinatorEmail,

            // basic info
            title: input.title,
            shortDescription: input.shortDescription,
            description: input.description,
            coverImage: input.coverImage,
            category: input.category,

            // brief
            images: input.images,

            // schedule
            schedule: {
              create: input.schedule,
            },

            // registration
            durationInDays: input.durationInDays,
            registrationType: input.registrationType,
            registrationForm: {
              create: input.registrationForm,
            },

            // coordinators
            coordinators: {
              create: input.coordinators,
            },

            // coordinator managed data
            coordinatorManagedData: {
              create: {
                brochure: "",
                coverImage: "",
                images: [],
                judgementCriteria: "",
                disqualificationCriteria: "",
                whatsappGroupURL: "",
                shortDescription: "",
                description: "",
                materialsProvided: "",
              },
            },

            // controllers config
            registrationStatus: input.registrationStatus,
            isHidden: input.isHidden,
          },
        });

        return {
          data: event,
          error: null,
          message: "Event created successfully",
        };
      } catch (error) {
        return {
          data: null,
          error: error,
          message: "Error creating event",
        };
      }
    }),

  updateEventById: adminProcedure
    .input(PartialUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { schedule, registrationForm, coordinators, id, ...rest } = input;

      return ctx.db.event.update({
        where: {
          id: id, // The event ID to be updated
        },
        data: {
          ...rest, // Update the remaining fields for the event

          // Schedule: Clear existing and add new entries
          schedule: {
            deleteMany: {}, // Deletes all existing schedules (optional, filters can be added)
            create: schedule?.map(
              ({ id: _, eventId: __, ...restSchedule }) => restSchedule,
            ), // Map to exclude id and eventId
          },

          // Registration Forms: Clear existing and add new entries
          registrationForm: {
            deleteMany: {}, // Deletes all existing registration forms
            create: registrationForm?.map(
              ({ id: _, eventId: __, ...restForm }) => restForm,
            ), // Exclude id and eventId
          },

          // Coordinators: Clear existing and add new entries
          coordinators: {
            deleteMany: {}, // Deletes all existing coordinators
            create: coordinators?.map(
              ({ id: _, eventId: __, ...restCoordinator }) => restCoordinator,
            ), // Exclude id and eventId
          },
        },
      });
    }),

  updateEventBySlug: adminProcedure
    .input(PartialUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { schedule, registrationForm, coordinators, id, ...rest } = input;

      return ctx.db.event.update({
        where: {
          slug: input.slug, // The event ID to be updated
        },
        data: {
          ...rest, // Update the remaining fields for the event

          // Schedule: Clear existing and add new entries
          schedule: {
            deleteMany: {}, // Deletes all existing schedules (optional, filters can be added)
            create: schedule?.map(
              ({ id: _, eventId: __, ...restSchedule }) => restSchedule,
            ), // Map to exclude id and eventId
          },

          // Registration Forms: Clear existing and add new entries
          registrationForm: {
            deleteMany: {}, // Deletes all existing registration forms
            create: registrationForm?.map(
              ({ id: _, eventId: __, ...restForm }) => restForm,
            ), // Exclude id and eventId
          },

          // Coordinators: Clear existing and add new entries
          coordinators: {
            deleteMany: {}, // Deletes all existing coordinators
            create: coordinators?.map(
              ({ id: _, eventId: __, ...restCoordinator }) => restCoordinator,
            ), // Exclude id and eventId
          },
        },
      });
    }),

  // update eventInfo
  updateEventInfoBySlug: adminProcedure
    .input(PartialUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: {
          slug: input.slug,
        },
        data: {
          brochure: input.brochure,
          coverImage: input.coverImage,
          images: input.images,
          judgementCriteria: input.judgementCriteria,
          disqualificationCriteria: input.disqualificationCriteria,
          whatsappGroupURL: input.whatsappGroupURL,
          shortDescription: input.shortDescription,
          description: input.description,
          materialsProvided: input.materialsProvided,
          reviewRequestStatus: input.reviewRequestStatus,
        },
      });
    }),

  // delete event by slug
  deleteEventBySlug: adminProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.delete({
        where: {
          slug: input.slug,
        },
      });
    }),

  // delete multiple events by ids
  deleteMultipleEventsByIds: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.deleteMany({
        where: {
          id: {
            in: input.ids,
          },
        },
      });
    }),

  // hide event by slug
  hideEventBySlug: adminProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: {
          slug: input.slug,
        },
        data: {
          isHidden: true,
        },
      });
    }),

  // hide multiple events by ids
  hideMultipleEventsByIds: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.updateMany({
        where: {
          id: {
            in: input.ids,
          },
        },
        data: {
          isHidden: false,
        },
      });
    }),

  // unhide event by slug
  unhideEventBySlug: adminProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: {
          slug: input.slug,
        },
        data: {
          isHidden: false,
        },
      });
    }),

  // unhide multiple events by ids
  unhideMultipleEventsByIds: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.updateMany({
        where: {
          id: {
            in: input.ids,
          },
        },
        data: {
          isHidden: true,
        },
      });
    }),

  // get coordinator managed data by id
  getCoordinatorManagedDataById: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const coordinatorManagedData =
        await ctx.db.coordinatorManagedData.findUnique({
          where: {
            eventSlug: input.slug,
          },
        });
      return coordinatorManagedData ?? null;
    }),

  // update coordinator managed data
  updateCoordinatorManagedDataById: protectedProcedure
    .input(PartialUpdateCoordinatorManagedData.extend({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { slug, ...updateData } = input;
      return ctx.db.coordinatorManagedData.update({
        where: {
          eventSlug: slug,
        },
        data: {
          brochure: updateData.brochure,
          coverImage: updateData.coverImage,
          images: updateData.images,
          judgementCriteria: updateData.judgementCriteria,
          disqualificationCriteria: updateData.disqualificationCriteria,
          materialsProvided: updateData.materialsProvided,
          whatsappGroupURL: updateData.whatsappGroupURL,
          shortDescription: updateData.shortDescription,
          description: updateData.description,
          eventSlug: slug,
        },
      });
    }),

  updateCoverImage: protectedProcedure
    .input(z.object({ slug: z.string(), coverImage: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { slug, coverImage } = input;
      return ctx.db.coordinatorManagedData.update({
        where: {
          eventSlug: slug,
        },
        data: {
          coverImage: input.coverImage,
        },
      });
    }),

  // update images
  updateImages: protectedProcedure
    .input(z.object({ slug: z.string(), images: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { slug, images } = input;
      return ctx.db.coordinatorManagedData.update({
        where: {
          eventSlug: slug,
        },
        data: {
          images: images,
        },
      });
    }),

  // get admin managed data by id
  getAdminManagedDataById: adminProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const adminManagedData = await ctx.db.event.findUnique({
        where: {
          slug: input.slug,
        },
        select: {
          shortDescription: true,
          description: true,
          whatsappGroupURL: true,
          brochure: true,
          coverImage: true,
          images: true,
          judgementCriteria: true,
          disqualificationCriteria: true,
        },
      });
      return adminManagedData ?? null;
    }),

  // update review request status
  updateReviewRequestStatus: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        status: z.enum(["PENDING", "APPROVED", "REJECTED", "NONE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { slug, status } = input;
      return ctx.db.event.update({
        where: {
          slug: slug,
        },
        data: {
          reviewRequestStatus: status,
        },
      });
    }),
});
