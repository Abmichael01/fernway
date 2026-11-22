import { z } from "zod";

/** Admin form and API payload. Spaces and capitals are tidied; an empty string clears the address. */
export const siteSettingsSchema = z.object({
  supportEmail: z
    .string()
    .trim()
    .toLowerCase()
    .max(120, "Keep it under 120 characters.")
    .refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid email address, or leave it empty."),
});

export type SiteSettingsValues = z.input<typeof siteSettingsSchema>;
