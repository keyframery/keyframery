# Keyframery on UI SDK's core

Read this after HOUSE.md and MOTION.md. Where they disagree about a component UI SDK does not ship,
this file wins.

## The rule (owner, 2026-11-16)

"All component should be UISDK enabled ... Make sure we use its core. We don't want any component
that is not supported by uisdk."

So Keyframery has two kinds of component, and both are UI SDK components:

1. **UI SDK ships it** (tabs, dialog, menu, 55 in all). The primitive is
   `export * from "@ui-sdk/react/<slug>"` plus motion. Nothing here changes that.
2. **UI SDK does not ship it** (kbd, badge, card, table, sidebar, anything from shadcn's list that
   UI SDK lacks). Its behaviour is written **once, on UI SDK's core, with `definePrimitive`**, and
   rendered by UI SDK's React adapter. No plain `<div data-slot="…">` components, no behaviour in
   React state or context.

Before writing a kind-2 component, check `node_modules/@ui-sdk/react/package.json` exports. If
UI SDK ships a component that covers the job, compose or wrap it instead (a sheet is a drawer, a
toggle group is toggle's group). "Don't hand-roll what we ship."

## Read first

- `node_modules/@ui-sdk/core/skills/ui-sdk/references/create-component.md` (the steps),
  `patterns.md` (roles for common shapes) and `agent-ready.md`.
- In `node_modules/@ui-sdk/react/docs/core.md`, by heading: "Build a Component", "Define a
  Primitive", "Render a Primitive", "Compose Behaviors", "Handle Changes", and the Behaviors page of
  each block you use. It is 8,000 lines: search it, do not read it top to bottom.
- `node_modules/@ui-sdk/react/docs/custom-parts.md` and `rendering.md`.
- The reference component, all of it: `src/components/core/kbd.ts`,
  `src/components/primitives/kbd.tsx`, `src/components/ui/kbd.tsx`, `src/demos/kbd.tsx`,
  `src/examples/kbd/`.
- Do not read `node_modules/@ui-sdk/*/dist/*.js`. The docs and the `.d.ts` types are the API.

## Three files per component

| File | What it holds | Imports |
| --- | --- | --- |
| `src/components/core/<slug>.ts` | The behaviour: `definePrimitive`. No React, no JSX, no Tailwind. | `@ui-sdk/core`, `@ui-sdk/core/<entry>` |
| `src/components/primitives/<slug>.tsx` | The React parts (`createParts`, or `usePart` / `usePrimitive` for a part with logic of its own) and the motion classes. No colours, radii, shadows or spacing. | `@ui-sdk/react/primitive`, `@ui-sdk/react/<slug>` to compose, the core file, `react`, `@/lib/utils` |
| `src/components/ui/<slug>.tsx` | The primitive plus the Keyframery look, and `speed` on the top-level part. | the primitive, `@/lib/keyframery`, `@/lib/utils` |

The core file is the part that can later render in Vue, Svelte, Solid and web components, so keep
every decision about behaviour in it: state, roles, keys, focus, what a press does, ARIA and
`data-*` attributes. The React file only maps slots to elements and adds motion.

## Writing the primitive

- `name` is kebab case and prefixes every `data-slot`: the `root` slot is `data-slot="<name>"`, a
  `row` slot is `data-slot="<name>-row"`. Keep the `data-slot` names the component had before when
  you convert one, where the slot names allow it, and say in your report which changed.
- Options: list every option's kind in `options`. A controlled value is `<key>`, `default<Key>` and
  `on<Key>Change(value, details)`, changed through `createChange(context)` with a reason, and
  mapped with `sync`. Name it in `controlled`.
- State a part shows goes in the slot's `state` (so `className`, `style` and `children` can be
  functions of it) and in `attrs` as ARIA or `data-*`. Never inline styles for state. Values CSS
  needs (a size, an index) go out as CSS variables through `attrs`' `style`, as UI SDK's own parts do.
- Roles go on the slot (`role: "…"`), never in `attrs`. TypeScript then asks for `focus`, `press`
  and `keys` where the role needs them. Do not cast past those errors.
- Use UI SDK's blocks instead of writing behaviour: `createRovingFocus`, `createListbox`,
  `createGridFocus`, `createSelection`, `createTypeahead`, `createPopup`, `bindPanel`, `announce`,
  `createReorder`, `createFocusRecovery`, `elements`, `isRTL`, the `date`, `number` and
  `text-match` entries. `create-component.md` step 3 lists them.
- Anything that touches the DOM goes in a slot's `bind` (client only, return the cleanup). `attrs`
  and slot `state` are pure: they run on the server.
