---
name: spacing-tailwind
description: Use Flexbox/Grid with `gap` instead of `space-*` utilities, and adhere to the Seldon spacing scale.
---

# Spacing: Tailwind Utilities & The Seldon Scale

## Why It Matters

Tailwind's `space-y-*` and `space-x-*` classes are legacy utilities that apply `margin-top` or `margin-left` to immediate child elements using the lobotomized owl selector (`> * + *`). 

While convenient, they are inherently fragile in React applications:
1. **Conditional Rendering Bugs:** If a React component returns `null` or a `<React.Fragment>`, the `space-*` utility can apply margins incorrectly, creating visual gaps where none should exist.
2. **Margin Collisions:** Mixing `space-*` on a parent with `mt-*` or `mb-*` on a child creates unpredictable layout conflicts. 

Using `flex` or `grid` combined with `gap-*` is mathematically predictable. The layout engine creates spaces *between* elements regardless of their HTML output, ensuring a bulletproof layout. Furthermore, adhering to a defined spacing scale prevents the UI from looking chaotic.

## Incorrect Example ❌

```tsx
// ❌ BAD: Relies on CSS margin injection and uses arbitrary values.
export function GuruProfile({ guru, isEditing }) {
  return (
    // space-y-4 injects margin-top on all children except the first
    <div className="space-y-4 px-4 py-6">
      <h1 className="text-2xl">{guru.name}</h1>
      
      {/* If isEditing is false and returns null, space-y might still apply weirdly depending on DOM output */}
      {isEditing && <EditAlert />}
      
      <p className="text-gray-600">{guru.bio}</p>
      
      {/* ❌ BAD: Child dictating an arbitrary margin that fights the parent's space-y */}
      <div className="mt-10"> 
        <PredictionList />
      </div>
    </div>
  );
}
```

```tsx
// ✅ GOOD: Uses flex layout with gap, and respects the standardized scale.
export function GuruProfile({ guru, isEditing }) {
  return (
    // 'flex-col' + 'gap-8' completely controls the vertical rhythm.
    <div className="flex flex-col gap-8 px-4 py-8">
      
      {/* Group closely related items with a smaller gap */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{guru.name}</h1>
        {isEditing && <EditAlert />}
        <p className="text-muted-foreground">{guru.bio}</p>
      </div>
      
      {/* The parent's gap-8 naturally pushes this down. No 'mt-*' needed! */}
      <div> 
        <PredictionList />
      </div>
    </div>
  );
}
```

## Additional Context & Rules

### The Seldon Spacing Scale
To reduce cognitive load and maintain a tight visual rhythm, limit your spacing choices to these semantic buckets:

- **Micro Spacing (gap-1, gap-2, gap-3):** Use case: Tight coupling.

  - Examples: An icon inside a button next to text; a user's avatar next to their username; a heading directly above a short subtitle.

- **Component Spacing (gap-4, gap-6):** Use case: Standard layout separation.

  - Examples: Spacing between form fields; space between cards in a grid; space between a section title and the content body.

- **Section Spacing (gap-8, gap-12, gap-16):** Use case: Macro page rhythm.

  - Examples: Separating the Page Header from the Main Content; space between completely distinct functional zones (e.g., the Guru Stats section vs. the Discussion Feed).

### Margins vs. Padding
- Prefer padding (p-, px-, py-) on wrapper containers to push content inward.
- Avoid margins (m-, mt-, mb-) unless pushing a specific element to the edge of a flex container (e.g., using ml-auto to push a button to the far right).