import type { tableConfigDataType } from "@/app/(admin)/admin/dashboard/schedule/scheduleTableConfig";

export const sortData = (data: tableConfigDataType[]) => {
  return data.sort((a, b) => {
    // Parse dates
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (dateA !== dateB) {
      return dateA - dateB; // Sort by date
    }

    return a.startTime - b.startTime; // If dates are the same, sort by startTime
  });
};
