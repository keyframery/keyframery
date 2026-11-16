# Keyframery

**Animated components for [UI SDK](https://ui-sdk.dev), built with plain CSS.**

Keyframery is 63 drop-in components with motion built in: all 55 of UI SDK's, and 8 more. They keep UI SDK's parts and props, so you swap one import and keep your code. Tabs stretch toward the tab you pick, menus unfold from the button that opened them, checks draw themselves and numbers roll.

- Website and docs: https://keyframery.com
- Installation: https://keyframery.com/docs/installation
- Motion styles: https://keyframery.com/docs/motion-styles

## Quick start

In a project set up for the shadcn CLI:

```bash
npx shadcn add @keyframery/tabs     # one component
npx shadcn add @keyframery/all      # all 60
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

Keyboard, focus and screen-reader behaviour come from UI SDK, untouched. With reduced motion turned on, nothing moves except loading spinners. Details: https://keyframery.com/docs/accessibility

## Working on this repo

```bash
pnpm install
pnpm dev          # the component lab (Vite), http://localhost:4610
pnpm site:dev     # the website (Next.js), http://localhost:4640
pnpm build        # builds the shadcn registry into public/r, then the website
```

- `src/components/primitives/`: the motion primitives, with the same parts and props as UI SDK
- `src/components/ui/`: the finished components
- `src/demos/`: self-playing demos, used by the lab and the website
- `HOUSE.md` and `MOTION.md`: the design and motion rules every component follows
- `PROGRESS.md`: the current state and the plan

## License

MIT
