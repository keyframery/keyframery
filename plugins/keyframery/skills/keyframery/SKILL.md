---
name: keyframery
description: Use when adding animated UI components or motion to a React app that uses UI SDK (@ui-sdk/react) or the shadcn CLI, when asked to animate tabs, dialogs, menus, switches, checkboxes, selects, toasts or other components, to change how an app's motion feels (calmer, snappier, more playful), or when the user mentions Keyframery, @keyframery, motion styles or data-motion. Installs copied source with the shadcn CLI. The motion is plain CSS, with no animation library.
---

# Keyframery

Keyframery is 61 animated React components built on UI SDK (`@ui-sdk/react`). UI SDK supplies the behaviour (keyboard, focus, positioning, screen readers). Keyframery adds the motion in plain CSS, and a finished look if wanted. The shadcn CLI copies the source into the project, like the rest of shadcn.

The docs are public Markdown; read them for exact parts and props instead of guessing. Start with the index at https://keyframery.com/llms.txt. Add `.mdx` to any docs URL to get that page as Markdown, for example https://keyframery.com/docs/components/tabs.mdx or https://keyframery.com/docs/motion-styles.mdx. Every page in one file: https://keyframery.com/llms-full.txt.

## 1. Check the project

- React 19 and Tailwind CSS v4.
- `components.json` must exist (the shadcn CLI is set up). If it doesn't, run `npx shadcn@latest init`, or tell the user it is needed.
- Next.js, Vite and React Router all work.

## 2. Install

Install components by name. Install only what the task needs:

```bash
npx shadcn@latest add @keyframery/tabs @keyframery/dialog
```

Everything at once: `npx shadcn@latest add @keyframery/all`.

Keyframery is in shadcn's registry index, so the CLI finds `@keyframery` without any setup. If it answers `Unknown registry "@keyframery"`, register it once and install again:

```bash
npx shadcn@latest registry add "@keyframery=https://keyframery.com/r/{name}.json"
```

Keep the quotes: some shells expand `{name}` otherwise.

Each component lands in two files, and the CLI installs `@ui-sdk/react` and `@ui-sdk/core` and adds the motion tokens to the global CSS:

```text
components/keyframery/<name>.tsx              the finished component (motion + look)
components/keyframery/primitives/<name>.tsx   UI SDK's component with motion only
```

Nothing in `components/ui` is touched. Never overwrite files there.

The component names: accordion, alert-dialog, autocomplete, avatar, badge, button, calendar, card, carousel, checkbox, collapsible, color-picker, combobox, command, context-menu, date-input, date-picker, dialog, drawer, field, file-input, hover-card, image-cropper, input, kbd, label, listbox, menu, menubar, meter, motion-style, navigation-menu, number-input, otp-input, pagination, password-input, popover, progress, radio, rating, resizable, scroll-area, segmented-control, select, separator, skeleton, slider, switch, tabs, textarea, time-input, timeline, toast, toggle, token-input, toolbar, tooltip, tree, trigger-menu, waterfall.

## 3. Choose the layer

| The project | Import from |
| --- | --- |
| Already uses a component from `@ui-sdk/react/<name>` with its own styling | `@/components/keyframery/primitives/<name>`. Swap the import only; leave markup, props and class names alone. |
| Has no component yet, or wants a finished look | `@/components/keyframery/<name>`. It is styled with the shadcn/ui colour tokens, so it takes the project's theme. |

The primitive exports the same parts and takes the same props as the UI SDK component. Read the component's docs page for its parts before writing JSX: https://keyframery.com/docs/components/<name>.mdx. For props, the UI SDK reference applies: https://ui-sdk.dev/docs/components/<name>.

```tsx
// Before
import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

// After: same parts, same props, now animated
import { Switch, SwitchThumb } from "@/components/keyframery/primitives/switch"
```

## 4. Set the motion style

One attribute on `<html>` changes how every component moves:

| Value | Feel | Good for |
| --- | --- | --- |
| `calm` | 1.35× slower, no bounce | Dashboards, finance, long sessions |
| (none) or `springy` | The default: a small spring and pop | Most products |
| `snappy` | 0.6×, crisp, almost no overshoot | Developer tools, dense apps |
| `playful` | Bigger springs and pops | Consumer apps |

```html
<html data-motion="calm">
```

When the user asks for the app to feel calmer, faster or more playful, change this attribute. To let people choose in the app, install `@keyframery/motion-style` and render `<MotionStyleSwitcher />`.

A custom style is three variables under a new value:

```css
[data-motion="brand"] {
  --kf-speed: 0.85;
  --ease-spring: var(--ease-house);
}
```

## 5. Rules

- Do not add Motion, Framer Motion, GSAP or any other animation library for something Keyframery covers.
- Do not hand-edit durations in the component files. Every duration is `calc(Nms * var(--kf-speed, 1))`; change `--kf-speed` or the motion style.
- Use only the three easings: `ease-house`, `ease-spring`, `ease-pop` (or `var(--ease-…)`).
- Keep the `motion-reduce:` classes. With reduced motion on, nothing should move.
- Do not change keyboard or ARIA behaviour; it comes from UI SDK.
- In Next.js with `cacheComponents`, render Calendar, DatePicker and DateInput inside `<Suspense>` after `await connection()` (from `next/server`). They read today's date while rendering.
- If text renders in a serif font after `shadcn init`, the project's `--font-sans` points at nothing. Point it at the app's font in the global CSS. Keyframery sets no font.

## 6. Check that it works

- The project builds and type-checks.
- The global CSS contains `--kf-speed` and `--ease-spring`.
- Use a tab, a menu and a dialog: the tab's key stretches across, the menu unfolds from its button, the dialog rises in.

## 7. Report back

Tell the user which components were installed, which imports were swapped and in which files, and which motion style is set.
