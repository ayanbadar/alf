import * as z from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim() // Removes leading/trailing whitespace
    .min(3, { message: "Full name must be at least 3 characters" })
    .max(25, { message: "Full name cannot exceed 25 characters" })
});

export type ProfileSchemaType = z.infer<typeof profileSchema>;