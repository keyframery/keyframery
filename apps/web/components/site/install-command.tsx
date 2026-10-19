"use client"

import * as React from "react"

import { trackCopy } from "@/lib/track-copy"
import { cn } from "@/lib/utils"

export function InstallCommand({ command, className }: { command: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)
  const [error, setError] = React.useState(false)
  return (
    <div className={cn("flex h-11 w-full max-w-full items-center gap-3 rounded-lg border bg-card pr-1.5 pl-4 font-mono text-[13px] shadow-xs sm:w-auto", className)}>
      <span className="min-w-0 flex-1 truncate text-left">
        <span aria-hidden="true" className="text-muted-foreground select-none">$ </span>
        {command}
      </span>
      <button
        type="button"
        aria-label={copied ? "Copied" : error ? "Copy failed. Retry copying the install command" : "Copy the install command"}
        onClick={async () => {
          setCopied(false)
          setError(false)
          try {
            if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable")
            await navigator.clipboard.writeText(command)
            trackCopy("install_copy", "install-command")
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          } catch {
            setError(true)
          }
        }}
        className="shrink-0 rounded-md px-2.5 py-1.5 font-sans text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {copied ? "Copied" : error ? "Retry copy" : "Copy"}
      </button>
      <span role="status" className="sr-only">{error ? "Copy failed. Select and copy the install command manually, or try again." : copied ? "Copied the install command" : ""}</span>
    </div>
  )
}
