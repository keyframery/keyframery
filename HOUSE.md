# Keyframery UI: house rules

Fifty plain UI components for React, each one a styled and animated wrapper around a UI SDK component
(`@ui-sdk/react`, by Vercel/shadcn). They install with the shadcn CLI and drop into any shadcn project.

The owner's bar, in his words: "purely UI components like Aceternity and Animate UI have", "no complexity",
"our unique taste", "sleek", never "childish", never "found anywhere". Each component must look like premium
product UI at rest and feel alive in every state.

Read `src/components/ui/tabs.tsx` and `src/demos/tabs.tsx` first. They are the reference for structure,
class style, naming and demo quality. Match them.

## Hard rules

1. One file per component: `src/components/ui/<slug>.tsx`. It imports only from `@ui-sdk/react/<slug>`
   (plus another `@ui-sdk/react/*` entry when the UI SDK doc itself composes one), `react`, and
   `@/lib/utils` (`cn`). No other imports, no new packages, no icon library, no Motion, no GSAP.
2. Behaviour comes from UI SDK. Never rebuild keyboard, focus, ARIA, positioning or open/close logic.
   Keep every part of the UI SDK component available: wrap each part in a small function that merges
   `className` with `cn` and spreads the rest, then export it under the UI SDK part name.
3. Motion is CSS only, driven by what UI SDK exposes: `data-starting-style`, `data-ending-style`, state
   attributes (`data-open`, `data-selected`, `data-pressed`, `data-side`, ...) and CSS variables
   (`--transform-origin`, `--accordion-panel-height`, ...). The component doc lists them under
   "Styling" and "Data Attributes". No `requestAnimationFrame`, no timers, no effects for animation.
4. Colours come from the shadcn tokens only: `background foreground card popover primary secondary muted
   accent destructive border input ring` (+ `-foreground`). Never a palette colour (`zinc-500`, `#333`).
   The only raw colours allowed are black or white with alpha inside shadows, and one success green
   `oklch(0.62 0.16 150)` used only at a payoff moment (done, valid, uploaded).
5. Every state is styled: hover, active/pressed, focus-visible, disabled, invalid, open, selected, loading
   where the part has it. Focus is always a visible `focus-visible:ring-2 ring-ring ring-offset-2`.
