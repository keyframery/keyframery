"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import * as React from "react"

import { agentPrompt } from "@/lib/kinds"
import { trackCopy } from "@/lib/track-copy"
import { cn } from "@/lib/utils"

/** Copies setup instructions to paste into Claude Code, Cursor or any other coding agent. */
export function AgentPromptButton({ className }: { className?: string }) {
  const [copied, setCopied] = React.useState(false)
  const [error, setError] = React.useState(false)
  const Icon = copied ? CheckIcon : CopyIcon
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          setCopied(false)
          setError(false)
          try {
            if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable")
            await navigator.clipboard.writeText(agentPrompt())
            trackCopy("agent_prompt_copy", "agent-prompt-button")
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          } catch {
            setError(true)
          }
        }}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-lg border bg-card px-5 text-sm font-medium shadow-xs outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        )}
      >
        <Icon aria-hidden="true" className="size-4" />
        {/* Both labels share one grid cell, so the button keeps its width when the label changes. The hidden one
            (visibility: hidden) drops out of the button's name, so the name is always the label you see. */}
        <span className="grid">
          <span className={cn("col-start-1 row-start-1", (copied || error) && "invisible")}>Copy for your coding agent</span>
          <span className={cn("col-start-1 row-start-1", !copied && "invisible")}>Copied. Now paste it.</span>
          <span className={cn("col-start-1 row-start-1", !error && "invisible")}>Copy failed. Try again.</span>
        </span>
      </button>
      {/* Outside the button, so the announcement doesn't become part of the button's name. */}
      <span role="status" className="sr-only">
        {error ? "Could not copy the setup instructions. Check clipboard permissions and try again." : copied ? "Copied the setup instructions" : ""}
      </span>
    </>
  )
}
