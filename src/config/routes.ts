// src/config/routes.ts

export const routes = {
  // Top-level
  home: "/",
  forbidden: "/403-forbidden",
  account: "/account",
  admin: "/admin",
  protected: "/protected",

  // Auth Flow
  auth: {
    login: "/auth/login",
    signUp: "/auth/sign-up",
    signUpSuccess: "/auth/sign-up-success",
    forgotPassword: "/auth/forgot-password",
    updatePassword: "/auth/update-password",
    updatePasswordSuccess: "/auth/update-password-success",
    error: "/auth/error",
    // API / Route Handlers
    callback: "/auth/callback",
    confirm: "/auth/confirm",
  },

  // Gurus Domain
  gurus: {
    index: "/gurus",
    // Using functions for dynamic routes ensures type-safe parameter passing
    detail: (slug: string) => `/gurus/${slug}`,
    edit: (slug: string) => `/gurus/${slug}/edit`,
    addPrediction: (slug: string) => `/gurus/${slug}/add-prediction`,
    
    // For your intercepting route: @modal/(.)predictions/[id]
    // Even though it's intercepted as a modal, the URL structure remains logical
    predictionDetail: (slug: string, id: string) => `/gurus/${slug}/predictions/${id}`,
    predictionEdit: (slug: string, id: string) => `/gurus/${slug}/predictions/${id}/edit`,
  },


} as const;

// Optional: Extract types if you want to heavily type your components
export type AppRoutes = typeof routes;

type ExtractStringValues<T> = T extends string
  ? T
  : T extends (...args: unknown[]) => unknown
  ? never // Ignore dynamic route functions
  : T extends object
  ? { [K in keyof T]: ExtractStringValues<T[K]> }[keyof T] // Recurse into nested objects
  : never;

// 2. Export the generated union type
export type StaticAppRoute = ExtractStringValues<typeof routes>;