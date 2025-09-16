/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import {
  CreateEventScheduleSchema,
  PartialUpdateEventScheduleSchema,
} from "@/schema/event.schema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { convertDateTimeToDate } from "@/utils/dateHandler";
import { z } from "zod";

// TODO: add validation, protectedProcedure

export const scheduleRouter = createTRPCRouter({
  // get all events
  getAllSchedules: protectedProcedure.query(async ({ ctx }) => {
    const schedules = await ctx.db.eventSchedule.findMany();

    return schedules;
  }),

  // create schedule
  createSchedule: protectedProcedure
    .input(CreateEventScheduleSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("[Create Schedule Mutation] input", input);
      console.log("[Create Schedule Mutation] input.date", input.date);

      const convertedDate = convertDateTimeToDate(input.date);
      console.log("[Create Schedule Mutation] convertedDate", convertedDate);

      return ctx.db.eventSchedule.create({
        data: {
          title: input.title,
          date: convertedDate,
          startTime: input.startTime,
          endTime: input.endTime,
          venue: input.venue,
        },
      });
    }),

  // delete schedule
  deleteScheduleById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.eventSchedule.delete({
        where: {
          id: input.id,
        },
      });
    }),

  // get schedule event event id
  getAllScheduleEventId: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const schedule = await ctx.db.event.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          schedule: true,
        },
      });

      return schedule;
    }),

  // update schedule
  updateScheduleById: protectedProcedure
    .input(PartialUpdateEventScheduleSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.eventSchedule.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          date: input.date,
          startTime: input.startTime,
          endTime: input.endTime,
          venue: input.venue,
        },
      });
    }),

  // createSchedule: protectedProcedure
  //   .input(CreateEventSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     // return

  //     try {
  //       const event = await ctx.db.event.create({
  //         data: {
  //           // dashboard
  //           slug: input.slug,
  //           dbPassword: input.dbPassword,

  //           // basic info
  //           title: input.title,
  //           shortDescription: input.shortDescription,
  //           description: input.description,
  //           coverImage: input.coverImage,
  //           category: input.category,

  //           // brief
  //           images: input.images,

  //           // schedule
  //           schedule: {
  //             create: input.schedule,
  //           },

  //           // registration
  //           durationInDays: input.durationInDays,
  //           registrationType: input.registrationType,
  //           registrationForm: {
  //             create: input.registrationForm,
  //           },

  //           // coordinators
  //           coordinators: {
  //             create: input.coordinators,
  //           },

  //           // controllers config
  //           registrationStatus: input.registrationStatus,
  //           isHidden: input.isHidden,
  //         },
  //       });

  //       return {
  //         data: event,
  //         error: null,
  //         message: "Event created successfully",
  //       };
  //     } catch (error) {
  //       return {
  //         data: null,
  //         error: error,
  //         message: "Error creating event",
  //       };
  //     }
  //   }),

  // updateScheduleById: protectedProcedure
  //   .input(PartialUpdateEventSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const { schedule, registrationForm, coordinators, id, ...rest } = input;

  //     return ctx.db.event.update({
  //       where: {
  //         id: id, // The event ID to be updated
  //       },
  //       data: {
  //         ...rest, // Update the remaining fields for the event

  //         // Schedule: Clear existing and add new entries
  //         schedule: {
  //           deleteMany: {}, // Deletes all existing schedules (optional, filters can be added)
  //           create: schedule?.map(
  //             ({ id: _, eventId: __, ...restSchedule }) => restSchedule,
  //           ), // Map to exclude id and eventId
  //         },

  //         // Registration Forms: Clear existing and add new entries
  //         registrationForm: {
  //           deleteMany: {}, // Deletes all existing registration forms
  //           create: registrationForm?.map(
  //             ({ id: _, eventId: __, ...restForm }) => restForm,
  //           ), // Exclude id and eventId
  //         },

  //         // Coordinators: Clear existing and add new entries
  //         coordinators: {
  //           deleteMany: {}, // Deletes all existing coordinators
  //           create: coordinators?.map(
  //             ({ id: _, eventId: __, ...restCoordinator }) => restCoordinator,
  //           ), // Exclude id and eventId
  //         },
  //       },
  //     });
  //   }),

  // deleteScheduleById: protectedProcedure
  //   .input(z.object({ slug: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     return ctx.db.event.delete({
  //       where: {
  //         slug: input.slug,
  //       },
  //     });
  //   }),
});
