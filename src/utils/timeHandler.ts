/**
 * Converts a time string in 12-hour format (e.g., "02:00 PM", "05:30 AM") to the equivalent number of minutes past midnight.
 * @param timeStr - The time string in "hh:mm AM/PM" format.
 * @returns The total minutes past midnight.
 */
export const convertTimeStringToMin = (timeStr: string): number => {
  const timePattern = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
  const match = timePattern.exec(timeStr);

  if (!match) {
    throw new Error("Invalid time format. Expected format: hh:mm AM/PM");
  }

  const [, hours, minutes, period] = match;
  let totalMinutes = parseInt(hours!, 10) * 60 + parseInt(minutes!, 10);

  // Adjust for PM period (excluding 12 PM)
  if (period!.toUpperCase() === "PM" && parseInt(hours!, 10) !== 12) {
    totalMinutes += 12 * 60;
  }

  // Adjust for 12 AM
  if (period!.toUpperCase() === "AM" && parseInt(hours!, 10) === 12) {
    totalMinutes -= 12 * 60;
  }

  return totalMinutes;
};
/**
 * Converts a number of minutes past midnight into a time string in 12-hour format with AM/PM.
 * Ensures the hour is always two digits.
 * @param minutes - The total minutes past midnight.
 * @returns The formatted time string in "hh:mm AM/PM" format.
 */
export const convertMinsToTimeString = (minutes: number): string => {
  if (minutes < 0 || minutes >= 24 * 60) {
    throw new Error("Minutes should be in the range of 0 to 1439.");
  }

  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const period = hours24 >= 12 ? "PM" : "AM";
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12; // fix midnight (0) and noon (12)

  const formattedHours = hours12.toString(); // no leading zero for hours in 12-hr format
  const formattedMins = mins.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMins} ${period}`;
};

export const convertDateStringToMin = (dateString: string): number => {
  // Parse the date string into a Date object
  const date = new Date(dateString);

  // Get the local hours and minutes
  const localHours = date.getHours();
  const localMinutes = date.getMinutes();

  // Calculate the total minutes since midnight
  const totalMinutes = localHours * 60 + localMinutes;

  return totalMinutes;
};

/**
 * Converts a number of minutes since midnight UTC to an ISO date-time string in IST.
 *
 * @param minutes - The number of minutes since midnight UTC.
 * @returns An ISO date-time string representing the time on the current IST date.
 *
 * @example
 * const minutes = 750; // 12:30 PM UTC
 * const result = convertTimeToDateTime(minutes);
 * console.log(result); // Output: "2024-12-10T18:00:00.000Z" (current IST date)
 */
export const convertTimeToDateTime = (minutes: number): string => {
  // Get the current date in UTC without the time portion
  const currentUTCDate = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
    ),
  );

  // Add minutes and IST offset (5 hours 30 minutes)
  const ISTOffset = 5.5 * 60 * 60000; // Offset in milliseconds
  const targetDateTime = new Date(
    currentUTCDate.getTime() + minutes * 60000 + ISTOffset,
  );

  return targetDateTime.toISOString(); // Return ISO formatted string
};

/**
 * Converts a number of minutes since midnight UTC to a Date object in IST.
 *
 * @param minutes - The number of minutes since midnight UTC.
 * @returns A Date object representing the time on the current IST date.
 *
 * @example
 * const minutes = 630; // 10:30 AM UTC
 * const result = convertMinToDate(minutes);
 * console.log(result); // Outputs: Tue Dec 10 2024 16:00:00 GMT+0530 (IST)
 */
export const convertMinToDate = (minutes: number): Date => {
  // Get the current date in UTC without the time portion
  const currentUTCDate = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
    ),
  );

  // Add minutes and IST offset (5 hours 30 minutes)
  const ISTOffset = 5.5 * 60 * 60000; // Offset in milliseconds
  const targetDate = new Date(
    currentUTCDate.getTime() + minutes * 60000 - ISTOffset,
  );

  return targetDate; // Return the Date object
};

export const convertDateTimeToMin = (date: Date): number => {
  // Extract the hours and minutes from the date
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Convert hours to minutes and add the minutes
  return hours * 60 + minutes;
};
