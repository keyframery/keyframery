# Keyframery

**The component library for [UI SDK](https://ui-sdk.dev). Built to move, built for agents.**

UI SDK is a library of behaviours: keyboard, focus, selection and a bridge that lets AI agents read and use your UI. Keyframery is the component library on top: 83 components with a finished look and the motion done in plain CSS. All 55 of UI SDK's components are here, plus components defined on UI SDK's core. They keep UI SDK's parts and props, so an app already on UI SDK swaps one import and keeps its code. Tabs stretch toward the tab you pick, menus unfold from the button that opened them, checks draw themselves and numbers roll.

Every component page also has **Agent view**: the live UI SDK snapshot an AI agent reads (labels, state and the actions each component accepts), beside the component. Run an action and the real component responds. No model or API key needed.

- Website and docs: https://keyframery.com
- Installation: https://keyframery.com/docs/installation
- Motion styles: https://keyframery.com/docs/motion-styles
- Agent view: https://keyframery.com/docs/agent-view

## Quick start

In a project set up for the shadcn CLI:

```bash
npx shadcn add @keyframery/tabs     # one component
npx shadcn add @keyframery/all      # the collection
```

The code lands in `components/keyframery/`, next to (not over) your `components/ui/`. UI SDK is installed for you.

```tsx
import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/components/keyframery/tabs"
```

Already styling UI SDK yourself? Import the primitive instead. It exports the same parts and props as `@ui-sdk/react/tabs` and adds only the motion:

```tsx
import { Tabs, TabsList, TabsTab } from "@/components/keyframery/primitives/tabs"
```

## Motion styles

Four styles change how everything moves. Set one on `<html>`:

```html
<html data-motion="calm">  <!-- calm | springy (default) | snappy | playful -->
```

Or let people pick with `npx shadcn add @keyframery/motion-style`.

## Why plain CSS

- **No animation package to install.** Springs are CSS easings, so the motion runs on the compositor and works in server-rendered pages.
- **Motion styles are one setting.** Every duration reads `--kf-speed` and every easing reads `--ease-house`, `--ease-spring` or `--ease-pop`.

## Accessibility

Native components retain UI SDK’s keyboard, focus and screen-reader behavior. Additional components declare their behavior and ARIA on UI SDK’s core. With reduced motion turned on, nothing moves except loading spinners. Details: https://keyframery.com/docs/accessibility

## Working on this repo

```bash
pnpm install
pnpm dev          # the component lab (Vite), http://localhost:4610
pnpm site:dev     # the website (Next.js), http://localhost:4640
pnpm build        # builds the shadcn registry into public/r, then the website
pnpm check        # TypeScript, regression, SDK, customization and registry checks
pnpm check:browser # demo screenshots/smoke checks; requires the Vite lab on :4610
```

- `src/components/core/`: framework-independent UI SDK definitions for additional components
- `src/components/primitives/`: the motion primitives, with the same parts and props as UI SDK
- `src/components/ui/`: the finished components
- `src/demos/`: self-playing demos, used by the lab and the website
- `HOUSE.md`, `MOTION.md` and `CORE.md`: design, motion, UI SDK and customization rules
- Every component page opens its Customize panel below the preview, with color, layout and behavior controls plus Animation speed (higher means faster). Leaving colors unset follows the light/dark theme.
- `PROGRESS.md`: the current state and the plan

## License

MIT
