# Keyframery UI, version 2: animated drop-in primitives for UI SDK

Read this after HOUSE.md. Where the two disagree, this file wins.

## Why version 2

The owner looked at version 1 and said: "all of this look same. I don't find any speciality in our cases."
His reference is Animate UI, whose tagline is: "Animated drop-in primitives for Radix UI, Base UI and React
Aria, built with Motion. Swap the import, keep your shadcn/ui components." He wants the same for UI SDK.

Ours: **Animated drop-in primitives for UI SDK, built with plain CSS. Swap the import, keep your UI SDK
components.**

So the product is the motion, and version 1's motion was too quiet (4px fades, 0.96 scales). Version 2 makes
every component visibly alive, and splits each component into two layers so the motion can be dropped into
anyone's UI SDK code, including shadcn/ui's own components once they support UI SDK.

## Two layers per component

Reference: `src/components/primitives/tabs.tsx` and `src/components/ui/tabs.tsx`. Read both.

**1. Primitive: `src/components/primitives/<slug>.tsx`** — the animated drop-in for `@ui-sdk/react/<slug>`.
- Starts with `export * from "@ui-sdk/react/<slug>"`, then re-declares only the parts that get motion, under
  the same names, with the same props (`React.ComponentProps<typeof Part>`), merging `className` with `cn`.
  A local export overrides the star export, so everything else passes through untouched.
- Motion only: transitions, transforms, opacity, blur, clip-path, the positioning a moving marker needs,
  stagger delays, keyframes. No colours, radii, shadows, padding, heights or font sizes.
  One exception: where the motion needs a surface of its own (a gliding highlight), give it a neutral default
  that follows the text colour, `bg-[color-mix(in_oklch,currentColor_9%,transparent)]`, and let `className` override it.
- It must work when someone swaps the import in code written for plain UI SDK: no required wrapper, no
  required prop, no part rendered twice. Extra helpers are fine as additional exports (`TabsPanels`).
- Imports only `@ui-sdk/react/*`, `react` and `@/lib/utils`.

**2. Styled component: `src/components/ui/<slug>.tsx`** — the primitive plus the Keyframery look.
- Imports its parts from `@/components/primitives/<slug>` (not from `@ui-sdk/react`).
- Keeps the look from version 1 (wells, keys, fields, sheets). Remove motion classes that moved to the
  primitive. Motion that depends on the look (the clipped copy of the tab labels) stays here.
- Demos keep importing from `@/components/ui/<slug>`.

## The motion, louder

Easings (Tailwind utilities, defined in `src/index.css`): `ease-spring` settles with about 5% overshoot,
`ease-pop` with about 16%, `ease-house` has none. In arbitrary values use `var(--ease-spring)` and so on.

Nine moves. Every component gets the ones in its row of the table below, tuned until a frame caught in the
middle of the motion shows it plainly. Sleek, never childish: no wobble, no confetti, no idle pulsing.

1. **Stretch** (a marker that travels: tabs key, segmented key, navigation marker, switch thumb).
   The edge facing the direction of travel leaves at once; the opposite edge waits about 80ms and follows, so
   the marker stretches across the gap and closes up. Copy the recipe in `primitives/tabs.tsx`: each edge is
   tracked by two registered custom properties (`@property`, emitted with React 19's
   `<style href precedence>`), one fast and one slow with a delay, and the inset is `min()` of the two. It needs
   no direction attribute. Do not key off `data-activation-direction` or `data-motion`: UI SDK sets them a few
   milliseconds after the position variables, so the wrong edge leads. Use `ease-house` for stretch, never a
   spring (the overshoot pushes the marker out of its track). Hold transitions until ready, as tabs does.
   Where state gives the direction (a switch is checked or not), plain `left`/`right` transitions with a lag
   are enough: see the switch in `src/demos/motion-lab.tsx`.
2. **Glide** (one highlight that moves between rows instead of each row lighting up: menus, select, combobox,
   command, listbox, tree, toolbar, calendar days, pagination). CSS anchor positioning, tested in
   `src/demos/motion-lab.tsx`: the container gets `relative isolate [anchor-scope:--kf-hl]` and a `before:`
   element with `[position-anchor:--kf-hl] top-[anchor(top)] right-[anchor(right)] bottom-[anchor(bottom)]
   left-[anchor(left)]`, transitioning `top, right, bottom, left` over 260ms `ease-spring`; the highlighted row
   gets `[anchor-name:--kf-hl]` (use the attribute the doc lists, usually `data-highlighted`); hide the
   highlight with opacity while nothing is highlighted (`has-[...]`). Remove the per-row hover background.
   If the anchor can be missing for a frame (focus moving between segments passes through "nothing focused"),
   the inset falls back to `auto` and the highlight jumps instead of gliding. Give it a resting anchor as the
   fallback: `anchor(--kf-hl left, anchor(--kf-hl-rest left))`, with the first item as the resting anchor
   (see `primitives/date-input.tsx`).
