// Update your tRPC publicEvent procedures

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { Prisma } from "@prisma/client";

export const publicEventRouter = createTRPCRouter({
  // Get all paginated events with ordering
  getAllPaginatedEvents: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).max(1000).default(1),
        limit: z.number().min(1).max(50).default(10),
        orderBy: z.enum(["sequence", "createdAt", "title"]).default("sequence"),
        orderDirection: z.enum(["asc", "desc"]).default("asc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, orderBy, orderDirection } = input;
      const skip = (page - 1) * limit;

      // Build orderBy clause with proper typing
      let orderByClause:
        | Prisma.EventOrderByWithRelationInput
        | Prisma.EventOrderByWithRelationInput[];

      if (orderBy === "sequence") {
        // For sequence ordering, we want to show items with sequence first, then fallback
        orderByClause = [{ sequence: orderDirection }, { createdAt: "desc" }];
      } else if (orderBy === "createdAt") {
        orderByClause = { createdAt: orderDirection };
      } else {
        orderByClause = { title: orderDirection };
      }

      const [events, totalItems] = await Promise.all([
        ctx.db.event.findMany({
          where: {
            isHidden: false,
            registrationStatus: {
              in: ["UPCOMING", "OPEN"], // Only show upcoming and open events
            },
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
            sequence: true,
            createdAt: true,
          },
          orderBy: orderByClause,
          skip,
          take: limit,
        }),
        ctx.db.event.count({
          where: {
            isHidden: false,
            registrationStatus: {
              in: ["UPCOMING", "OPEN"],
            },
          },
        }),
      ]);

      return {
        events,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(totalItems / limit),
          hasPreviousPage: page > 1,
        },
      };
    }),

  // Get events by category with ordering
  getEventByCategory: publicProcedure
    .input(
      z.object({
        category: z.enum(["EVENT", "WORKSHOP", "EXHIBITION", "HACKATHON"]),
        page: z.number().min(1).max(1000).default(1),
        limit: z.number().min(1).max(50).default(10),
        orderBy: z.enum(["sequence", "createdAt", "title"]).default("sequence"),
        orderDirection: z.enum(["asc", "desc"]).default("asc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { category, page, limit, orderBy, orderDirection } = input;
      const skip = (page - 1) * limit;

      // Build orderBy clause with proper typing
      let orderByClause:
        | Prisma.EventOrderByWithRelationInput
        | Prisma.EventOrderByWithRelationInput[];

      if (orderBy === "sequence") {
        orderByClause = [{ sequence: orderDirection }, { createdAt: "desc" }];
      } else if (orderBy === "createdAt") {
        orderByClause = { createdAt: orderDirection };
      } else {
        orderByClause = { title: orderDirection };
      }

      const [events, totalItems] = await Promise.all([
        ctx.db.event.findMany({
          where: {
            category,
            isHidden: false,
            registrationStatus: {
              in: ["UPCOMING", "OPEN"],
            },
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
            sequence: true,
            createdAt: true,
          },
          orderBy: orderByClause,
          skip,
          take: limit,
        }),
        ctx.db.event.count({
          where: {
            category,
            isHidden: false,
            registrationStatus: {
              in: ["UPCOMING", "OPEN"],
            },
          },
        }),
      ]);

      return {
        events,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(totalItems / limit),
          hasPreviousPage: page > 1,
        },
      };
    }),

  // Get event by slug (unchanged but including sequence in select)
  getEventBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1).max(200),
      }),
    )
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: {
          slug: input.slug,
          isHidden: false,
        },
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          shortDescription: true,
          description: true,
          registrationStatus: true,
          coverImage: true,
          images: true,
          brochure: true,
          whatsappGroupURL: true,
          durationInDays: true,
          registrationType: true,
          judgementCriteria: true,
          disqualificationCriteria: true,
          materialsProvided: true,
          sequence: true,
          createdAt: true,
          schedule: {
            select: {
              id: true,
              title: true,
              date: true,
              startTime: true,
              endTime: true,
              venue: true,
            },
            orderBy: {
              date: "asc",
            },
          },
          coordinators: {
            select: {
              id: true,
              name: true,
              mobile: true,
              branch: true,
              year: true,
            },
          },
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
        },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      return event;
    }),
});
