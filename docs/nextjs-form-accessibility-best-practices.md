## Semantic, predictable form structure

- **Prefer native HTML controls first.** `<input>`, `<select>`, `<textarea>`, and `<button>` come with built-in keyboard and screen reader behavior that custom widgets often break.  
- **Keep the form’s DOM order logical.** The visual layout can change with CSS, but assistive tech and keyboard users experience the tab/order of the DOM.  
- **Use a single `<form>` per “task”.** Don’t mix unrelated actions (e.g., “search” + “billing update”) in one form unless it’s truly one submission.  
- **Use the right button types.** Make the primary action a real `<button type="submit">` and ensure secondary actions aren’t accidentally `submit`.  
- **Avoid nested forms.** Nested `<form>` elements are invalid HTML and create confusing submission/focus behavior.

## Labels, instructions, and help text

- **Every field needs a programmatic label.** Use `<label htmlFor="id">` (or wrapping `<label>`) so screen readers announce the field name reliably. ([w3.org](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html?utm_source=chatgpt.com))  
- **Don’t use placeholder text as the label.** Placeholders disappear on input and are not a substitute for a persistent, announced label.  
- **Put critical instructions next to the field, not only in a tooltip.** If you provide format guidance (e.g., “DD/MM/YYYY”), link it with `aria-describedby` so it’s announced when focusing the input. ([w3.org](https://www.w3.org/WAI/WCAG21/working-examples/aria-invalid-data-format/?utm_source=chatgpt.com))  
- **Make required/optional status explicit in text.** Don’t rely on color or an asterisk alone; include “(required)”/“(optional)” in the label or nearby helper text.  
- **Use concise, specific labels.** “Email address” beats “Enter details” because it tells the user what data is expected. ([w3.org](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html?utm_source=chatgpt.com))  
- **Keep help text stable.** If helper text changes dynamically, ensure the change is announced appropriately (e.g., via a live region) only when it matters.

## Grouping and relationships

- **Group related controls with `<fieldset>` and `<legend>`.** This is especially important for radio groups, checkbox sets, and “address” sections so users hear the group context.  
- **Ensure each radio/checkbox option has its own label.** Users need each option announced clearly, not just the group label. ([w3.org](https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html?utm_source=chatgpt.com))  
- **For “Other” options, associate the follow-up input.** Make it obvious (and programmatic) that the text input belongs to that choice (e.g., describedby/labeling).  
- **Keep repeated sections uniquely identifiable.** If you have multiple “Phone number” inputs, label them as “Phone (home)” / “Phone (work)” rather than duplicates.

## Input purpose, autofill, and device ergonomics

- **Use correct input types.** `type="email"`, `type="tel"`, `type="url"`, etc. improve on-screen keyboards and enable helpful validation.  
- **Use `autocomplete` tokens.** This supports user agents and assistive tech in identifying purpose (e.g., `autocomplete="email"`, `name`, `street-address`).  
- **Use `inputMode` when type isn’t enough.** For numeric-but-not-a-number fields (like verification codes), `inputMode="numeric"` improves mobile entry.  
- **Allow copy/paste and password managers.** Don’t block paste in password/OTP fields; it harms accessibility and increases errors.  
- **Avoid over-formatting while typing.** Aggressive auto-formatting can fight screen readers and caret position; format on blur if you must.

## Keyboard, focus, and interaction

- **Everything must be reachable and usable via keyboard.** Tab/Shift+Tab should visit every control, and Space/Enter should activate the expected elements.  
- **Never remove focus outlines without replacement.** Visible focus is essential for keyboard users; if you style it, keep it high-contrast and obvious.  
- **Don’t hijack keyboard behavior.** Avoid custom key handlers that block Tab, Escape, Arrow keys, or Enter unless you are implementing an established widget pattern.  
- **Keep focus where the user expects after actions.** After submit (success or error), move focus to the confirmation region or the error summary/first invalid field.  
- **Avoid “focus traps” unless it’s a real modal dialog.** If you open a modal (e.g., confirm submit), ensure it uses proper dialog semantics and returns focus when closed.

## Validation, errors, and recovery

- **Validate on the server even if you validate on the client.** Client validation is for immediacy; server validation is the source of truth and prevents inaccessible failure modes.  
- **Identify errors in text, not just color.** Users must be able to understand that an error occurred and what went wrong. ([w3.org](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html?utm_source=chatgpt.com))  
- **Associate each error message to its field.** Link errors via `aria-describedby` (or `aria-errormessage` where appropriate) so focusing the input announces the error. ([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-errormessage?utm_source=chatgpt.com))  
- **Mark invalid fields with `aria-invalid` only when invalid.** Don’t set it globally; toggle it when validation fails so assistive tech gets accurate state. ([w3.org](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21?utm_source=chatgpt.com))  
- **Provide an error summary for multi-field forms.** Place it near the top, list what needs fixing, and focus it after submit to reduce “hunt-the-error” frustration.  
- **Announce injected errors with a live region when needed.** If errors appear without moving focus, use `role="alert"`/`aria-live` to ensure screen readers hear the update. ([w3.org](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19?utm_source=chatgpt.com))  
- **Preserve user input on validation failure.** Clearing fields forces re-entry and disproportionately harms users with cognitive/motor impairments.  
- **Offer concrete fixes, not just “Invalid”.** “Password must be 12+ characters” is actionable; “Password invalid” isn’t. ([w3.org](https://www.w3.org/TR/WCAG21/?utm_source=chatgpt.com))  
- **Avoid time-limited error recovery.** If a session expires, explain what happened and how to continue without losing entered data when possible.

## Status, loading, and async UX (especially important in App Router)

- **Expose pending/submitting state.** Disable the submit button, show a clear “Submitting…” label, and mark busy regions so users know the app didn’t freeze. ([nextjs.org](https://nextjs.org/docs/app/guides/forms))  
- **Announce server responses (success/failure) in a stable place.** A dedicated message area (often a polite live region) prevents users from missing feedback after a Server Action returns. ([nextjs.org](https://nextjs.org/docs/app/guides/forms))  
- **Avoid spinner-only feedback.** Spinners aren’t inherently meaningful to screen readers; pair them with text like “Saving changes…”.  
- **Don’t block the entire UI unnecessarily.** If only one section is pending, scope disabled/busy states to that section rather than freezing the whole page.  
- **Be careful with optimistic UI.** If you optimistically add content, make sure the change is understandable (and reversible) if the server later rejects it.

## Next.js App Router–specific best practices for forms

- **Prefer Server Actions via `<form action={...}>` for progressive enhancement.** This keeps the form usable even if JS hasn’t loaded or fails, which is great for accessibility and resilience. ([nextjs.org](https://nextjs.org/docs/13/app/api-reference/functions/server-actions))  
- **Know when you’re opting out of progressive enhancement.** Invoking actions via custom `startTransition` (instead of `action`/`formAction`) disables that “works-before-hydration” behavior. ([nextjs.org](https://nextjs.org/docs/13/app/api-reference/functions/server-actions))  
- **Only make the form a Client Component when you need client interactivity.** If you switch to client hooks for validation/errors (e.g., action state), keep labeling, error association, and live announcements intact. ([nextjs.org](https://nextjs.org/docs/app/guides/forms))  
- **Ensure each route has a descriptive title (and ideally an `<h1>`).** Next.js includes a route announcer for client-side transitions and it announces `document.title`, then `<h1>`, then the pathname—good titles/headings make navigation and post-submit redirects clearer. ([nextjs.org](https://nextjs.org/docs/architecture/accessibility))  
- **Treat “submit → navigate to success page” as a route-change accessibility moment.** After navigation, ensure users land at meaningful content (main heading) and that the success message is immediately discoverable. ([nextjs.org](https://nextjs.org/docs/architecture/accessibility))  
- **Use ESLint accessibility rules early.** Next.js ships with `eslint-plugin-jsx-a11y` by default, which catches common form issues (bad ARIA, missing labels, etc.) before they ship. ([nextjs.org](https://nextjs.org/docs/architecture/accessibility))  

## Visual design and readability

- **Meet color-contrast requirements for text and UI states.** Error text, placeholder-like help, and disabled states often fail contrast; check them explicitly.  
- **Don’t rely on color alone to indicate errors or success.** Pair color with icons + text (“Error: …”, “Saved”) so everyone gets the message.  
- **Give controls adequate hit targets.** Small checkboxes/radio targets are painful for motor impairments—use label clicks and generous spacing.  
- **Keep layouts stable during validation.** Avoid big layout jumps when errors appear; reserve space or animate carefully so focus doesn’t feel lost.

## Testing and QA habits that catch real issues

- **Do a “keyboard-only” pass on every form.** You’ll quickly find focus traps, missing focus styles, unreachable controls, and broken submit flows.  
- **Test at least one screen reader flow for each critical form.** Focus on: field announcement (label + required + help), error announcement, and post-submit confirmation.  
- **Audit custom ARIA critically.** If you’re adding ARIA to native controls, double-check you’re not overriding correct semantics or inventing roles/attributes. ([deque.com](https://www.deque.com/blog/wai-aria-top-6-mistakes-to-avoid/?utm_source=chatgpt.com))  

If you want, tell me the types of forms you’re building in your App Router app (auth, billing, multi-step onboarding, etc.) and I’ll tailor this into a tighter, prioritized checklist for that exact setup.
