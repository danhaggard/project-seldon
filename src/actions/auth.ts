"use server";

import { createClient } from "@/lib/supabase/server";
import * as z from "zod";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

const ForgotPasswordSchema = z.object({
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

export async function forgotPassword(
  state: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = formData.get("email") as string;

  // 1. Validate
  const validatedFields = ForgotPasswordSchema.safeParse({ email });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      inputs: { email },
    };
  }

  // 2. Call Supabase
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // This redirects them to the page where they type their NEW password
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}${routes.auth.updatePassword}`,
  });

  if (error) {
    return {
      message: error.message,
      inputs: { email },
    };
  }

  // 3. Success (We don't redirect, we just return success: true to show the "Check email" card)
  return {
    success: true,
  };
}

const LoginFormSchema = z.object({
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
      success?: boolean;
      inputs?: {
        email: string;
      };
    }
  | undefined;

export async function login(
  state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. Validate fields
  const validatedFields = LoginFormSchema.safeParse({
    email,
    password,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      inputs: { email },
    };
  }

  // 2. Auth with Supabase
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      message: error.message, // e.g. "Invalid login credentials"
      inputs: { email },
    };
  }

  // 3. Success!
  const isModal = formData.get("isModal") === "true";

  if (isModal) {
    return { success: true };
  }

  redirect(routes.home);
}

export async function checkUsername(username: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  // If no data is returned, the username is unique (available)
  return !data;
}

const SignupFormSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Only letters, numbers, and underscores allowed",
      )
      .trim(),
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
        username?: string[];
        email?: string[];
        password?: string[];
        repeatPassword?: string[]; // Add this
      };
      message?: string;
      success?: boolean;
      inputs?: {
        username: string;
        email: string;
      };
    }
  | undefined;

export async function signup(
  state: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  // 1. Validate form fields using Zod
  const rawUsername = formData.get("username") as string;
  const rawEmail = formData.get("email") as string;
  const rawPassword = formData.get("password") as string;
  const rawRepeatPassword = formData.get("repeat-password") as string;

  const validatedFields = SignupFormSchema.safeParse({
    username: rawUsername,
    email: rawEmail,
    password: rawPassword,
    repeatPassword: rawRepeatPassword,
  });

  // 2. If validation fails, return errors immediately
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Account.",
      inputs: {
        username: rawUsername,
        email: rawEmail, // 👈 Echo the email back so the form can "remember" it
      },
    };
  }

  // 3. Prepare data for insertion
  const { username, email, password } = validatedFields.data;
  const supabase = await createClient();

  // 4. Call Supabase Auth
  const { error } = await supabase.auth.signUp({
    email,
    password,
    // Ensure you have this configured in Supabase > Authentication > URL Configuration
    options: {
      data: {
        username,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}${routes.auth.callback}`,
    },
  });

  if (error) {
    return {
      message: error.message,
      inputs: {
        email: rawEmail, // 👈 Also return it here if Supabase fails (e.g., rate limit)
        username: rawUsername,
      },
    };
  }

  // 5. Success! Redirect the user
  const isModal = formData.get("isModal") === "true";

  if (isModal) {
    return { success: true };
  }

  redirect(routes.auth.signUpSuccess);
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Redirecting from a Server Action automatically invalidates the cache
  redirect(routes.auth.login);
}

const UpdatePasswordSchema = z
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

export async function updatePassword(
  state: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const password = formData.get("password") as string;
  const repeatPassword = formData.get("repeatPassword") as string;

  // 1. Validate both fields
  const validatedFields = UpdatePasswordSchema.safeParse({
    password,
    repeatPassword,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // 2. Update via Supabase (We only send the actual password)
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  redirect(routes.protected);
}
