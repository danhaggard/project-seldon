// src/config/routes.ts


function gurusDetail<S extends string>(slug: S): S extends `${infer R}` ? `/gurus/${R}` : `/gurus/slug` {
  return `/gurus/${slug}` as S extends `${infer R}` ? `/gurus/${R}` : `/gurus/slug`;
}

function gurusEdit<S extends string>(slug: S): S extends `${infer R}` ? `/gurus/${R}/edit` : `/gurus/slug/edit` {
  return `/gurus/${slug}/edit` as S extends `${infer R}` ? `/gurus/${R}/edit` : `/gurus/slug/edit`;
}

function gurusAddPrediction<S extends string>(slug: S): S extends `${infer R}` ? `/gurus/${R}/add-prediction` : `/gurus/slug/add-prediction` {
  return `/gurus/${slug}/add-prediction` as S extends `${infer R}` ? `/gurus/${R}/add-prediction` : `/gurus/slug/add-prediction`;
}

function gurusPredictionDetail<S extends string, T extends string>(slug: S, id: T): S extends `${infer R}` ? `/gurus/${R}/predictions/${T}` : `/gurus/slug/predictions/id` {
  return `/gurus/${slug}/predictions/${id}` as S extends `${infer R}` ? `/gurus/${R}/predictions/${T}` : `/gurus/slug/predictions/id`;
}

function gurusPredictionEdit<S extends string, T extends string>(slug: S, id: T): S extends `${infer R}` ? `/gurus/${R}/predictions/${T}/edit` : `/gurus/slug/predictions/id/edit` {
  return `/gurus/${slug}/predictions/${id}/edit` as S extends `${infer R}` ? `/gurus/${R}/predictions/${T}/edit` : `/gurus/slug/predictions/id/edit`;
}

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
    detail: gurusDetail,
    create: "/gurus/create",
    edit: gurusEdit,
    addPrediction: gurusAddPrediction,
    
    // For your intercepting route: @modal/(.)predictions/[id]
    // Even though it's intercepted as a modal, the URL structure remains logical
    predictionDetail: gurusPredictionDetail,
    predictionEdit: gurusPredictionEdit,
  },


} as const;

// Optional: Extract types if you want to heavily type your components
export type AppRoutes = typeof routes;

type ExtractStringValues<T> = T extends string
  ? T
  : T extends (...args: unknown[]) => infer R
  ? R
  : T extends object
  ? { [K in keyof T]: ExtractStringValues<T[K]> }[keyof T] // Recurse into nested objects
  : never;

// 2. Export the generated union type
export type StaticAppRoute = ExtractStringValues<typeof routes>;