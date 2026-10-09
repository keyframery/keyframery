import { highlight } from "fumadocs-core/highlight"
import Link from "next/link"

import { InstallCommand } from "@/components/site/install-command"
import { INSTALL } from "@/lib/kinds"
import tested from "@/lib/tested.json"

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

function Step({ n, title, children }: { n: number; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4">
      <span aria-hidden="true" className="grid size-7 place-items-center rounded-full border text-[13px] tabular-nums">
        {n}
      </span>
      <p className="self-center text-[17px] font-medium">{title}</p>
      <div className="col-start-2 mt-3 grid min-w-0 gap-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </li>
  )
}

/** "How it works", the page's one dark panel: three steps beside the one line they add, and why that's enough. */
export async function HowItWorks() {
  // Shiki at build time with the high-contrast GitHub themes (the plain ones colour some tokens below 4.5:1).
  const snippet = await highlight(LAYOUT, {
    lang: "tsx",
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
          className={`${props.className ?? ""} kf-snippet overflow-x-auto py-4 font-mono text-[13px] leading-6 outline-none focus-visible:ring-3 focus-visible:ring-ring/50`}
        />
      ),
    },
  })
  return (
    <section aria-labelledby="how-title" className="mx-auto w-full max-w-[1200px] px-4 pt-24 md:pt-36">
      {/* .dark switches the design tokens inside, so the panel stays dark on a light page. */}
      <div className="dark rounded-3xl border bg-background text-foreground shadow-[0_40px_80px_-40px_rgba(16,16,20,0.55)] dark:bg-neutral-950">
        <div className="grid gap-12 p-6 sm:p-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-14 md:p-14">
          <div className="min-w-0">
            <h2 id="how-title" className="text-[32px] leading-[1.08] font-semibold tracking-[-0.03em] text-balance md:text-[44px]">
              One line. Your components don&apos;t change.
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-pretty text-muted-foreground">
              shadcn already gives every part a name, like <code className="font-mono text-[15px] whitespace-nowrap text-foreground">data-slot=&quot;dialog-content&quot;</code>. Keyframery
              reads those names and gives each part its motion. It doesn&apos;t replace or wrap anything, so removing the line puts you back on stock shadcn.
            </p>
            <ol className="mt-10 grid gap-8">
              <Step n={1} title="Add it with the shadcn CLI">
                {/* minmax(0, 1fr): a grid column otherwise grows to the longest command and widens the page on phones. */}
                <div className="grid grid-cols-[minmax(0,1fr)]">
                  <InstallCommand className="sm:w-full" command={INSTALL} />
                </div>
                <p>
                  It copies <code className="font-mono text-[13px] text-foreground">{"<Cuts />"}</code>, its stylesheet and a small engine into your project: about 12 KB
                  gzipped, no extra dependencies. Tested with shadcn CLI {tested.shadcnCli}, on Base UI and Radix.{" "}
                  <Link href="/docs/compatibility#tested-versions" className="whitespace-nowrap font-medium text-foreground underline underline-offset-4">
                    All versions
                  </Link>
                </p>
              </Step>
              <Step
                n={2}
                title={
                  <>
                    Render <code className="font-mono text-[15px]">{"<Cuts />"}</code> once, in your root layout
                  </>
                }
              >
                <p>
                  Next.js, Vite and React Router all work the same way.{" "}
                  <Link href="/docs/installation" className="font-medium text-foreground underline underline-offset-4">
                    Quick start
                  </Link>
                </p>
              </Step>
              <Step n={3} title="Use shadcn as usual">
                <p>Every component you have, and every one you add later. Nothing in your code changes.</p>
              </Step>
            </ol>
          </div>
          <div className="grid min-w-0 content-start gap-4">
            <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
              <p className="border-b px-4 py-2.5 font-mono text-xs text-muted-foreground">app/layout.tsx</p>
              {snippet}
            </div>
            <div aria-hidden="true" className="grid gap-2 rounded-xl border bg-card p-4 text-[13px] sm:grid-cols-[auto_auto_auto] sm:items-center sm:justify-start sm:gap-3">
              <span className="font-mono text-[12px] text-foreground">{"<DialogContent>"}</span>
              <span className="text-muted-foreground">renders as</span>
              <span className="font-mono text-[12px] text-foreground">{'<div data-slot="dialog-content">'}</span>
              <span className="text-muted-foreground sm:col-span-3">
                Keyframery sees that name, so the dialog grows out of the button you pressed.
              </span>
            </div>
            <p className="sr-only">Your DialogContent renders as an element named dialog-content. Keyframery sees that name and makes the dialog grow out of the button you pressed.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
