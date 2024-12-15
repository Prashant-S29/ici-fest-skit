/**
 * Converts an ISO date-time string to a human-readable date format.
 *
 * @param dateTime - The ISO date-time string to convert. Example: "2024-12-09T18:30:00.000Z"
 * @returns A formatted date string in the format "DD Month, YYYY". Example: "9 December, 2024"
 *
 * @example
 * const dateTime = "2024-12-09T18:30:00.000Z";
 * const result = convertDateTimeToDate(dateTime);
 * console.log(result); // Output: "9 December, 2024"
 */
export const convertDateTimeToDate = (dateTime: string): string => {
  const dateObj = new Date(dateTime);
  const day = dateObj.getUTCDate(); // Extract day of the month (1-31)
  const month = dateObj.toLocaleString("default", { month: "long" }); // Full month name
  const year = dateObj.getUTCFullYear(); // Extract year
  return `${day} ${month}, ${year}`;
};

/**
 * Converts a human-readable date string to an ISO date-time string.
 *
 * @param date - The date string in the format "DD Month, YYYY". Example: "9 December, 2024"
 * @returns An ISO date-time string. Example: "2024-12-09T00:00:00.000Z"
 *
 * @example
 * const readableDate = "9 December, 2024";
 * const result = convertDateToDateTime(readableDate);
 * console.log(result); // Output: "2024-12-09T00:00:00.000Z"
 */
export const convertDateToDateTime = (date: string): string => {
  const [day, month, year] = date.split(/[\s,]+/); // Split by space and comma
  const monthIndex = new Date(`${month} 1, 2024`).getMonth(); // Get numeric month index (0-11)
  const formattedDate = new Date(
    Date.UTC(Number(year), monthIndex, Number(day)),
  );
  return formattedDate.toISOString(); // Return ISO formatted string
};
