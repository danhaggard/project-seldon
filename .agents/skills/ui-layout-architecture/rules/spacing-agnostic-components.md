---
name: spacing-agnostic-components
description: UI components must be 100% flush to their bounding boxes. Differentiate between Layout components (which own space) and UI components (which fill space).
---

# Spacing-Agnostic Components

## Why It Matters

The most common cause of broken layouts, horizontal scrolling, and inconsistent vertical rhythm is components dictating their own external spacing. 

If a `<PredictionCard />` has a built-in `mt-4`, it looks fine in a vertical list. But the moment you try to use that exact same card in a horizontal scrolling carousel or a CSS Grid, that `mt-4` will break the alignment. 

To achieve maximum reusability, **UI components must be spacing-agnostic**. They should be completely flush to their outer bounding box, leaving the parent layout component responsible for arranging them .

## 1. The "Agnostic Component" Rule (No Outer Margins)

UI Components should **never** declare outer margins (`m-*`, `mt-*`, `mb-*`, `my-*`, `mx-*`) on their top-level element.

* **❌ Incorrect:** `<div className="mt-8 rounded-xl bg-card p-6">`
* **✅ Correct:** `<div className="rounded-xl bg-card p-6">`

If an element needs to be pushed away from another element, the *parent container* should handle it using Flexbox or CSS Grid with the `gap` property (see `spacing-tailwind.md`).

## 2. Padding vs. Margin (Inward vs. Outward)

While outer margins are forbidden on UI components, **padding is perfectly fine**.

* **Margin** pushes *outward* against siblings and parent containers. It fights the layout engine.
* **Padding** pushes *inward*. It simply tells the component's internal children to stay away from its own edges. 

**The Sidebar Example:**
When building our `SidebarContent` component, we removed the arbitrary `pr-4` right-padding from its root `<nav>`. The `<aside>` wrapper in the `MainLayout` already handled the padding for that grid column. Adding padding inside the child component resulted in invisible "double padding" that made the layout impossible to align from the outside.

## 3. Layout Components vs. UI Components

There is one major exception to the spacing rules: **Layout Components**. 

You must distinguish between a component that *owns* the space, and a component that *lives* in the space.

### Layout Components (They Own the Space)
Files like `src/app/layout.tsx` or `src/app/(main)/layout.tsx` define the macro-level scaffolding. It is their job to establish the global page boundaries. 

* **✅ Correct:** It is perfectly acceptable for `<main className="py-6">` in your `MainLayout` to declare vertical padding. It owns that CSS Grid cell and dictates that all content inside it should have 24px of breathing room from the global header.

### UI / Feature Components (They Live in the Space)
Components like `<DiscussionTab />`, `<PredictionFeedContainer />`, or `<EditPredictionForm />` are injected into Layout cells. 

* **❌ Incorrect:** `<DiscussionTab>` declaring `py-6` on its root wrapper. 
If the layout already has `py-6`, and the tab adds `py-6`, you get 48px of padding. If another tab (`<PredictionHistory />`) forgets to add `py-6`, your UI jumps up and down when switching tabs.

## Incorrect Example ❌

```tsx
// ❌ BAD: The component assumes it will always be used in a specific context.
// It dictates its own top margin and bottom padding.
export function DiscussionTab({ comments }) {
  return (
    <div className="mx-auto mt-8 w-full max-w-xl py-6 pb-24">
      <CommentTree comments={comments} />
    </div>
  );
}
```

## Correct Example ✅

```tsx
// ✅ GOOD: The component is 100% flush. It relies on padding for its internal
// structure (none needed here) and assumes the parent will space it.
export function DiscussionTab({ comments }) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <CommentTree comments={comments} />
    </div>
  );
}

// And the parent Layout or Page handles the spacing:
export default function GuruDetailPage() {
  return (
    // The parent uses gap-8 to push the DiscussionTab down from the tabs above it
    <PageStack className="gap-8">
       <TabsNav />
       <DiscussionTab />
    </PageStack>
  )
}
```