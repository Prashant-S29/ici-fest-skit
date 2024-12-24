/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

import {
  CreateEventSchema,
  PartialUpdateEventScheduleSchema,
  PartialUpdateEventSchema,
} from "@/schema/event.schema";
import type { Event } from "@prisma/client";
import { z } from "zod";
import type { tableConfigDataType } from "@/app/(admin)/admin/dashboard/events/eventTableConfig";
import { getEndpoint } from "@/utils/getEndpoint";

// TODO: add validation, protectedProcedure

export type GetAllEventsResponse = {
  data: Event[] | null;
  formattedData: tableConfigDataType[] | null;
};

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
        schedule: data.schedule.map((schedule) => ({
          title: schedule.title,
          date: schedule.date,
        })),
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

        id: event.id,
      };

      return formattedData;
    }),

  // create event
  createEvent: protectedProcedure
    .input(CreateEventSchema)
    .mutation(async ({ ctx, input }) => {
      // return

      try {
        const event = await ctx.db.event.create({
          data: {
            // dashboard
            slug: input.slug,
            dbPassword: input.dbPassword,

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

  updateEventById: protectedProcedure
    .input(PartialUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("input", input);
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

  updateEventBySlug: protectedProcedure
    .input(PartialUpdateEventSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("input", input);
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

  // delete event by slug
  deleteEventBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.delete({
        where: {
          slug: input.slug,
        },
      });
    }),

  // delete multiple events by ids
  deleteMultipleEventsByIds: protectedProcedure
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
  hideEventBySlug: protectedProcedure
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
  hideMultipleEventsByIds: protectedProcedure
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
  unhideEventBySlug: protectedProcedure
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
  unhideMultipleEventsByIds: protectedProcedure
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
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const coordinatorManagedData =
        await ctx.db.coordinatorManagedData.findUnique({
          where: {
            id: input.id,
          },
        });
      return coordinatorManagedData ?? null;
    }),
});
