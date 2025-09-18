import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { formatDate } from "@/utils/timeHandler";

const PaginationSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(50).optional().default(20),
});

const DateWisePaginationSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(50).optional().default(20),
});

export const publicScheduleRouter = createTRPCRouter({
  // Get all schedules with pagination
  getAllPaginatedSchedule: publicProcedure
    .input(PaginationSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { page, limit } = input;
        const skip = (page - 1) * limit;

        const [schedules, totalCount] = await Promise.all([
          ctx.db.eventSchedule.findMany({
            skip,
            take: limit,
            where: {
              OR: [
                {
                  eventId: { not: null },
                  event: {
                    isHidden: false,
                  },
                },
                {
                  eventId: null,
                },
              ],
            },
            select: {
              id: true,
              title: true,
              date: true,
              startTime: true,
              endTime: true,
              venue: true,
            },
            orderBy: [
              {
                date: "asc",
              },
              {
                startTime: "asc",
              },
            ],
          }),
          ctx.db.eventSchedule.count({
            where: {
              OR: [
                // Case 1: Schedule has an event relation and event is not hidden
                {
                  eventId: { not: null },
                  event: {
                    isHidden: false,
                  },
                },
                // Case 2: Schedule has no event relation
                {
                  eventId: null,
                },
              ],
            },
          }),
        ]);

     
        return {
          data: {
            schedules,
            pagination: {
              currentPage: page,
              totalPages: Math.ceil(totalCount / limit),
              totalItems: totalCount,
              itemsPerPage: limit,
              hasNextPage: page < Math.ceil(totalCount / limit),
              hasPreviousPage: page > 1,
            },
          },
          error: null,
          message: "Schedules fetched successfully",
        };
      } catch (error) {
        console.error("Error fetching paginated schedules:", error);
        return {
          data: null,
          error: "Failed to fetch schedules",
          message: "Failed to fetch schedules",
        };
      }
    }),

  // Get date-wise paginated schedules
  getDateWisePaginatedSchedule: publicProcedure
    .input(DateWisePaginationSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { page, limit } = input;

        // First get all unique dates with the same filtering logic
        const uniqueDates = await ctx.db.eventSchedule.findMany({
          where: {
            OR: [
              {
                eventId: { not: null },
                event: {
                  isHidden: false,
                },
              },
              {
                eventId: null,
              },
            ],
          },
          select: {
            date: true,
          },
          distinct: ["date"],
          orderBy: {
            date: "asc",
          },
        });

        const totalDates = uniqueDates.length;
        const skip = (page - 1) * limit;
        const datesToFetch = uniqueDates.slice(skip, skip + limit);

        // Get schedules for the selected dates
        const schedulePromises = datesToFetch.map(async ({ date }) => {
          const schedules = await ctx.db.eventSchedule.findMany({
            where: {
              date,
              OR: [
                {
                  eventId: { not: null },
                  event: {
                    isHidden: false,
                  },
                },
                {
                  eventId: null,
                },
              ],
            },
            select: {
              id: true,
              title: true,
              date: true,
              startTime: true,
              endTime: true,
              venue: true,
            },
            orderBy: {
              startTime: "asc",
            },
          });

          return {
            date,
            schedules,
          };
        });

        const dateWiseSchedules = await Promise.all(schedulePromises);

        return {
          data: {
            schedules: dateWiseSchedules,
            pagination: {
              currentPage: page,
              totalPages: Math.ceil(totalDates / limit),
              totalItems: totalDates,
              itemsPerPage: limit,
              hasNextPage: page < Math.ceil(totalDates / limit),
              hasPreviousPage: page > 1,
            },
          },
          error: null,
          message: "Date-wise schedules fetched successfully",
        };
      } catch (error) {
        console.error("Error fetching date-wise schedules:", error);
        return {
          data: null,
          error: "Failed to fetch date-wise schedules",
          message: "Failed to fetch date-wise schedules",
        };
      }
    }),
});
