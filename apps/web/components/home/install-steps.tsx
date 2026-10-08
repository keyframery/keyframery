import { highlight } from "fumadocs-core/highlight"
import Link from "next/link"

import { AgentPromptButton } from "@/components/site/agent-prompt-button"
import { InstallCommand } from "@/components/site/install-command"
import { REGISTER } from "@/lib/kinds"

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[17px] font-medium">
      <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full border bg-card text-[13px] tabular-nums">
        {n}
      </span>
      {children}
    </p>
  )
}

const LAYOUT = `import { Cuts } from "@/components/keyframery/cuts"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Cuts />
      </body>
    </html>
  )
}`
const CUTS_LINE = 8

export async function InstallSteps() {
  // Shiki at build time (GitHub themes, like the docs); the <Cuts /> line gets the cobalt mark.
  const snippet = await highlight(LAYOUT, {
    lang: "tsx",
    // The high-contrast GitHub themes: the plain ones colour some tokens (parameters) below 4.5:1.
    themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" },
    transformers: [
      {
        line(node, line) {
          if (line === CUTS_LINE) this.addClassToHast(node, "highlighted")
        },
      },
    ],
    components: {
      pre: (props) => (
        <pre
          {...props}
          tabIndex={0}
          className={`${props.className ?? ""} kf-snippet overflow-x-auto py-3 font-mono text-[13px] leading-6 outline-none focus-visible:ring-3 focus-visible:ring-ring/50`}
        />
      ),
    },
  })
  return (
    <section aria-labelledby="install-title" className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 pt-24 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:pt-36">
      <div>
        <h2 id="install-title" className="text-[30px] leading-[1.1] font-semibold tracking-[-0.025em] md:text-[38px]">
          Install in two steps
        </h2>
        <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-muted-foreground">
          Keyframery doesn&apos;t replace or wrap your components. It finds shadcn&apos;s own parts on the page and gives them motion. Remove the line and
          you&apos;re back to stock shadcn.
        </p>
        <Link href="/docs/installation" className="mt-6 inline-block text-[15px] font-medium underline underline-offset-4">
          Read the installation guide
        </Link>
      </div>
      <div className="grid min-w-0 gap-10">
        <ol className="grid min-w-0 gap-10">
          <li className="min-w-0">
            <Step n={1}>Add it with the shadcn CLI</Step>
            {/* minmax(0, 1fr): a grid column otherwise grows to the longest command and widens the page on phones. */}
            <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-2">
              <InstallCommand className="sm:w-full" command={REGISTER} />
              <InstallCommand className="sm:w-full" command="npx shadcn add @keyframery/cuts" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The first line registers Keyframery in your <code className="font-mono text-[13px] text-foreground">components.json</code>, once. After that every
              helper installs by name, like <code className="font-mono text-[13px] text-foreground">npx shadcn add @keyframery/list-cut</code>. The second copies{" "}
              <code className="font-mono text-[13px] text-foreground">{"<Cuts />"}</code>, its stylesheet and a small engine into your project: about 7 KB gzipped, with
              no extra dependencies.
            </p>
          </li>
          <li className="min-w-0">
            <Step n={2}>
              <span>
                Render <code className="font-mono text-[15px]">{"<Cuts />"}</code> once, in your root layout
              </span>
            </Step>
            <div className="mt-4 overflow-hidden rounded-xl border bg-card shadow-xs">
            <p className="border-b px-4 py-2 font-mono text-xs text-muted-foreground">app/layout.tsx</p>
            {snippet}
          </div>
          </li>
        </ol>
        <div className="min-w-0 rounded-xl border bg-card p-5 shadow-xs">
          <p className="text-[15px] font-medium">Using a coding agent?</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Copy a short prompt for Claude Code, Cursor or any other agent. It installs Keyframery, renders{" "}
            <code className="font-mono text-[13px] text-foreground">{"<Cuts />"}</code>, and wraps the lists, numbers, skeletons and cards in your app.
          </p>
          <AgentPromptButton className="mt-3 w-full sm:w-auto" />
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            In Claude Code, the plugin does the same, and reads the docs through the{" "}
            <Link href="/docs/ai-tools" className="font-medium text-foreground underline underline-offset-4">
              Keyframery MCP server
            </Link>
            :
          </p>
          <pre tabIndex={0} className="mt-3 overflow-x-auto rounded-md border bg-background px-3 py-2 font-mono text-[13px] leading-6 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            {"/plugin marketplace add keyframery/keyframery\n/plugin install keyframery@keyframery"}
          </pre>
        </div>
      </div>
    </section>
  )
}
