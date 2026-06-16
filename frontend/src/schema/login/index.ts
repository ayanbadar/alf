import * as z from "zod";

export const signInSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email is required." })
        .email({ message: "Please enter a valid email address." })
        .trim()
        .toLowerCase(),
    password: z
        .string()
        .min(1, { message: "Password is required." })
        .min(8, { message: "Password must be at least 8 characters long." }),
});

export type SignInInput = z.infer<typeof signInSchema>;