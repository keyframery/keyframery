---
name: keyframery
description: Use when adding animation, motion or transitions to a React app built with shadcn/ui (dialogs, sheets, drawers, tabs, toasts, menus, lists, numbers, loading states), or when the user mentions Keyframery, <Cuts />, MatchCut, ListCut, ValueCut or LoadCut. Installs Keyframery with the shadcn CLI and picks the right cut for each kind of change.
---

# Keyframery

Keyframery gives shadcn/ui apps the transitions a film editor would make. One `<Cuts />` in the root layout animates shadcn's own dialogs, sheets, drawers, tabs, toasts and menus without editing them. Four helpers cover the changes shadcn has no component for. The code is copied into the project by the shadcn CLI, like the rest of shadcn.

The `keyframery` MCP server at https://keyframery.com/mcp (the Claude Code plugin connects it) has the details:
- `list_kinds`: the six kinds of change, with the cut, install command and snippet for each. Call it before choosing a helper.
- `get_doc`: any docs page as Markdown, for example `installation`, `helpers/list-cut`, `customize`.
- `search_docs`: find the right page when you don't know it.
- `make_theme`: the `<Cuts />` line and CSS for a chosen speed, easing or cut.

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

Rules:
- Never hand-write enter or exit animations, `tw-animate` classes or Framer Motion wrappers for shadcn components. `<Cuts />` already handles them.
- Don't animate static components: buttons, inputs, labels, badges that don't change.
- Use the same stable `id` you use as the React `key` for ListCut items and MatchCut pairs.
- Call `get_doc` for a helper's exact props before writing it.

## 6. Tune it

- Per component: `<Cuts dialog="punch-in" tabs="whip" toast="none" pace={1.2} />`.
- App-wide or per section: the `--kf-*` variables in `globals.css`, such as `--kf-pace`, `--kf-ease`, `--kf-travel`, `--kf-blur`, `--kf-depth`, `--kf-hold`. `make_theme` writes both for you.
- Per element: `data-cut="none"` turns cuts off for an element and everything inside it. `data-cut-pace="2"` slows one section.
- Reduced motion is handled: every cut becomes a short fade.

## 7. Add cuts to an existing app

When asked to "add animations" or "make the app feel smoother":
1. Install and render `<Cuts />` (steps 2–4). Most of the visible change comes from this alone.
2. Look for lists rendered with `.map(` whose items are added, removed or reordered, and wrap them in `ListCut`.
3. Look for numbers or statuses that update (totals, counters, prices, order status), and wrap them in `ValueCut`.
4. Look for `isLoading ? <Skeleton /> : …` patterns, and replace them with `LoadCut`.
5. Look for cards or rows that link to a detail view, and pair them with `MatchCut`.
6. Tell the user what you changed and where, one line per place.

## Pitfalls

- Two `<Cuts />` in the tree: keep one, at the root.
- A dialog opened from code with no trigger starts from the centre, which is expected.
- Toasts work with `toast()` imported from `sonner` as usual; nothing changes in how you call them.
