---
name: keyframery
description: Use when adding animation, motion themes or transitions to a React app built with shadcn/ui (dialogs, sheets, drawers, tabs, toasts, menus, lists, numbers, loading and whole-content states), or when the user mentions Keyframery, <Cuts />, MatchCut, ListCut, ValueCut, LoadCut or StateCut. Installs copied source with the shadcn CLI and applies a reusable motion theme.
---

# Keyframery

Keyframery gives shadcn/ui apps the transitions a film editor would make. One `<Cuts />` in the root layout animates shadcn's own dialogs, sheets, drawers, tabs, toasts and menus without editing them. Five helpers cover the changes shadcn has no component for. A motion theme (Quiet, Crisp, Expressive or custom) sets pace, easing and cuts for the whole app. The code is copied into the project by the shadcn CLI, like the rest of shadcn.

The `keyframery` MCP server at https://keyframery.com/mcp (the Claude Code plugin connects it) has the details:
- `list_kinds`: the seven kinds of change, with the cut, install command and snippet for each. Call it before choosing a helper.
- `get_doc`: any docs page as Markdown, for example `installation`, `helpers/list-cut`, `customize`.
- `search_docs`: find the right page when you don't know it.
- `make_theme`: Quiet, Crisp or Expressive plus optional overrides, with the matching `<Cuts />`, CSS and installation handoff. It generates instructions and never edits the project itself.

## 1. Check the project

- `components.json` must exist (shadcn/ui is set up). If it doesn't, tell the user Keyframery needs shadcn/ui first.
- Either base works: Base UI or Radix. Next.js, Vite and React Router are supported.

## 2. Install

Register Keyframery once per project, then install the layer:

```bash
npx shadcn registry add "@keyframery=https://keyframery.com/r/{name}.json"
npx shadcn add @keyframery/cuts
```

The first command adds `"@keyframery": "https://keyframery.com/r/{name}.json"` under `registries` in `components.json` (you can also add that line by hand). Skip it only if that entry is already there. Without it the CLI answers `Unknown registry "@keyframery"`, for the helpers too, because they depend on `@keyframery/cuts`. Keep the quotes: some shells expand `{name}` otherwise.

This copies `components/keyframery/cuts.tsx`, its stylesheet and the engine in `lib/keyframery/`. It has no npm dependencies.

## 3. Render `<Cuts />` once, at the root

- Next.js: `app/layout.tsx`, inside `<body>`, after `{children}`.
- Vite: `src/main.tsx`, next to `<App />` inside `<StrictMode>`.
- React Router: `app/root.tsx`, next to `<Outlet />`.

```tsx
import { Cuts } from "@/components/keyframery/cuts"

// …
{children}
<Cuts />
```

Render it once. It renders nothing itself and is safe with server rendering.

## 4. Check that it works

- `<html>` gets a `data-kf` attribute while `<Cuts />` runs.
- Open a dialog: it should grow out of the button that opened it. If it still pops into the middle, the dialog's content element may lack `data-slot="dialog-content"`. Copies from before shadcn CLI 3 don't have it; run `npx shadcn add dialog` again to update.

## 5. Choose the cut by the kind of change

| The change | Use |
| --- | --- |
| Something opens on top: dialog, sheet, drawer, command menu, menu, toast | automatic with `<Cuts />` |
| You switch to a neighbour: tabs | automatic with `<Cuts />` |
| A card opens into its detail view, on the same page or a new route | `<MatchCut id>` on both versions (`npx shadcn add @keyframery/match-cut`) |
| A list changes: messages, inbox rows, kanban cards, table rows | `<ListCut>` with `<ListCut.Item id>` (`npx shadcn add @keyframery/list-cut`) |
| A number, price, count or status changes in place | `<ValueCut value>` (`npx shadcn add @keyframery/value-cut`) |
| A skeleton turns into real content | `<LoadCut loading skeleton>` (`npx shadcn add @keyframery/load-cut`) |
| A whole region switches between empty, error, success or other views | `<StateCut state>` (`npx shadcn add @keyframery/state-cut`) |

Rules:
- Avoid adding a second enter or exit animation to a supported part that `<Cuts />` already handles. Leave existing unrelated motion alone.
- Don't animate static components: buttons, inputs, labels, badges that don't change.
- Use the same stable `id` you use as the React `key` for ListCut items and MatchCut pairs.
- Call `get_doc` for a helper's exact props before writing it.
- Keep one root `<Cuts />` mounted for helper motion too. Do not assume arbitrary React components receive automatic animation.
- StateCut animates whole-content changes; LoadCut handles skeleton timing; ValueCut handles a small number or status. Do not substitute one for another merely because all can show loading or status text.

## 6. Tune it

- Start from Quiet, Crisp or Expressive in `make_theme` with `profile: "quiet"`, `"crisp"` or `"expressive"`. Individual options override that preset. Apply the generated props and CSS; there is no runtime `profile` prop on `<Cuts />`.
- Per component: `<Cuts dialog="punch-in" tabs="whip" toast="none" pace={1.2} />`.
- Buttons, checkboxes, radios, switches, sliders, resize handles and progress bars already respond to presses, ticks and drags through `<Cuts />`; don't add your own press or check animations. `<Cuts responses="none" />` turns those off and keeps the cuts.
- Optional: `npx shadcn add @keyframery/icon-moves`, then render `<IconMoves />` next to `<Cuts />`. Pressed icons play their own move (a gear turns, a bell rings) with the lucide icons already in the app; don't swap icons for animated copies.
- App-wide or per section: `--kf-pace`, `--kf-ease` and `--kf-ease-exit` coordinate motion; `--kf-travel`, `--kf-blur` and `--kf-depth` shape rack-focus dialogs specifically; `--kf-hold` controls LoadCut's skeleton delay. `make_theme` writes the corresponding CSS.
- Per element: `data-cut="none"` turns cuts off for an element and everything inside it. `data-cut-pace="2"` slows one section.
- Reduced motion removes Keyframery's movement, scale and blur in favor of short fades or instant swaps. The drawer's native swipe behavior is preserved.
- The builder at https://keyframery.com/theme supports local named saves, share links and validated version-1 JSON import/export, all free with no account. Its copied agent prompt carries the exact theme.

## 7. Add cuts to an existing app

When asked to "add animations" or "make the app feel smoother":
1. Install and render `<Cuts />` (steps 2–4). Most of the visible change comes from this alone.
2. Look for lists rendered with `.map(` whose items are added, removed or reordered, and wrap them in `ListCut`.
3. Look for numbers or statuses that update (totals, counters, prices, order status), and wrap them in `ValueCut`.
4. Look for `isLoading ? <Skeleton /> : …` patterns, and replace them with `LoadCut`.
5. Look for cards or rows that link to a detail view, and pair them with `MatchCut`.
6. Look for whole-content empty, error or success branches, and wrap the region in `StateCut`. Keep the wrapper mounted and change its string or number `state` only when the view identity changes. The default cut is `fade`; `slide` and `none` are also available. Keep state controls outside the changing region and preserve the app's focus and announcement behavior.
7. Apply the chosen motion theme's settings and tell the user what changed and where.

## Pitfalls

- Two `<Cuts />` in the tree: keep one, at the root.
- A dialog opened from code with no trigger starts from the centre, which is expected.
- Toasts work with `toast()` imported from `sonner` as usual; nothing changes in how you call them.
