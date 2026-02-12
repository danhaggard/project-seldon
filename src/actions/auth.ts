"use server";

import { createClient } from "@/lib/supabase/server"; // Use your server client!
import {
  ForgotPasswordSchema,
  ForgotPasswordState,
} from "@/lib/definitions/auth";
import { LoginFormSchema, LoginFormState } from "@/lib/definitions/auth";
import { SignupFormSchema, SignupFormState } from "@/lib/definitions/auth";
import {
  UpdatePasswordSchema,
  UpdatePasswordState,
} from "@/lib/definitions/auth";
import { redirect } from "next/navigation";

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
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
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
  redirect("/");
}

export async function signup(
  state: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  // 1. Validate form fields using Zod
  const rawEmail = formData.get("email") as string;
  const rawPassword = formData.get("password") as string;
  const rawRepeatPassword = formData.get("repeat-password") as string;

  const validatedFields = SignupFormSchema.safeParse({
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
        email: rawEmail, // 👈 Echo the email back so the form can "remember" it
      },
    };
  }

  // 3. Prepare data for insertion
  const { email, password } = validatedFields.data;
  const supabase = await createClient();

  // 4. Call Supabase Auth
  const { error } = await supabase.auth.signUp({
    email,
    password,
    // Ensure you have this configured in Supabase > Authentication > URL Configuration
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      message: error.message,
      inputs: {
        email: rawEmail, // 👈 Also return it here if Supabase fails (e.g., rate limit)
      },
    };
  }

  // 5. Success! Redirect the user
  // Note: We throw redirect outside the try/catch block usually, but here
  // we are at the end of the function so it's safe.
  redirect("/auth/sign-up-success");
  //refresh();
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Redirecting from a Server Action automatically invalidates the cache
  redirect("/auth/login");
}

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

  redirect("/protected");
}
