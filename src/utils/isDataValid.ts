import { z } from "zod";
// import { EventSchema } from "../event.schema";

/**
 * Validates JSON data against a Zod schema
 * @param data - The JSON data to validate
 * @param schema - The Zod schema to validate against
 * @returns An object containing validation result and optional error
 */
export function isDataValid<T extends z.ZodTypeAny>(
  data: unknown,
  schema: T,
): {
  isValid: boolean;
  error?: z.ZodError<z.infer<T>>;
} {
  try {
    // Attempt to parse the data against the schema
    schema.parse(data);

    // If parsing succeeds, return true
    return {
      isValid: true,
    };
  } catch (error) {
    // If parsing fails, return false and the error
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error,
      };
    }

    // Fallback for unexpected errors
    return {
      isValid: false,
      error: new z.ZodError([
        {
          code: "custom",
          path: [],
          message: "Unexpected validation error",
        },
      ]),
    };
  }
}