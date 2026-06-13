import { z } from "zod";

export const signUpSchema = z.object({
    "organization_name": z
        .string()
        .min(1, { message: "Agency name is required." })
        .min(2, { message: "Agency name must be at least 2 characters long." })
        .max(50, { message: "Agency name cannot exceed 50 characters." })
        .trim(),

    name: z
        .string()
        .min(1, { message: "Your name is required." })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." })
        .regex(/^[a-zA-Z\s]*$/, { message: "Name can only contain letters and spaces." })
        .trim(),

    email: z
        .string()
        .min(1, { message: "Email address is required." })
        .email({ message: "Please enter a valid professional email address." })
        .trim()
        .toLowerCase(),

    password: z
        .string()
        .min(1, { message: "Password is required." })
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
        .regex(/[0-9]/, { message: "Password must contain at least one number." }),
});

// Extract the TypeScript type from the schema
export type SignUpInput = z.infer<typeof signUpSchema>;