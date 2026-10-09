import Link from "next/link"

import { AgentPromptButton } from "@/components/site/agent-prompt-button"
import { GitHubIcon } from "@/components/site/github-icon"
import { InstallCommand } from "@/components/site/install-command"
import { INSTALL } from "@/lib/kinds"

import { BeforeAfter } from "./before-after"
import { WORKS_WITH } from "./logos"

const action = "inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate">
      <div aria-hidden="true" className="dot-field pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px]" />
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-4 pt-12 text-center md:pt-16">
        <Link
          href="/docs/ai-tools"
          className="inline-flex max-w-full items-center gap-2 rounded-full border bg-card py-1 pr-3.5 pl-1 text-[13px] shadow-xs outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="rounded-full bg-foreground px-2 py-0.5 text-xs font-medium text-background">New</span>
          <span className="truncate">Works with Claude Code, Codex, Cursor and more</span>
        </Link>
        <h1 id="hero-title" className="mt-7 text-[40px] leading-[1.03] font-semibold tracking-[-0.04em] text-balance sm:text-[52px] md:text-[68px]">
          Add one line. <span className="md:block">Your shadcn/ui app animates.</span>
        </h1>
        <p className="mt-6 max-w-[60ch] text-[17px] leading-relaxed text-pretty text-muted-foreground md:text-lg">
          <span className="md:block">Dialogs grow from the button you clicked. Tabs slide instead of snapping.</span>{" "}
          <span className="md:block">Lists, numbers and loading states move instead of jumping.</span>{" "}
          {/* Phones keep the original length: a longer paragraph pushes the demo below its autoplay threshold. */}
          <span className="md:block">
            <span className="hidden sm:inline">
              Pick a{" "}
              <Link href="/theme" className="text-foreground underline underline-offset-4">
                motion theme
              </Link>
              .{" "}
            </span>
            Your components don&apos;t change.
          </span>
        </p>
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <InstallCommand command={INSTALL} />
          {/* Not on phones: there the button would push the demo below the fold, and agents run on desktops anyway. */}
          <AgentPromptButton className="hidden sm:inline-flex" />
          <div className="flex gap-3">
            <Link href="/docs/installation" className={`${action} bg-foreground text-background hover:bg-foreground/85`}>
              Get started
            </Link>
            <a href="https://github.com/keyframery/keyframery" className={`${action} border bg-card shadow-xs hover:bg-muted`}>
              <GitHubIcon className="size-4" />
              GitHub
            </a>
          </div>
        </div>
        <ul aria-label="Facts" className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
          <li>
            <b className="font-semibold text-foreground tabular-nums">63</b> components
          </li>
          <li>
            <b className="font-semibold text-foreground tabular-nums">12 KB</b> gzipped
          </li>
          <li>
            <b className="font-semibold text-foreground tabular-nums">0</b> dependencies
          </li>
          <li>
            <b className="font-semibold text-foreground">Base UI</b> and <b className="font-semibold text-foreground">Radix</b>
          </li>
        </ul>
      </div>
      <BeforeAfter />
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-4 px-4 pt-12 md:flex-row md:justify-center md:gap-8">
        <p className="text-sm text-muted-foreground">Works with</p>
        <ul aria-label="Works with" className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm font-medium text-foreground/80">
          {WORKS_WITH.map((tool) => (
            <li key={tool.name} className="inline-flex items-center gap-2">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px] fill-current">
                <path d={tool.path} />
              </svg>
              {tool.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
