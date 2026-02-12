import * as z from "zod";

export const ProfileFormSchema = z.object({
  fullName: z.string().trim().nullable().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(20, { message: "Username must be under 20 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Only letters, numbers, and underscores allowed.",
    })
    .trim()
    .nullable()
    .optional(),
  website: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .nullable()
    .optional()
    .or(z.literal("")),
});

export type ProfileFormState =
  | {
      errors?: {
        fullName?: string[];
        username?: string[];
        website?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;
