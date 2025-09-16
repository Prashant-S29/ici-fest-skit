import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

// Input validation schemas
const PaginationSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(50).optional().default(20),
});

const EventByCategorySchema = z.object({
  category: z.enum(["EVENT", "WORKSHOP", "EXHIBITION", "HACKATHON"]),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(50).optional().default(20),
});

const EventBySlugSchema = z.object({
  slug: z.string().min(1).max(200),
});

export const publicEventRouter = createTRPCRouter({
  // Get all events with pagination
  getAllPaginatedEvents: publicProcedure
    .input(PaginationSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { page, limit } = input;
        const skip = (page - 1) * limit;

        const [events, totalCount] = await Promise.all([
          ctx.db.event.findMany({
            skip,
            take: limit,
            where: {
              isHidden: false,
            },
            select: {
              id: true,
              slug: true,
              title: true,
              category: true,
              shortDescription: true,
              registrationStatus: true,
              coverImage: true,
              durationInDays: true,
              registrationType: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          }),
          ctx.db.event.count({
            where: {
              isHidden: false,
            },
          }),
        ]);

        return {
          data: {
            events,
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
          message: "Events fetched successfully",
        };
      } catch (error) {
        console.error("Error fetching paginated events:", error);
        return {
          data: null,
          error: "Failed to fetch events",
          message: "Failed to fetch events",
        };
      }
    }),

  // Get event by slug
  getEventBySlug: publicProcedure
    .input(EventBySlugSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { slug } = input;
        const sanitizedSlug = slug.trim().toLowerCase();

        const event = await ctx.db.event.findUnique({
          where: {
            slug: sanitizedSlug,
            isHidden: false,
          },
          select: {
            slug: true,
            title: true,
            category: true,
            shortDescription: true,
            description: true,
            coverImage: true,
            images: true,
            brochure: true,
            judgementCriteria: true,
            disqualificationCriteria: true,
            whatsappGroupURL: true,
            durationInDays: true,
            materialsProvided: true,
            registrationForm: {
              where: {
                isActive: true,
              },
              select: {
                id: true,
                title: true,
                formURL: true,
                formAmount: true,
              },
            },
            registrationStatus: true,
            schedule: {
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
            },
            coordinators: true,
            registrationType: true,
          },
        });

        if (!event) {
          return {
            data: null,
            error: "Event not found",
            message: "Event not found",
          };
        }

        return {
          data: event,
          error: null,
          message: "Event fetched successfully",
        };
      } catch (error) {
        console.error("Error fetching event by slug:", error);
        return {
          data: null,
          error: "Failed to fetch event",
          message: "Failed to fetch event",
        };
      }
    }),

  // Get events by category
  getEventByCategory: publicProcedure
    .input(EventByCategorySchema)
    .query(async ({ ctx, input }) => {
      try {
        const { category, page, limit } = input;
        const skip = (page - 1) * limit;

        const [events, totalCount] = await Promise.all([
          ctx.db.event.findMany({
            skip,
            take: limit,
            where: {
              category,
              isHidden: false,
            },
            select: {
              id: true,
              slug: true,
              title: true,
              category: true,
              shortDescription: true,
              coverImage: true,
              durationInDays: true,
              registrationType: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          }),
          ctx.db.event.count({
            where: {
              category,
              isHidden: false,
            },
          }),
        ]);

        return {
          data: {
            events,
            category,
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
          message: "Events fetched successfully",
        };
      } catch (error) {
        console.error("Error fetching events by category:", error);
        return {
          data: null,
          error: "Failed to fetch events by category",
          message: "Failed to fetch events by category",
        };
      }
    }),
});
