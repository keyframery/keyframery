import Link from "next/link"

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

export function InstallSteps() {
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
              <pre tabIndex={0} className="overflow-x-auto py-3 font-mono text-[13px] leading-6 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <code className="block w-max min-w-full">
                  <span className="block px-4">{'import { Cuts } from "@/components/keyframery/cuts"'}</span>
                  <span className="block px-4">{" "}</span>
                  <span className="block px-4">{"export default function RootLayout({ children }) {"}</span>
                  <span className="block px-4">{"  return ("}</span>
                  <span className="block px-4">{'    <html lang="en">'}</span>
                  <span className="block px-4">{"      <body>"}</span>
                  <span className="block px-4">{"        {children}"}</span>
                  <span className="block border-l-2 border-cut bg-cut/[0.07] pr-4 pl-[14px] font-medium">{"        <Cuts />"}</span>
                  <span className="block px-4">{"      </body>"}</span>
                  <span className="block px-4">{"    </html>"}</span>
                  <span className="block px-4">{"  )"}</span>
                  <span className="block px-4">{"}"}</span>
                </code>
              </pre>
            </div>
          </li>
        </ol>
        <div className="min-w-0 rounded-xl border bg-card p-5 shadow-xs">
          <p className="text-[15px] font-medium">Using Claude Code?</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Add the plugin and ask Claude to animate your app. It knows which cut fits each change, and reads the docs through the{" "}
            <Link href="/docs/ai-tools" className="font-medium text-foreground underline underline-offset-4">
              Keyframery MCP server
            </Link>
            .
          </p>
          <pre tabIndex={0} className="mt-3 overflow-x-auto rounded-md border bg-background px-3 py-2 font-mono text-[13px] leading-6 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            {"/plugin marketplace add keyframery/keyframery\n/plugin install keyframery@keyframery"}
          </pre>
        </div>
      </div>
    </section>
  )
}
