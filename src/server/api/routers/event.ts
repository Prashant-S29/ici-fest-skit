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

// Optimized types for better performance
type OptimizedEventSelect = {
  id: string;
  title: string;
  slug: string;
  category: EventCategory;
  sequence: number;
  coordinatorEmail: string;
  dbPassword: string;
  isHidden: boolean;
  registrationStatus: RegistrationStatus;
  reviewRequestStatus: ReviewRequestStatus;
  createdAt: Date;
};

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

// Helper function to format events for table
const formatEventsForTable = (
  events: OptimizedEventSelect[],
): tableConfigDataType[] => {
  return events.map((data) => ({
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
};

export const eventRouter = createTRPCRouter({
  getAllEvents: protectedProcedure.query(
    async ({ ctx }): Promise<GetAllEventsResponse> => {
      try {
        const events = await ctx.db.event.findMany({
          include: {
            coordinators: true,
            registrationForm: true,
            schedule: true,
          },
          // Add ordering for consistent results
          orderBy: [{ sequence: "asc" }, { createdAt: "desc" }],
        });

        const formattedData = formatEventsForTable(events);

        return {
          data: events,
          formattedData: formattedData,
        };
      } catch (error) {
        console.error("Error fetching all events:", error);
        return {
          data: null,
          formattedData: null,
        };
      }
    },
  ),

  getEventsByCategory: adminProcedure
    .input(GetEventsByCategorySchema)
    .query(async ({ ctx, input }) => {
      try {
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

        const formattedData = formatEventsForTable(events);

        return {
          events,
          formattedData,
        };
      } catch (error) {
        console.error(
          `Error fetching events for category ${input.category}:`,
          error,
        );
        return {
          events: [],
          formattedData: [],
        };
      }
    }),

  reorderEvents: adminProcedure
    .input(ReorderEventsSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Reorder request:", {
          eventIds: input.eventIds,
          category: input.category,
        });

        // Quick validation using count (faster than findMany)
        const eventCount = await ctx.db.event.count({
          where: {
            id: { in: input.eventIds },
            category: input.category,
          },
        });

        if (eventCount !== input.eventIds.length) {
          return {
            success: false,
            error: "INVALID_EVENTS",
            message: "Some events not found or don't belong to category",
          };
        }

        // Parallel updateMany operations WITHOUT transaction (much faster)
        const updatePromises = input.eventIds.map((eventId, index) =>
          ctx.db.event.updateMany({
            where: { id: eventId },
            data: { sequence: index + 1 },
          }),
        );

        // Execute all updates in parallel
        const results = await Promise.all(updatePromises);
        const totalUpdated = results.reduce((sum, res) => sum + res.count, 0);

        console.log(
          `Successfully updated ${totalUpdated} events in parallel (no transaction)`,
        );

        return {
          success: true,
          message: "Events reordered successfully",
          updatedCount: totalUpdated,
        };
      } catch (error) {
        console.error("Reorder error:", error);
        return {
          success: false,
          error: "DATABASE_ERROR",
          message: `Failed to reorder events`,
        };
      }
    }),

  getAllEventsGroupedByCategory: adminProcedure.query(async ({ ctx }) => {
    const categories = [
      "EVENT",
      "WORKSHOP",
      "EXHIBITION",
      "HACKATHON",
    ] as const;

    try {
      // Execute all category queries in parallel
      const categoryPromises = categories.map(async (category) => {
        try {
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

          const formattedData = formatEventsForTable(events);

          return {
            category,
            events,
            formattedData,
          };
        } catch (error) {
          console.error(
            `Error fetching events for category ${category}:`,
            error,
          );
          return {
            category,
            events: [],
            formattedData: [],
          };
        }
      });

      const categoryResults = await Promise.all(categoryPromises);

      // Build result object
      const result: Record<
        string,
        { events: OptimizedEventSelect[]; formattedData: tableConfigDataType[] }
      > = {};

      categoryResults.forEach(({ category, events, formattedData }) => {
        result[category] = { events, formattedData };
      });

      return result;
    } catch (error) {
      console.error("Error in getAllEventsGroupedByCategory:", error);

      // Return empty structure on error
      const result: Record<
        string,
        { events: OptimizedEventSelect[]; formattedData: tableConfigDataType[] }
      > = {};
      categories.forEach((category) => {
        result[category] = { events: [], formattedData: [] };
      });

      return result;
    }
  }),

  // Optimized: Better error handling
  getEventById: protectedProcedure
    .input(z.object({ id: z.string().min(1, "id is required") }))
    .query(async ({ ctx, input }) => {
      try {
        const event = await ctx.db.event.findUnique({
          where: { id: input.id },
          include: {
            coordinators: true,
            registrationForm: true,
            schedule: true,
          },
        });
        return event;
      } catch (error) {
        console.error(`Error fetching event by id ${input.id}:`, error);
        return null;
      }
    }),

  getEventBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const event = await ctx.db.event.findUnique({
          where: { slug: input.slug },
          include: {
            coordinators: true,
            registrationForm: true,
            schedule: true,
          },
        });

        if (!event) return null;

        // Direct return instead of reformatting
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
          reviewRequestStatus: event.reviewRequestStatus,
          id: event.id,
        };

        return formattedData;
      } catch (error) {
        console.error(`Error fetching event by slug ${input.slug}:`, error);
        return null;
      }
    }),

  // Optimized: Better error handling and validation
  createEvent: adminProcedure
    .input(CreateEventSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Parallel validation instead of sequential
        const [existingSlug, existingEmail] = await Promise.all([
          ctx.db.event.findUnique({
            where: { slug: input.slug },
            select: { id: true },
          }),
          ctx.db.event.findUnique({
            where: { coordinatorEmail: input.coordinatorEmail },
            select: { id: true },
          }),
        ]);

        if (existingSlug) {
          return {
            data: null,
            error: "SLUG_EXISTS",
            message: "An event with this slug already exists",
          };
        }

        if (existingEmail) {
          return {
            data: null,
            error: "COORDINATOR_EMAIL_EXISTS",
            message: "An event with this coordinator email already exists",
          };
        }

        const event = await ctx.db.event.create({
          data: {
            slug: input.slug,
            dbPassword: input.dbPassword,
            coordinatorEmail: input.coordinatorEmail,
            title: input.title,
            shortDescription: input.shortDescription,
            description: input.description,
            coverImage: input.coverImage,
            category: input.category,
            images: input.images,
            durationInDays: input.durationInDays,
            registrationType: input.registrationType,
            registrationStatus: input.registrationStatus,
            isHidden: input.isHidden,
            schedule: {
              create: input.schedule,
            },
            registrationForm: {
              create: input.registrationForm,
            },
            coordinators: {
              create: input.coordinators,
            },
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
          },
        });

        return {
          data: event,
          error: null,
          message: "Event created successfully",
        };
      } catch (error) {
        console.error("Error creating event:", error);
        return {
          data: null,
          error: "DATABASE_ERROR",
          message: `Error creating event`,
        };
      }
    }),

  // Optimized: Use transactions properly
  updateEventById: adminProcedure
    .input(PartialUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { schedule, registrationForm, coordinators, id, ...rest } = input;

        return await ctx.db.$transaction(async (tx) => {
          return tx.event.update({
            where: { id },
            data: {
              ...rest,
              schedule: schedule
                ? {
                    deleteMany: {},
                    create: schedule.map(
                      ({ id: _, eventId: __, ...restSchedule }) => restSchedule,
                    ),
                  }
                : undefined,
              registrationForm: registrationForm
                ? {
                    deleteMany: {},
                    create: registrationForm.map(
                      ({ id: _, eventId: __, ...restForm }) => restForm,
                    ),
                  }
                : undefined,
              coordinators: coordinators
                ? {
                    deleteMany: {},
                    create: coordinators.map(
                      ({ id: _, eventId: __, ...restCoordinator }) =>
                        restCoordinator,
                    ),
                  }
                : undefined,
            },
          });
        });
      } catch (error) {
        console.error(`Error updating event ${input.id}:`, error);
        throw error;
      }
    }),

  // Optimized: Use transactions properly
  updateEventBySlug: adminProcedure
    .input(PartialUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { schedule, registrationForm, coordinators, slug, ...rest } =
          input;

        return await ctx.db.$transaction(async (tx) => {
          return tx.event.update({
            where: { slug },
            data: {
              ...rest,
              schedule: schedule
                ? {
                    deleteMany: {},
                    create: schedule.map(
                      ({ id: _, eventId: __, ...restSchedule }) => restSchedule,
                    ),
                  }
                : undefined,
              registrationForm: registrationForm
                ? {
                    deleteMany: {},
                    create: registrationForm.map(
                      ({ id: _, eventId: __, ...restForm }) => restForm,
                    ),
                  }
                : undefined,
              coordinators: coordinators
                ? {
                    deleteMany: {},
                    create: coordinators.map(
                      ({ id: _, eventId: __, ...restCoordinator }) =>
                        restCoordinator,
                    ),
                  }
                : undefined,
            },
          });
        });
      } catch (error) {
        console.error(`Error updating event ${input.slug}:`, error);
        throw error;
      }
    }),

  // Optimized: Only update necessary fields
  updateEventInfoBySlug: adminProcedure
    .input(PartialUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.event.update({
          where: { slug: input.slug },
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
      } catch (error) {
        console.error(`Error updating event info ${input.slug}:`, error);
        throw error;
      }
    }),

  deleteEventBySlug: adminProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.event.delete({
          where: { slug: input.slug },
        });
      } catch (error) {
        console.error(`Error deleting event ${input.slug}:`, error);
        throw error;
      }
    }),

  deleteMultipleEventsByIds: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.event.deleteMany({
          where: { id: { in: input.ids } },
        });
      } catch (error) {
        console.error(`Error deleting multiple events:`, error);
        throw error;
      }
    }),

  hideEventBySlug: adminProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.event.update({
          where: { slug: input.slug },
          data: { isHidden: true },
        });
      } catch (error) {
        console.error(`Error hiding event ${input.slug}:`, error);
        throw error;
      }
    }),

  hideMultipleEventsByIds: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.event.updateMany({
          where: { id: { in: input.ids } },
          data: { isHidden: true },
        });
      } catch (error) {
        console.error(`Error hiding multiple events:`, error);
        throw error;
      }
    }),

  unhideEventBySlug: adminProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.event.update({
          where: { slug: input.slug },
          data: { isHidden: false },
        });
      } catch (error) {
        console.error(`Error unhiding event ${input.slug}:`, error);
        throw error;
      }
    }),

  // Fixed: This was setting isHidden to true instead of false for unhiding
  unhideMultipleEventsByIds: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.event.updateMany({
          where: { id: { in: input.ids } },
          data: { isHidden: false }, // Fixed: was true
        });
      } catch (error) {
        console.error(`Error unhiding multiple events:`, error);
        throw error;
      }
    }),

  getCoordinatorManagedDataById: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.coordinatorManagedData.findUnique({
          where: { eventSlug: input.slug },
        });
      } catch (error) {
        console.error(`Error fetching coordinator data ${input.slug}:`, error);
        return null;
      }
    }),

  updateCoordinatorManagedDataById: protectedProcedure
    .input(PartialUpdateCoordinatorManagedData.extend({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { slug, ...updateData } = input;
        return await ctx.db.coordinatorManagedData.update({
          where: { eventSlug: slug },
          data: {
            ...updateData,
            eventSlug: slug,
          },
        });
      } catch (error) {
        console.error(`Error updating coordinator data ${input.slug}:`, error);
        throw error;
      }
    }),

  updateCoverImage: protectedProcedure
    .input(z.object({ slug: z.string(), coverImage: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.coordinatorManagedData.update({
          where: { eventSlug: input.slug },
          data: { coverImage: input.coverImage },
        });
      } catch (error) {
        console.error(`Error updating cover image ${input.slug}:`, error);
        throw error;
      }
    }),

  updateImages: protectedProcedure
    .input(z.object({ slug: z.string(), images: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.coordinatorManagedData.update({
          where: { eventSlug: input.slug },
          data: { images: input.images },
        });
      } catch (error) {
        console.error(`Error updating images ${input.slug}:`, error);
        throw error;
      }
    }),

  getAdminManagedDataById: adminProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.event.findUnique({
          where: { slug: input.slug },
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
      } catch (error) {
        console.error(`Error fetching admin data ${input.slug}:`, error);
        return null;
      }
    }),

  updateReviewRequestStatus: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        status: z.enum(["PENDING", "APPROVED", "REJECTED", "NONE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.event.update({
          where: { slug: input.slug },
          data: { reviewRequestStatus: input.status },
        });
      } catch (error) {
        console.error(`Error updating review status ${input.slug}:`, error);
        throw error;
      }
    }),
});
