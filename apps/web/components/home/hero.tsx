import Link from "next/link"

import { AgentPromptButton } from "@/components/site/agent-prompt-button"
import { GitHubIcon } from "@/components/site/github-icon"
import { InstallCommand } from "@/components/site/install-command"
import { INSTALL } from "@/lib/kinds"

import { BeforeAfter } from "./before-after"
import { WORKS_WITH } from "./logos"

const action = "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50"

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="landing-hero relative isolate border-b">
      <div aria-hidden="true" className="landing-hero-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-4 pt-10 text-center md:pt-14">
        <p className="inline-flex items-center gap-2.5 font-mono text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-cut" />
          The motion layer for shadcn/ui
        </p>
        <h1 id="hero-title" className="mt-5 text-[39px] leading-[1.06] font-semibold tracking-[-0.045em] text-balance sm:text-[52px] md:text-[64px]">
          Add one line. <span className="md:block">Your shadcn/ui app <span className="text-cut">animates.</span></span>
        </h1>
        <p className="mt-5 max-w-[54ch] text-base leading-relaxed text-pretty text-muted-foreground sm:text-[17px]">
          Keyframery adds consistent motion to your existing shadcn/ui app.
          Dialogs, lists and loading states move. Your components stay yours.
        </p>
        <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-3">
          <a href="#demo" className={`${action} bg-foreground text-background shadow-xs hover:bg-foreground/85`}>
            Try the demo <span aria-hidden="true">↗</span>
          </a>
          <Link href="/docs/installation" className={`${action} border bg-card hover:bg-muted`}>
            Add to my app
          </Link>
        </div>
        <ul aria-label="Facts" className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground sm:text-[13px]">
          <li>Free and open source</li>
          <li>MIT licensed</li>
          <li>No account required</li>
        </ul>
        <div className="mt-5 w-full max-w-[345px] sm:w-auto sm:max-w-none">
          <InstallCommand command={INSTALL} className="h-9 border-transparent bg-transparent text-xs shadow-none" />
        </div>
      </div>
      <BeforeAfter />
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-5 px-4 py-8 md:gap-6 md:py-10">
        <div className="flex flex-col items-center gap-3 md:flex-row md:gap-7">
          <p className="text-xs text-muted-foreground">Built for your stack</p>
          <ul aria-label="Works with" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] font-medium text-foreground/80">
            {WORKS_WITH.map((tool) => (
              <li key={tool.name} className="inline-flex items-center gap-2">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 fill-current"><path d={tool.path} /></svg>
                {tool.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] text-muted-foreground">
          <span>About 12 KB gzipped · no animation dependencies</span>
          <Link href="/theme" className="underline-offset-4 hover:text-foreground hover:underline">Make a motion theme</Link>
          <a href="https://github.com/keyframery/keyframery" className="inline-flex items-center gap-1.5 underline-offset-4 hover:text-foreground hover:underline">
            <GitHubIcon className="size-3.5" /> GitHub
          </a>
          <AgentPromptButton className="hidden h-8 border-transparent bg-transparent px-2 text-xs shadow-none sm:inline-flex" />
        </div>
      </div>
    </section>
  )
}
