import * as z from "zod";

import { Constants, Database } from "./database.types";

// This extracts "admin" | "moderator" | "user" directly from the DB schema
export type AppRole = Database["public"]["Enums"]["app_role"];

export const appRoles = Constants.public.Enums.app_role;

export const APP_ROLE = appRoles.reduce(
  (acc, key) => {
    acc[key.toUpperCase()] = key;
    return acc;
  },
  {} as Record<string, string>,
) as {
  [K in (typeof appRoles)[number] as Uppercase<K>]: K;
};

// 2. Derive the type from the object (optional but recommended)
export type AppRoleType = typeof APP_ROLE;

export const ForgotPasswordSchema = z.object({
  email: z.email({ message: "Please enter a valid email." }),
});

export type ForgotPasswordState =
  | {
      errors?: {
        email?: string[];
      };
      message?: string;
      success?: boolean; // We add a success flag to toggle the UI
      inputs?: {
        email: string;
      };
    }
  | undefined;

export const LoginFormSchema = z.object({
  email: z.email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password field must not be empty." }),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
      inputs?: {
        email: string;
      };
    }
  | undefined;

export const SignupFormSchema = z
  .object({
    email: z.email({ error: "Please enter a valid email." }).trim(),
    password: z
      .string()
      .min(8, { message: "Be at least 8 characters long" })
      .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
      .regex(/[0-9]/, { message: "Contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Contain at least one special character.",
      })
      .trim(),
    // Add validation for the repeat password field itself
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"], // This attaches the error to the repeatPassword field
  });

export type SignupFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
        repeatPassword?: string[]; // Add this
      };
      message?: string;
      inputs?: {
        email: string;
      };
    }
  | undefined;

export const UpdatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Be at least 8 characters long" })
      .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
      .regex(/[0-9]/, { message: "Contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Contain at least one special character.",
      })
      .trim(),
    repeatPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"], // Attaches error to the second field
  });

export type UpdatePasswordState =
  | {
      errors?: {
        password?: string[];
        repeatPassword?: string[];
      };
      message?: string;
    }
  | undefined;
