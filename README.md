# Keyframery

Motion for shadcn/ui. Render one `<Cuts />` in your root layout, and your dialogs, sheets, tabs and toasts start moving from the button you pressed, and back into it. Five small components cover the changes shadcn has no component for: lists, numbers, loading states, cards that open into a page, and views that change state. Pick a motion theme (Quiet, Crisp, Expressive or your own) for the whole app. Your components don't change.

- Website and docs: https://keyframery.com
- Quick start: https://keyframery.com/docs/installation
- Motion theme builder: https://keyframery.com/theme
- Use with Claude Code, Codex, Cursor and other coding agents: https://keyframery.com/docs/ai-tools

## Quick start

In a project with shadcn/ui:

```bash
npx shadcn add @keyframery/cuts
```

If the CLI answers `Unknown registry "@keyframery"`, register it once with `npx shadcn registry add "@keyframery=https://keyframery.com/r/{name}.json"`, then install again.

Then render `<Cuts />` once, at the root:

```tsx
import { Cuts } from "@/components/keyframery/cuts"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Cuts />
      </body>
    </html>
  )
}
```

Open a dialog: it grows out of the button you pressed. It works with Base UI and Radix, in Next.js, Vite and React Router, at about 12 KB gzipped with no dependencies. Like the rest of shadcn, the CLI copies the code into your project, so you own it.

## Reusable motion themes

Start from Quiet, Crisp or Expressive in the [builder](https://keyframery.com/theme), then tune component cuts, pace and entrance/exit easing. Preview a complete app workflow before copying installation instructions, configured JSX and CSS. Save themes locally, share a link, or import/export a validated version-1 JSON file. No account is required and all these features are free.

Profiles generate props and CSS; `Cuts` does not have a `profile` prop. Shared pace and easing also apply to the helpers. Rack-focus travel, blur and depth affect rack-focus dialogs specifically, and native drawer gestures stay with the UI library.

## The five helpers

| Component | For | Install |
|---|---|---|
| [`MatchCut`](https://keyframery.com/docs/helpers/match-cut) | a card that opens into its detail view | `npx shadcn add @keyframery/match-cut` |
| [`ListCut`](https://keyframery.com/docs/helpers/list-cut) | lists that gain, lose or reorder items | `npx shadcn add @keyframery/list-cut` |
| [`ValueCut`](https://keyframery.com/docs/helpers/value-cut) | numbers and statuses that change | `npx shadcn add @keyframery/value-cut` |
| [`LoadCut`](https://keyframery.com/docs/helpers/load-cut) | skeletons that turn into content | `npx shadcn add @keyframery/load-cut` |
| [`StateCut`](https://keyframery.com/docs/helpers/state-cut) | empty, error, success and other whole-content states | `npx shadcn add @keyframery/state-cut` |

Keep one root `<Cuts />` mounted to enable helper motion. For example:

```tsx
import { StateCut } from "@/components/keyframery/state-cut"

<StateCut state={status} cut="fade">
  {status === "success" ? <Confirmation /> : <OrderForm />}
</StateCut>
```

StateCut transitions whole views. LoadCut manages skeleton delay and minimum display time; ValueCut animates small values. All respect reduced motion and support opting out.

**Icon moves** (`npx shadcn add @keyframery/icon-moves`, then `<IconMoves />` next to `<Cuts />`): when a button, menu item or sidebar item is pressed, its lucide icon plays its own move. Your icons stay the ones you wrote.

## Use with your coding agent

In Claude Code, the plugin teaches Claude which animation fits each change, and connects the Keyframery MCP server:

```bash
/plugin marketplace add keyframery/keyframery
/plugin install keyframery@keyframery
```

Every other agent connects to the MCP server at `https://keyframery.com/mcp`. It is read-only and needs no account. For example, in Codex:

```bash
codex mcp add keyframery --url https://keyframery.com/mcp
```

Setup for Claude, Cursor, VS Code, Gemini CLI and any other MCP client: https://keyframery.com/docs/ai-tools

The docs are also plain text for any assistant: https://keyframery.com/llms-full.txt

## Working on Keyframery

| Path | What |
|---|---|
| `registry/` | the shipped source: `components/keyframery/*`, `lib/keyframery/*`, `registry.json` |
| `apps/web/` | keyframery.com: Next.js 16 + Fumadocs, including the MCP server at `/mcp` |
| `plugins/keyframery/` | the Claude Code plugin; `.claude-plugin/marketplace.json` lists it |
| `fixtures/` | generated test apps: Next.js on Base UI and Radix, plus stock twins |
| `tests/` | Vitest unit tests, Playwright end-to-end tests for the layer (`e2e/`) and the site (`site/`) |

```bash
pnpm install
pnpm refresh                 # build the registry, sync and build the fixture apps
pnpm test:unit               # unit tests
pnpm test:e2e                # the layer in 3 browsers × Base UI/Radix × full/reduced motion
pnpm site:build              # build keyframery.com
pnpm site:start              # serve it on http://localhost:4500
pnpm test:site               # site tests (desktop browsers + phone)
pnpm -C apps/web dev         # work on the site with hot reload
pnpm check                   # every check, before a deploy (pnpm check:site skips the layer's browser tests)
```

There is no CI: every deploy runs `pnpm check` on the deploying machine first.

## License

MIT, by [Briyan Hingrajiya](https://x.com/briyan_dev).
