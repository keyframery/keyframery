"use client"

import * as React from "react"

export function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <div className="flex max-w-full items-center gap-3 rounded-lg border bg-card py-1.5 pr-1.5 pl-4 font-mono text-[13px]">
      <span className="truncate">
        <span aria-hidden="true" className="text-muted-foreground select-none">$ </span>
        {command}
      </span>
      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy the install command"}
        onClick={async () => {
          await navigator.clipboard?.writeText(command).catch(() => {})
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        }}
        className="shrink-0 rounded-md px-2.5 py-1 font-sans text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  )
}