3. **Unfold** (anything that pops up). Start at `opacity-0 scale-[0.86] blur-[6px]`, moved 8px toward the
   trigger, origin from the variable the doc gives; in over 380ms `ease-spring`, out over 150ms `ease-house`
   to `scale-[0.96]`. Tooltips: start at `scale-[0.7]`, 300ms `ease-pop`.
4. **Cascade** (rows inside something that just opened: menu items, dialog sections, accordion content,
   timeline events). Each child starts `opacity-0 translate-y-2 blur-[4px]` while the parent has
   `data-starting-style` (use a named `group/…` on the parent) and transitions `opacity, translate, filter`
   over 420ms `ease-spring` with `[transition-delay:calc((min(sibling-index(),10)-1)*32ms)]`. Reset the delay
   to 0 on close. Only those three properties may transition on a cascading child, so the delay never slows a
   hover. **The children must also be `transition-none` while the parent has `data-starting-style`**
   (`group-data-starting-style/…:transition-none`). Without that, a child that was already in the page
   transitions *into* its hidden state with its own delay, never gets there in that one frame, and the cascade
   silently does nothing. Measure it: on the first frame the child's opacity must be 0.
   Two more traps builders hit: a `[transition:…]` or `animation` shorthand on the child resets its delay, so
   every row arrives together (use the separate `transition-[…] duration-[…] ease-…` utilities and set the
   delay last); and rows that finish before a still-transparent sheet has faded in are never seen (give the
   first row a 40ms lead-in). A `@keyframes` cascade with `animation-fill-mode: backwards` and the same delay
   formula is an accepted alternative (see `primitives/dialog.tsx`).
5. **Roll** (numbers that change: slider value, progress and meter value, page numbers, counters, totals).
   Each digit is a column of 0 to 9 moved by `translate: 0 calc(var(--d) * -1em)` over 500ms `ease-spring`.
   Copy `Roll` from `src/demos/motion-lab.tsx` into the file that needs it. Not for `<input>` text.
6. **Draw** (checks, dashes, dots, stars). Strokes draw with stroke-dashoffset over 260ms `ease-house`; the box
   or dot behind them arrives with `ease-pop` (scale 0.6 to 1).
7. **Press** (everything you can press). `active:scale-[0.96]`, with `transition-[scale] duration-200
   ease-pop` so it springs back on release. Thumbs widen or grow while held.
8. **Direction** (content replacing content: tab panels, calendar months, carousel, command pages). The new
   content comes 24 to 32px from the side it was reached from with 6px blur, 460ms `ease-spring`; the old one
   leaves over 200ms `ease-house`.
9. **Height** (accordion, collapsible, anything that grows). 380ms `ease-house` on the size variable, and the
   content cascades in (move 4).

Reduced motion: every transition and animation gets `motion-reduce:transition-none` or
`motion-reduce:animate-none`. Allowed plumbing: a tiny React state as a readiness gate, and
`<style href="kf-…" precedence="default">` for `@property` and `@keyframes`. Still no animation library and
no animation loops in JavaScript.

## Signature per component

| Component | Moves |
| --- | --- |
| button | Press with pop release; loading swaps label and spinner by Direction (up); a trailing arrow icon nudges 2px on hover |
| toggle | Press; the pressed surface pops in (`ease-pop`); in a group, Glide the hover highlight |
| toolbar | Glide the hover/focus highlight across items; Press |
| tabs | done: Stretch key, label colour flips at the key's edge, Direction panels |
| segmented-control | Stretch with the registered-property recipe on its indicator variables (replace the two-layer version); label copy as tabs |
| navigation-menu | Stretch the marker on `--active-item-*`; panel resizes on a spring; content by Direction; links Cascade |
| pagination | Glide the current-page key between pages; Roll any page count text |
| tree | Glide the row highlight; chevron turns on a spring; children Height + Cascade |
| dialog | Backdrop blur in; sheet Unfold from below (scale 0.9, 24px rise, 8px blur, 420ms spring); title, body, footer Cascade |
| alert-dialog | as dialog; the icon tile arrives with `ease-pop` |
| drawer | keep UI SDK's own spring; content Cascade once open; grip stretches while dragged |
| popover | Unfold; content Cascade |
| hover-card | Unfold; content Cascade |
| tooltip | Unfold small with `ease-pop`; skip when instant |
| toast | arrives on a spring from the edge with scale 0.9; icon Draw; stack as now; leaves along the swipe |
| command | Glide highlight; rows Cascade on open and on page change; pages by Direction |
| menu, trigger-menu, menubar | Unfold; rows Cascade; Glide highlight; checks Draw; submenus Unfold sideways |
| select | as menu; the chosen value in the trigger changes by Direction (up) |
| combobox, autocomplete | Unfold; rows Cascade; Glide highlight; clear button pops |
| listbox | Glide highlight; checks Draw |
| color-picker | popup Unfold; thumbs grow with pop when grabbed; chosen swatch ring pops |
| accordion, collapsible | Height; content Cascade; chevron turns on a spring |
| carousel | slides by Direction with the scale it has; active dot widens on a spring |
| field | error message Height + rise; description and error swap by Direction (up) |
| input, textarea | focus ring grows from 0 to 3px on a spring; the hairline changes colour over 150ms |
| password-input | eye icons swap with pop; the field text gets a short blur-to-clear when revealed |
| number-input | steppers Press with pop; a pressed stepper nudges the value 2px in its direction |
| otp-input | each digit rises in with `ease-pop`; the active ring Glides slot to slot; when the code is complete the slots Cascade one soft pulse left to right |
| token-input | tokens arrive with `ease-pop` |
| file-input | drop zone lifts and its icon rises while a file is over it; file rows Cascade |
| checkbox | Draw the check; the box pops |
| radio | the dot pops; the selection ring Glides between options |
| switch | Stretch the thumb toward the other side (lag 80ms); it widens while pressed |
| slider | thumb grows with pop when grabbed; the fill follows on a spring when you click the track; value Roll |
| rating | stars fill by Cascade from the left; the chosen star pops |
| calendar | the selected-day key Glides between days; months by Direction |
| date-picker | Unfold; inside, as calendar |
| date-input, time-input | the focused-segment highlight Glides between segments |
| avatar | image blur-in; in a group the hovered avatar rises 4px on a spring and its neighbours make room |
| progress, meter | fill on a spring (the track clips the overshoot); value Roll |
| timeline | events Cascade; checks Draw; the rail fills as steps complete |
| scroll-area | thumb fades in and thickens on hover |
| resizable | the grip stretches while dragged; the line takes the ring colour |

