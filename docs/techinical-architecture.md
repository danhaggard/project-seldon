# Project Seldon: Technical Architecture Overview

This document provides a high-level overview of the technical stack, infrastructure, and application architecture powering Project Seldon.

## Core Tech Stack

* **Framework:** Next.js (React) utilizing the App Router paradigm. We heavily leverage React Server Components (RSCs) for initial data fetching and performance, and Server Actions for secure data mutations. * **Database & Backend:** Supabase (PostgreSQL). We utilize Supabase not just as a database, but as a complete backend-as-a-service, handling Authentication and Row Level Security (RLS) directly at the database layer.
* **Styling:** Tailwind CSS for rapid, utility-first UI development.
* **Deployment:** Vercel, optimizing our Next.js application for edge delivery and seamless CI/CD.

## Local Development & Database Evolution

We embrace a "database-first" development workflow. 
* **Local Supabase:** We run Supabase locally using the Supabase CLI. This ensures developers have a full replica of the production database environment, including Auth, Storage, and Edge Functions.
* **Migrations:** Database schema changes, Row Level Security (RLS) policies, and permission seeding are entirely managed via SQL migration files. This allows us to safely version-control our database state and evolve the schema over time without manual intervention in a UI. We use the CLI to generate TypeScript types directly from our local database schema, ensuring full end-to-end type safety.

## Authentication & Security (RBAC)

Project Seldon implements a highly secure, custom Role-Based Access Control (RBAC) system.
* **JWT Claims:** Instead of querying a roles table on every request, we use a Supabase Auth Hook to inject user permissions directly into their JWT (JSON Web Token) upon login. * **"Own vs. Any" Paradigm:** Permissions are strictly categorized by ownership (e.g., a standard user might have `predictions.update.own`, while a moderator has `predictions.update.any`).
* **Multi-layered Defense:** 1.  **Next.js Edge Middleware:** Intercepts requests and reads the JWT to instantly block unauthorized users from protected routes (like `/admin` or `/edit` paths).
    2.  **Server Components/Actions:** Verify specific row-level ownership before rendering UI or executing mutations.
    3.  **Postgres RLS:** The final, bulletproof layer of defense; database policies reject any query that violates the user's JWT permissions.

## Application Structure (Next.js App Router)

Our `app/` directory is structured to separate global concerns from feature-specific domains.

### Key Route Directories
* **(Global Pages):** `/account`, `/admin`, `/auth`, `/403-forbidden`, and `/protected` handle global user states, authentication flows, and administrative dashboards.
* **(Feature Domain):** `/gurus` is our primary dynamic feature domain.
    * `/gurus/[slug]`: The main public profile page for a Guru.
    * `/gurus/[slug]/edit`: The protected form for editing a Guru's details.
    * `/gurus/[slug]/predictions/[id]/edit`: The deeply nested protected route for updating a specific prediction.

### Advanced Routing Patterns: Intercepted Routes
We make use of Next.js **Intercepted Routes** combined with **Parallel Routes** to create seamless, context-aware UI flows. 
As seen in our `app/gurus/[slug]/@modal/(.)predictions/[id]` folder structure:
* When a user clicks on a prediction from a Guru's profile, Next.js *intercepts* the route (`(.)predictions/[id]`) and renders the Prediction Details inside a modal over the current page (managed by the `@modal` slot).
* This keeps the user anchored in their current context without forcing a full page navigation, while still updating the URL so the specific prediction can be linked or refreshed directly. 