---
name: layout-primitives
description: Extract layout logic into semantic, polymorphic React components. Ensure parent layouts own their grid cells, and never hijack visual UI components just for their DOM structure.
---

# Layout Primitives & Structural Ownership

## Why It Matters

While Tailwind CSS is incredibly fast for styling, it can create significant "visual noise" in your React tree. When every standard HTML element is flooded with layout utility classes (e.g., `<article className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4">`), it becomes difficult to scan a file and understand the macro-structure of the page.

Furthermore, when layout responsibilities are scattered across multiple files, layouts become brittle. By extracting standard spacing patterns into Layout Primitives (like `<PageStack>` or `<PageContainer>`), your code becomes self-documenting, semantically correct, and structurally bulletproof.

## 1. Layouts Own Their Cells (Symmetrical Column Ownership)

**Rule:** The component that defines a CSS Grid or Flex container must also define the structural wrappers and layout constraints for its immediate children.

Do not pass layout-critical constraints (like `sticky`, `top-*`, `h-screen`, or outer `p-*`) down into slot content, child components, or specialized shells.

This ensures that whenever you look at a layout file (like `MainLayout`), you can see the entire structural skeleton of the page at a single glance.

### Incorrect Example ❌

The grid is defined in `layout.tsx`, but the constraints for the right column are hidden inside the child slot, making the layout impossible to understand from the parent level.

```tsx
// src/app/(main)/layout.tsx
export default function MainLayout({ children, rightSidebar }) {
  return (
    <div className="grid grid-cols-[240px_1fr_300px] gap-6">
      <main>{children}</main>
      {/* ❌ BAD: What are the constraints of this column? We have to open another file to find out. */}
      {rightSidebar}
    </div>
  );
}

// src/components/layout/RightSidebarShell.tsx
export function RightSidebarShell({ children }) {
  // ❌ BAD: A child component dictating its parent grid cell's layout.
  return (
    <aside className="sticky top-14 h-screen py-6">
      {children}
    </aside>
  );
}
```

### Correct Example ✅

The layout component owns all of its cells, and the child component is a spacing-agnostic stack.

```tsx
// src/app/(main)/layout.tsx
export default function MainLayout({ children, rightSidebar }) {
  return (
    <div className="grid grid-cols-[240px_1fr_300px] gap-6">
      <main className="py-6">{children}</main>

      {/* ✅ GOOD: The layout owns the structural constraints of the slot. */}
      {rightSidebar && (
        <aside className="sticky top-14 h-screen py-6">
          {rightSidebar}
        </aside>
      )}
    </div>
  );
}
```

## 2. Polymorphic Layout Primitives

When creating reusable layout wrappers to enforce vertical rhythm (like `gap-8` between page sections), you must account for semantic HTML. A generic `<div className="flex flex-col gap-8">` is bad for accessibility if the content is actually an `<article>`, a `<main>`, or a `<form>`.

**Rule:** Use the "Polymorphic" pattern (the `as` prop) to allow layout primitives to enforce CSS while respecting semantic HTML tags.

### Example: The `<PageStack>` Primitive

```tsx
// src/components/layout/page-stack.tsx
import { cn } from "@/lib/utils";
import React from "react";

interface PageStackProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export function PageStack({
  children,
  className,
  as: Component = "div", // Defaults to a div
  ...props
}: PageStackProps) {
  return (
    // Enforces the standard vertical rhythm across the entire app
    <Component
      className={cn("w-full flex flex-col gap-8", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
```

### Usage ✅

```tsx
// Renders as: <article class="w-full flex flex-col gap-8">
<PageStack as="article">
  <GuruHeader />
  <PredictionFeed />
</PageStack>

// Renders as: <form class="w-full flex flex-col gap-8">
<PageStack as="form" action={submitAction}>
  <FormHeader />
  <FormInputs />
</PageStack>
```

## 3. The "Component Abuse" Rule

**Rule:** Do not use visually opinionated components (like `<Card>`, `<Alert>`, or `<Modal>`) purely for their layout or DOM structure if you have to immediately override their core visual identity (e.g., using `border-none bg-transparent shadow-none`).

If you find yourself stripping away a component's visual styles just to access its internal padding or flex properties, you are experiencing the "Invisible Margin" effect. Instead, use a Layout Primitive or write standard semantic HTML with Tailwind flex/grid classes.

### Incorrect Example ❌

```tsx
// ❌ BAD: Hijacking a Card just to get a title and content area,
// resulting in trapped, invisible padding.
<FormCard
  className="border-none py-0 shadow-none bg-transparent"
  title={<h1>Edit Prediction</h1>}
>
  <FormContent>...</FormContent>
</FormCard>
```

### Correct Example ✅

```tsx
// ✅ GOOD: Using raw semantic elements and flexbox for clean, predictable layout.
<div className="flex flex-col gap-8 w-full">
  <div className="flex flex-col gap-1">
    <h1 className="text-3xl font-bold">Edit Prediction</h1>
  </div>
  <FormContent>...</FormContent>
</div>
```