## Demos play themselves

Each demo exports `play`, a list of steps the gallery runs on a loop while the demo is on screen, so the
signature shows without anyone clicking (see `src/demos/tabs.tsx` and `PlayStep` in `src/App.tsx`):
`{ click, hover, unhover, key, type + into, wait }`, with CSS selectors. Show the signature moment: pick far
jumps for a Stretch, open and close a popup, check and uncheck. It pauses while a real pointer is over the demo
(scripted hover steps do not pause it). Scripted events cannot trigger CSS `:hover`, so a move that should play
by itself needs a state attribute as well: style `hover:` and `data-hovered:` together and let the demo set
`data-hovered` (see the avatar primitive and demo).

## How to work

1. Read the primitive and styled tabs files and `src/demos/motion-lab.tsx`.
2. For each of your components: write the primitive, convert the styled file to use it, raise the motion to
   the table above, add `play` to the demo.
3. Type-check your files: `npx tsc --noEmit 2>&1 | grep -E "<slug>"` prints nothing.
4. Catch the motion in the act and look at it. `node scripts/shot.cjs <slug> --slow 0.1 --w 900 --h 620
   --steps '[{"click":"…"},{"wait":1500},{"shot":"mid"}]'` plays everything at a tenth of the speed, so a wait
   of 1500 is 150ms into the animation. Open the PNG. If the frame does not plainly show the move, the move is
   too quiet: make it larger or longer. Check light and dark.
5. Check the demo plays itself: `node scripts/shot.cjs <slug> --play --steps '[{"wait":2500},{"shot":"play1"},{"wait":2500},{"shot":"play2"}]'`
   and confirm the two frames differ.
6. Keyboard and screen-reader behaviour must be unchanged. No console errors from your files.

Do not touch files outside your components (primitive, styled, demo), and do not edit `tabs`, `App.tsx`,
`index.css`, `scripts/`, `HOUSE.md` or this file.

## Report back

Per component: files, which moves you built, what the mid-motion frame showed when you looked, and plainly
what is missing, broken or uncertain. Say if a move from the table was not possible and why.

## Motion tokens and styles (version 3, 2026-11-15; overrides anything above)

Every component must follow the four motion styles (Calm, Springy, Snappy, Playful), which `data-motion` on `<html>` switches. Springy is the default. That only works if timings and easings come from tokens:

- **Durations and delays:** never write a bare `ms` value in a class. Write `duration-[calc(420ms*var(--kf-speed,1))]`, `delay-[calc(80ms*var(--kf-speed,1))]`, and inside arbitrary values `[transition:scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop)]`. Keep the `,1` fallback so a component still works in a project without our tokens. `0ms` stays as it is.
  - Never use plain `duration-200` style classes.
- **Easings:** only `ease-house`, `ease-spring` and `ease-pop` (or `var(--ease-…)` inside arbitrary values). Never write a literal `cubic-bezier` or `linear()`.
- **Timings in JS** (`setTimeout` and similar): multiply by the speed, read once with `parseFloat(getComputedStyle(el).getPropertyValue("--kf-speed")) || 1`.
- **Check:** `?motion=calm|snappy|playful` in the lab URL switches the style. The header has a switcher too.
