"use client";

import { api } from "@/trpc/react";
import React from "react";

const Admin: React.FC = () => {
  const { data: metrics } = api.monitoring.getPerformanceMetrics.useQuery();
  const { data: realtime } = api.monitoring.getRealtimeStats.useQuery(
    undefined,
    { refetchInterval: 5000 },
  );

  return (
    <main className="flex h-screen w-full flex-col items-center justify-start gap-6 p-6">
      <h1 className="text-2xl font-bold">ICI Fest 2025 Admin Dashboard</h1>

      {/* --- Realtime Summary Table --- */}
      {realtime && (
        <section className="w-full max-w-3xl">
          <h2 className="mb-2 text-lg font-semibold">Stats</h2>
          <table className="w-full border-collapse rounded-lg border border-gray-300 text-sm shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Window</th>
                <th className="border px-3 py-2 text-center">Total Requests</th>
                <th className="border px-3 py-2 text-center">
                  Avg Response Time
                </th>
                <th className="border px-3 py-2 text-center">Error Rate</th>
                <th className="border px-3 py-2 text-center">Slow Queries</th>
                <th className="border px-3 py-2 text-center">
                  Critical Queries
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2 font-medium">Last 5 Min</td>
                <td className="border px-3 py-2 text-center">
                  {realtime.last5Minutes.totalRequests}
                </td>
                <td className="border px-3 py-2 text-center">
                  {realtime.last5Minutes.averageResponseTime} ms
                </td>
                <td className="border px-3 py-2 text-center">
                  {realtime.last5Minutes.errorRate}
                </td>
                <td className="border px-3 py-2 text-center">
                  {realtime.last5Minutes.slowQueries}
                </td>
                <td className="border px-3 py-2 text-center">
                  {realtime.last5Minutes.criticalQueries}
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-medium">Last 1 Min</td>
                <td className="border px-3 py-2 text-center">
                  {realtime.last1Minute.totalRequests}
                </td>
                <td className="border px-3 py-2 text-center">
                  {realtime.last1Minute.averageResponseTime} ms
                </td>
                <td className="border px-3 py-2 text-center">
                  {realtime.last1Minute.errorRate}
                </td>
                <td className="border px-3 py-2 text-center">–</td>
                <td className="border px-3 py-2 text-center">–</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4">
            <p>
              <span className="font-medium">Health Score:</span>{" "}
              {realtime.currentStatus.healthScore}
            </p>
            <p>
              <span className="font-medium">System Status:</span>{" "}
              {realtime.currentStatus.status}
            </p>
            {realtime.currentStatus.alerts.length > 0 && (
              <ul className="mt-2 list-disc pl-6 text-red-600">
                {realtime.currentStatus.alerts.map((alert, i) => (
                  <li key={i}>{alert}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* --- Historical Metrics Summary --- */}
      {metrics && (
        <section className="w-full max-w-3xl">
          <h2 className="mb-2 text-lg font-semibold">Performance Summary</h2>
          <pre className="max-h-[400px] overflow-auto rounded bg-gray-900 p-4 text-xs text-green-400">
            {JSON.stringify(metrics.summary, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
};

export default Admin;
