import { z } from "zod";

// 1. Zod Schema Define Karein
export const connectionFormSchema = z.object({
  phone_number_id: z.string().min(1, "Phone Number ID is required"),
  access_token: z.string().min(1, "Access Token is required"),
  waba_id: z.string().min(1, "WABA ID is required"),
  display_phone_number: z.string().min(1, "Display Phone Number is required"),
});

// 2. TypeScript Type Extract Karein (Optional par achi practice hai)
export type ConnectionFormValues = z.infer<typeof connectionFormSchema>;