- Agents: end the definition with `agent`. List the api methods a person would do as `actions`. A
  component that only shows something (a keycap, a spinner, a skeleton) uses
  `agent: { actions: [], shown: () => false }` so a page full of them does not flood the snapshot.
- Collection parts are keyed by a string `value` or `id` prop, never an index.

## Rendering it

- `createParts(primitive, { root: "div", item: "li" })` when every slot is one element.
- `usePart(primitive, "slot", slotProps, elementProps, "tag")` when a part has logic of its own
  (default children from state, rendering from data). `usePrimitive` for a root with its own logic.
- The file starts with `"use client"`.
- Re-declare a part only to add motion classes, merging `className` with `cn`, exactly as the
  kind-1 primitives do. Export every part and every helper the core file exports that a user needs.

## What must still be true

Everything in HOUSE.md and MOTION.md: the nine moves, tokens only (`calc(Nms*var(--kf-speed,1))`,
`ease-house` / `ease-spring` / `ease-pop`), the four motion styles, reduced motion, a self-playing
demo with `play`, a phone layout by container queries, real content (no lorem, no drawn stand-ins).

## Customize controls and theming variables

The owner's bar (2026-11-16): "i need as much as customisation like they should be change whatever
they can change ... we can change color to every component ... take it as serious product".
Measured reference: React Bits' 219 demos have a median of 18 controls each, and 194 of them have
a colour control. So every component gets both of these.

**1. Theming variables on the component** (`src/components/ui/<slug>.tsx`). Expose the component's
own colours and its key sizes as CSS variables named `--<slug>-<what>`, each falling back to what
the class used before, so nothing changes until someone sets one:
`bg-[var(--kbd-face,var(--background))]`, `text-[color:var(--kbd-ink,var(--muted-foreground))]`,
`h-[var(--kbd-size,1.5rem)]`, `rounded-[var(--kbd-radius,6px)]`,
`text-[length:var(--kbd-font,12px)]`. Three to eight per component: its surfaces, its text, its
accent or selected state, its corner radius, its main size. A state colour derived from another
(pressed, hover) uses `color-mix` on the same variable. List them in the comment at the top of the
file, as `src/components/ui/kbd.tsx` does. Light and dark must both still look exactly as before.

**2. Controls on the demo** (`src/demos/<slug>.tsx`). The protocol is the comment at the top of
`src/lib/controls.ts`; `src/demos/kbd.tsx` is the reference. Five kinds: `slider`, `switch`,
`select`, `color`, `text`, and an optional `group` heading.

- Aim for 10 to 20 controls. Cover everything a user of the component can really set: every
  variant, size, orientation, side and alignment; `disabled`, `loop`, `multiple`, `required` and
  the like; how many items; the texts it shows; widths, gaps and corners; and its colour variables
  (group "Colours"). Group them ("Layout", "Colours", "Behaviour"); controls with no group come first.
- Every control maps to a real prop, option or theming variable of the component and visibly does
  something. Nothing decorative, nothing that breaks the demo or its `play` script.
- Do not add a speed or motion-style control: the panel always has Animation speed, and the page has the
  motion style switcher.
- A colour's default is `""`, meaning "the component's own": apply the variable only when it is
  not empty, so light and dark keep working.
- The defaults in `controls` and in the function's parameters must match, and the demo with no
  props must look and play exactly as it did before.
- The block is `export const controls = { … } as const`, ending in a line that is exactly
  `} as const`. The docs cut that block out of the example code.
- Record the variables in `content/pending/<slug>.json` as
  `"cssVars": [["--kbd-face", "The key's surface", "--background"]]` (name, what it colours or
  sizes, default).
- Check it: `node scripts/shot.cjs <slug> --q 'controls=name:value,other:value'` (a colour is
  URL-encoded, `%23e5484d`) and look at the PNG. The lab's single view
  (`http://localhost:4610/#/<slug>`) shows the panel under the stage.

## How to check a kind-2 component

1. `npx tsc --noEmit 2>&1 | grep -E "<slug>"` prints nothing.
2. In the browser (the lab, `http://localhost:4610/#/<slug>`): every part has its `data-slot`,
   state shows as attributes, the keyboard works as the WAI-ARIA pattern says, and the console has
   no errors or warnings from your files. The first load after adding `@ui-sdk/react/primitive`
   to a file can show one "Invalid hook call" while Vite re-optimizes and reloads. Load it again.
3. A part's `render` prop works (`<Part render={<a href="…" />} />`), and `className` as a
   function of state works.
4. Screenshots in light and dark, a mid-motion frame with `--slow 0.1`, and the demo playing itself
   (`--play`), as MOTION.md describes. Look at every PNG you take.
