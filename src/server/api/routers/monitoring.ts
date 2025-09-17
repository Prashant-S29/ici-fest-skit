import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import {
  getPerformanceMetrics,
  clearPerformanceMetrics,
} from "@/server/api/trpc";
import { z } from "zod";

export const monitoringRouter = createTRPCRouter({
  // Get comprehensive performance metrics (admin only)
  getPerformanceMetrics: adminProcedure.query(() => {
    return getPerformanceMetrics();
  }),

  // Get real-time performance statistics
  getRealtimeStats: adminProcedure.query(() => {
    const metrics = getPerformanceMetrics();
    const last5min = metrics.rawMetrics.filter(
      (m) => Date.now() - new Date(m.timestamp).getTime() < 5 * 60 * 1000,
    );

    const last1min = metrics.rawMetrics.filter(
      (m) => Date.now() - new Date(m.timestamp).getTime() < 1 * 60 * 1000,
    );

    return {
      last5Minutes: {
        totalRequests: last5min.length,
        averageResponseTime:
          last5min.length > 0
            ? Math.round(
                last5min.reduce((sum, m) => sum + m.duration, 0) /
                  last5min.length,
              )
            : 0,
        errorRate:
          last5min.length > 0
            ? (
                (last5min.filter((m) => !m.success).length / last5min.length) *
                100
              ).toFixed(1) + "%"
            : "0%",
        slowQueries: last5min.filter((m) => m.duration > 1000).length,
        criticalQueries: last5min.filter((m) => m.duration > 5000).length,
      },
      last1Minute: {
        totalRequests: last1min.length,
        averageResponseTime:
          last1min.length > 0
            ? Math.round(
                last1min.reduce((sum, m) => sum + m.duration, 0) /
                  last1min.length,
              )
            : 0,
        errorRate:
          last1min.length > 0
            ? (
                (last1min.filter((m) => !m.success).length / last1min.length) *
                100
              ).toFixed(1) + "%"
            : "0%",
      },
      currentStatus: {
        healthScore: calculateHealthScore(last5min),
        status: getSystemStatus(last5min),
        alerts: getActiveAlerts(last5min),
      },
    };
  }),

  // Get detailed procedure performance breakdown
  getProcedureStats: adminProcedure
    .input(
      z.object({
        procedureName: z.string().optional(),
        timeRange: z.enum(["1h", "6h", "24h"]).default("24h"),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(({ input }) => {
      const timeRangeMs = {
        "1h": 60 * 60 * 1000,
        "6h": 6 * 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
      }[input.timeRange];

      const metrics = getPerformanceMetrics();
      const filteredMetrics = metrics.rawMetrics.filter((m) => {
        const isInTimeRange =
          Date.now() - new Date(m.timestamp).getTime() < timeRangeMs;
        const matchesProcedure =
          !input.procedureName || m.procedure === input.procedureName;
        return isInTimeRange && matchesProcedure;
      });

      // Group by procedure if no specific procedure requested
      if (!input.procedureName) {
        const procedureGroups = filteredMetrics.reduce(
          (acc, m) => {
            if (!acc[m.procedure]) {
              acc[m.procedure] = {
                procedure: m.procedure,
                calls: [] as typeof filteredMetrics,
                totalCalls: 0,
                totalDuration: 0,
                errors: 0,
                avgDuration: 0,
                minDuration: Infinity,
                maxDuration: 0,
                p95Duration: 0,
                errorRate: "0%",
              };
            }

            const group = acc[m.procedure];
            if (!group) return acc;

            group.calls.push(m);
            group.totalCalls += 1;
            group.totalDuration += m.duration;
            if (!m.success) group.errors += 1;
            group.minDuration = Math.min(group.minDuration, m.duration);
            group.maxDuration = Math.max(group.maxDuration, m.duration);

            return acc;
          },
          {} as Record<
            string,
            {
              procedure: string;
              calls: typeof filteredMetrics;
              totalCalls: number;
              totalDuration: number;
              errors: number;
              avgDuration: number;
              minDuration: number;
              maxDuration: number;
              p95Duration: number;
              errorRate: string;
            }
          >,
        );

        Object.values(procedureGroups).forEach(
          (group: {
            procedure: string;
            calls?: typeof filteredMetrics;
            totalCalls: number;
            totalDuration: number;
            errors: number;
            avgDuration: number;
            minDuration: number;
            maxDuration: number;
            p95Duration: number;
            errorRate: string;
          }) => {
            group.avgDuration = Math.round(
              group.totalDuration / group.totalCalls,
            );
            group.errorRate =
              ((group.errors / group.totalCalls) * 100).toFixed(1) + "%";

            const sortedDurations =
              group.calls
                ?.map((c) => c.duration)
                .sort((a: number, b: number) => a - b) ?? [];

            const p95Index = Math.ceil(sortedDurations.length * 0.95) - 1;
            group.p95Duration = sortedDurations[p95Index] ?? 0;

            delete group.calls;
          },
        );

        return {
          procedures: Object.values(procedureGroups)
            .sort((a, b) => b.avgDuration - a.avgDuration)
            .slice(0, input.limit),
          totalProcedures: Object.keys(procedureGroups).length,
          timeRange: input.timeRange,
        };
      }

      // Return detailed stats for specific procedure
      return {
        procedure: input.procedureName,
        calls: filteredMetrics.slice(-input.limit),
        totalCalls: filteredMetrics.length,
        avgDuration:
          filteredMetrics.length > 0
            ? Math.round(
                filteredMetrics.reduce((sum, m) => sum + m.duration, 0) /
                  filteredMetrics.length,
              )
            : 0,
        errors: filteredMetrics.filter((m) => !m.success).length,
        errorRate:
          filteredMetrics.length > 0
            ? (
                (filteredMetrics.filter((m) => !m.success).length /
                  filteredMetrics.length) *
                100
              ).toFixed(1) + "%"
            : "0%",
        timeRange: input.timeRange,
      };
    }),

  // Get system health status
  getSystemHealth: adminProcedure.query(() => {
    const metrics = getPerformanceMetrics();
    const recent = metrics.rawMetrics.filter(
      (m) => Date.now() - new Date(m.timestamp).getTime() < 5 * 60 * 1000,
    );

    return {
      status: getSystemStatus(recent),
      healthScore: calculateHealthScore(recent),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      nodeVersion: process.version,
      platform: process.platform,
      lastUpdated: new Date().toISOString(),
    };
  }),

  // Clear all performance metrics (admin only, be careful!)
  clearMetrics: adminProcedure.mutation(() => {
    clearPerformanceMetrics();
    return {
      success: true,
      message: "Performance metrics cleared successfully",
      clearedAt: new Date().toISOString(),
    };
  }),

  // Export metrics (for external monitoring tools)
  exportMetrics: adminProcedure
    .input(
      z.object({
        format: z.enum(["json", "csv"]).default("json"),
        timeRange: z.enum(["1h", "6h", "24h"]).default("24h"),
      }),
    )
    .query(({ input }) => {
      const timeRangeMs = {
        "1h": 60 * 60 * 1000,
        "6h": 6 * 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
      }[input.timeRange];

      const metrics = getPerformanceMetrics();
      const filteredMetrics = metrics.rawMetrics.filter(
        (m) => Date.now() - new Date(m.timestamp).getTime() < timeRangeMs,
      );

      if (input.format === "csv") {
        const headers =
          "timestamp,procedure,duration,memory,success,userId,type,error";
        const rows = filteredMetrics.map(
          (m) =>
            `${m.timestamp.toISOString()},${m.procedure},${m.duration},${m.memory},${m.success},${m.userId ?? ""},${m.type},"${m.error ?? ""}"`,
        );
        return {
          format: "csv",
          data: [headers, ...rows].join("\n"),
          count: filteredMetrics.length,
        };
      }

      return {
        format: "json",
        data: filteredMetrics,
        count: filteredMetrics.length,
        summary: metrics.summary,
      };
    }),
});

// Helper functions
function calculateHealthScore(
  metrics: {
    procedure: string;
    duration: number;
    memory: number;
    timestamp: Date;
    userId?: string;
    success: boolean;
    error?: string;
    type: "query" | "mutation" | "subscription";
  }[],
): number {
  if (metrics.length === 0) return 100;

  const avgDuration =
    metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
  const errorRate = metrics.filter((m) => !m.success).length / metrics.length;
  const slowQueries =
    metrics.filter((m) => m.duration > 1000).length / metrics.length;

  let score = 100;
  score -= Math.min(avgDuration / 50, 40); // Penalize high average duration
  score -= errorRate * 50; // Penalize errors heavily
  score -= slowQueries * 30; // Penalize slow queries

  return Math.max(Math.round(score), 0);
}

function getSystemStatus(
  metrics: {
    procedure: string;
    duration: number;
    memory: number;
    timestamp: Date;
    userId?: string;
    success: boolean;
    error?: string;
    type: "query" | "mutation" | "subscription";
  }[],
): "healthy" | "degraded" | "critical" {
  const healthScore = calculateHealthScore(metrics);

  if (healthScore >= 80) return "healthy";
  if (healthScore >= 50) return "degraded";
  return "critical";
}

function getActiveAlerts(
  metrics: {
    procedure: string;
    duration: number;
    memory: number;
    timestamp: Date;
    userId?: string;
    success: boolean;
    error?: string;
    type: "query" | "mutation" | "subscription";
  }[],
): string[] {
  const alerts: string[] = [];

  if (metrics.length === 0) return alerts;

  const avgDuration =
    metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
  const errorRate = metrics.filter((m) => !m.success).length / metrics.length;
  const criticalQueries = metrics.filter((m) => m.duration > 5000).length;

  if (avgDuration > 2000) {
    alerts.push(`High average response time: ${Math.round(avgDuration)}ms`);
  }

  if (errorRate > 0.05) {
    alerts.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
  }

  if (criticalQueries > 0) {
    alerts.push(`${criticalQueries} critical queries (>5s) detected`);
  }

  const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
  if (memoryUsage > 500) {
    alerts.push(`High memory usage: ${Math.round(memoryUsage)}MB`);
  }

  return alerts;
}
