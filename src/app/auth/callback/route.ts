import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // The 'next' param lets you specify where to send the user after they log in.
  // Defaulting to the account page or home.
  const next = requestUrl.searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();

    // This is the crucial PKCE method: it swaps the code in the URL for a secure session cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } else {
      console.error("Auth Callback Error:", error.message);
      return NextResponse.redirect(
        new URL(
          `/auth/error?error=${encodeURIComponent(error.message)}`,
          requestUrl.origin,
        ),
      );
    }
  }

  // If there's no code, redirect to an error page
  return NextResponse.redirect(
    new URL(`/auth/error?error=Missing Auth Code`, requestUrl.origin),
  );
}
