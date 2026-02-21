---
name: ui-layout-architecture
description:
  Strict guidelines for managing layout, spacing, typography, and design-system componentization using Tailwind CSS and React. Ensures consistent visual rhythm and highly reusable components.
---

# UI Layout Architecture

This skill defines the structural and visual layout strategy for Project Seldon. It enforces the separation of concerns between components and their surrounding layout, deprecates unpredictable Tailwind utilities, and codifies the use of structural primitives, typography scales, and visual treatments to maintain a clean, readable codebase.

## When to Apply

Reference these guidelines when:
- Building new UI components or pages.
- Refactoring existing UI to fix layout inconsistencies or spacing bugs.
- Deciding between Tailwind spacing utilities (e.g., margins vs. padding, gap vs. space-y).
- Selecting font sizes, weights, and line heights for new text elements.
- Sizing icons for buttons or inline text.
- Applying shadows, borders, or animations to interactive elements.
- Creating new layout-focused wrapper components.
- Reviewing PRs for design-system compliance.

## Rule Categories by Priority

| Priority | Category                | Impact | Prefix          |
| -------- | ----------------------- | ------ | --------------- |
| 1        | Spacing & Positioning   | HIGH   | `spacing-`      |
| 2        | Layout & Grid           | HIGH   | `layout-`       |
| 3        | Typography              | HIGH   | `typography-`   |
| 4        | Colors & Theming        | MEDIUM | `theme-`        |
| 5        | Icons                   | MEDIUM | `icon-`         |
| 6        | Elevation & Borders     | LOW    | `elevation-`    |
| 7        | Motion & Animation      | LOW    | `motion-`       |

## Quick Reference

### 1. Spacing & Positioning (HIGH)

See [spacing-tailwind.md](./rules/spacing-tailwind.md) for:
- Deprecating `space-y-*` and `space-x-*` in favor of Flexbox/Grid with `gap`.
- Standardizing the Seldon spacing scale (e.g., when to use `gap-2` vs `gap-8`).
- Handling padding vs. margin correctly to prevent container collapse.

See [spacing-agnostic-components.md](./rules/spacing-agnostic-components.md) for:
- The "Agnostic Component" rule: Why UI components must never dictate their own outer margins (`mt-*`, `mb-*`, `my-*`).
- Ensuring components are 100% flush to their bounding boxes for absolute reusability.

### 2. Layout & Grid (HIGH)

See [layout-primitives.md](./rules/layout-primitives.md) for:
- Moving away from noisy, inline Tailwind layout classes on standard HTML elements (e.g., `<article className="...">`).
- Using and extending semantic layout primitives like `<PageContainer>`, `<Stack>`, and `<Row>`.
- Self-documenting page structures for easier visual scanning.

See [layout-grid-breakpoints.md](./rules/layout-grid-breakpoints.md) for:
- Seldon's specific responsive breakpoints (`sm`, `md`, `lg`, `xl`).
- Container max-widths for different contexts (e.g., `max-w-xl` for reading/discussion, `max-w-7xl` for main dashboards).
- Implementing CSS Grid for structured data versus Flexbox for linear layouts.

### 3. Typography (HIGH)

See [typography-scale.md](./rules/typography-scale.md) for:
- Font family usage (Inter for standard UI, specialized fonts if applicable).
- Standardized text sizing for specific scenarios (e.g., `text-2xl font-bold` for Page Headers, `text-sm leading-relaxed` for standard paragraph text, `text-xs text-muted-foreground` for meta-data).
- Proper use of line heights (`leading-*`) and tracking (`tracking-*`) for readability.

### 4. Colors & Theming (MEDIUM)

See [theme-colors.md](./rules/theme-colors.md) for:
- Using semantic CSS variables (e.g., `bg-background`, `text-primary`) instead of raw color scales (e.g., `bg-white`, `text-slate-900`) to support dark mode.
- Consistent application of background surfaces and text contrast.

### 5. Icons (MEDIUM)

See [icon-sizing.md](./rules/icon-sizing.md) for:
- Standard sizing for Lucide React icons based on their context.
- Standalone icon buttons (e.g., `w-5 h-5` inside a `p-2` button).
- Icons paired with text (e.g., `w-4 h-4 mr-2` paired with `text-sm` font).

### 6. Elevation, Shadows, & Borders (LOW)

See [elevation-borders.md](./rules/elevation-borders.md) for:
- Rules for defining visual hierarchy in a flat, minimalist design.
- Applying subtle borders (`border border-border`) for cards and separators.
- Strict limitations on box-shadows (e.g., using `shadow-sm` for interactive cards, `shadow-md` for dropdown menus/modals, and avoiding heavy drop shadows).

### 7. Motion & Animation (LOW)

See [motion-animation.md](./rules/motion-animation.md) for:
- Guidelines for subtle, professional micro-interactions.
- Standard hover state transitions (e.g., `transition-colors duration-200`).
- Avoiding layout-shifting animations in favor of opacity and color fades.

## How to Use

Read individual rule files for detailed explanations and code examples:

```text
rules/spacing-tailwind.md
rules/spacing-agnostic-components.md
rules/layout-primitives.md
rules/layout-grid-breakpoints.md
rules/typography-scale.md
rules/theme-colors.md
rules/icon-sizing.md
rules/elevation-borders.md
rules/motion-animation.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references