6. Add `motion-reduce:transition-none` (or `motion-reduce:[transition:none]`) wherever you animate.
7. Light and dark must both look right. Add `dark:` shadows where the light recipe uses black alpha.
8. Do not touch files you were not assigned: other components, `tabs.tsx`, `App.tsx`, `index.css`,
   `package.json`, `scripts/`. Do not install anything. Do not start another dev server (one is already
   running on http://localhost:4610).

## The look: wells, keys, fields, sheets

- **Well** (a track something moves in: tab list, segmented control, switch, slider and progress track):
  `bg-muted` plus `shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)]`
  `dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]`. Radius 12px
  (or full for pills).
- **Key** (the thing you press or that moves: button, selected tab, thumb, pressed toggle):
  `bg-background` plus `shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]`
  `dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]`.
  Radius 9px. Primary key: `bg-primary text-primary-foreground` with
  `shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]`.
  Press: `active:translate-y-px active:scale-[0.985]` and the shadow tightens, 100ms.
- **Field** (something you type in: input, textarea, select trigger): `bg-background`, height 36px, radius 10px,
  `shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)]`
  `dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]`; hover darkens the hairline to 0.16; focus adds
  `ring-[3px] ring-ring/25` and a hairline in `ring` colour; invalid uses `destructive` the same way.
- **Sheet** (something that floats: popover, menu, dialog, toast): `bg-popover text-popover-foreground`,
  radius 14px (dialog 18px, menu items 8px inside 6px padding),
  `shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]`
  `dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]`.
  Tooltip is the one dark sheet: `bg-foreground text-background`, radius 8px, 12px text.
- Type: controls 13px medium, leading-none; body in sheets 13 to 14px; hints 11 to 12px `text-muted-foreground`;
  titles 15px semibold `tracking-tight`; numbers `tabular-nums`. Control heights: 28 / 32 / 36.
- Icons: inline SVG in the same file, 16px box, `stroke="currentColor"` `strokeWidth="1.5"`
  `strokeLinecap="round"` `strokeLinejoin="round"` `fill="none"`. Keep them tiny and standard
  (chevron, check, x, plus, minus, search, calendar, eye, upload, dot).

## The motion

Ease for everything: `cubic-bezier(0.22,1,0.36,1)`. Exits are shorter than entrances.

| What | In | Out |
| --- | --- | --- |
| Press, hover, colour | 100 to 150ms | same |
| Popover, menu, select, tooltip, hover card | 220ms | 140ms |
| Dialog, drawer, toast | 320ms | 180ms |
| Height (accordion, collapsible) | 320ms | 240ms |

Four signatures. Use the ones that fit; do not invent toys.

1. **Lead and trail.** When a key or marker travels (and UI SDK gives its position in CSS variables), the edge
   facing the direction of travel moves in 250ms and the opposite edge in 440ms, so it stretches and settles.
   `tabs.tsx` shows the exact pattern, including the clipped copy of the labels in the selected colour.
2. **From where it came.** Anything that pops up starts at `opacity-0 scale-[0.96] blur-[4px]`, moved 4px
   toward its trigger, and grows from `origin-(--transform-origin)` (use the variable the doc gives).
3. **Content follows direction.** Content that replaces other content slides 12 to 20px along the direction
   of travel with 5px blur and fades, as the tab panels do.
4. **Small payoffs.** A check draws itself (stroke-dashoffset), a switch thumb widens while pressed,
   a number changes with tabular figures, a chevron turns. Short, one per component.

Never: bouncing, wobbling, confetti, rainbow gradients, glows that pulse at idle, skeuomorphic drawings.

## The demo

`src/demos/<slug>.tsx` exports `meta = { name, group }` and a default component with no props.
Groups: Actions, Navigation, Overlays, Menus, Disclosure, Forms, Dates, Display, Layout.

- Real, general content anyone understands: a trip, a shop order, a playlist, a team, a recipe. Not developer
  tooling, no lorem ipsum, no explanatory sentences about the component.
- It sits centred in a stage about 1000px wide and 560px tall: keep it under 480px wide unless the component
  needs room. It must look finished while closed and while open.
- Use only your own component (and plain HTML). If you need a button for a trigger, style it as a key inline.

## How to work on each component

1. Read `node_modules/@ui-sdk/react/docs/components/<slug>.md` (parts, usage, Styling, Data Attributes).
   `node_modules/@ui-sdk/react/docs/styling-and-animation.md` and `popups.md` explain the shared hooks.
2. Write the component and its demo.
3. Type-check only your files: `npx tsc --noEmit 2>&1 | grep -E "<slug>"` must print nothing.
4. Screenshot it: `node scripts/shot.cjs <slug>` writes `shots/<slug>-light.png` and `-dark.png`.
   To open or interact first, pass steps, for example:
   `node scripts/shot.cjs dialog --steps '[{"click":"text=Open"},{"wait":500},{"shot":"open"}]'`
   Steps: `click`, `hover`, `focus` (Playwright selectors), `press` (a key), `type`, `wait` (ms),
   `shot` (label). It prints console errors: there must be none from your component.
5. Open the PNGs with the Read tool and look. Fix spacing, alignment, clipped shadows, unreadable dark
   mode, anything cheap-looking. Repeat until you would ship it. Check keyboard focus once with a
   `press: "Tab"` step.

## Report back

For each component, one short block: files written, the signature motion you used, what you verified by
looking, and anything that is broken, missing or uncertain. Say so plainly; do not claim what you did not check.
