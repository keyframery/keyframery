import Link from "next/link"

import { AgentPromptButton } from "@/components/site/agent-prompt-button"

import { SectionHeading } from "./section-heading"

const pre = "overflow-x-auto rounded-lg border bg-background px-3 py-2 font-mono text-[12.5px] leading-6 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
const cell = "flex min-w-0 flex-col gap-3 p-6 md:p-7"

/** "Or let your coding agent do it": a prompt for any agent, the Claude Code plugin, and the MCP server, in one panel. */
export function Agents() {
  return (
    <section aria-labelledby="agents-title" className="mx-auto w-full max-w-[1200px] px-4 pt-24 md:pt-36">
      <SectionHeading id="agents-title" title="Or let your coding agent do it">
        Claude Code, Codex, Cursor and other agents can install Keyframery, add the helpers your app needs, and read these docs while they work.
      </SectionHeading>
      <div className="mt-12 grid divide-y overflow-hidden rounded-2xl border bg-card md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)] md:divide-x md:divide-y-0">
        <div className={cell}>
          <p className="text-[15px] font-medium">Copy a prompt</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            For any agent. It installs Keyframery, renders <code className="font-mono text-[13px] text-foreground">{"<Cuts />"}</code>, and wraps your lists, numbers,
            loading states, cards and content states.
          </p>
          <AgentPromptButton className="mt-auto w-full sm:w-auto" />
        </div>
        <div className={cell}>
          <p className="text-[15px] font-medium">The Claude Code plugin</p>
          <p className="text-sm leading-relaxed text-muted-foreground">Does the same, and reads the docs through the Keyframery MCP server:</p>
          <pre tabIndex={0} className={pre}>
            {"/plugin marketplace add keyframery/keyframery\n/plugin install keyframery@keyframery"}
          </pre>
        </div>
        <div className={cell}>
          <p className="text-[15px] font-medium">The MCP server</p>
          <p className="text-sm leading-relaxed text-muted-foreground">Read-only, no account. Add it to any agent that speaks MCP:</p>
          <pre tabIndex={0} className={pre}>
            https://keyframery.com/mcp
          </pre>
          <Link href="/docs/ai-tools" className="mt-auto text-sm font-medium underline underline-offset-4">
            Set it up in your agent
          </Link>
        </div>
      </div>
    </section>
  )
}
