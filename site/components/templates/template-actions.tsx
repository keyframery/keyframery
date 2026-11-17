"use client"

import { CheckIcon, CopyIcon, ScanEye } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { templatePrompt } from "@site/lib/templates"
import { trackCopy } from "@site/lib/track-copy"

/** The two things to do with a template: look at it full screen, or hand it to a coding agent. */
export function TemplateActions({ slug }: { slug: string }) {
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle")
  const Icon = state === "copied" ? CheckIcon : CopyIcon
  return (
    <div className="not-prose flex flex-wrap items-center gap-2">
      <Button size="lg" render={<a href={`/templates/${slug}`} target="_blank" rel="noreferrer" />} className="h-10 px-4">
        <ScanEye aria-hidden />
        Live preview
      </Button>
      <Button
        variant="primary"
        size="lg"
        className="h-10 px-4"
        onClick={async () => {
          try {
            if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable")
            await navigator.clipboard.writeText(templatePrompt(slug))
            trackCopy("agent_prompt_copy", `template-${slug}`)
            setState("copied")
          } catch {
            setState("failed")
          }
          setTimeout(() => setState("idle"), 2200)
        }}
      >
        <Icon aria-hidden />
        {/* One grid cell for all three labels, so the button keeps its width. */}
        <span className="grid">
          <span className={state === "idle" ? "col-start-1 row-start-1" : "invisible col-start-1 row-start-1"}>Copy for your coding agent</span>
          <span className={state === "copied" ? "col-start-1 row-start-1" : "invisible col-start-1 row-start-1"}>Copied. Now paste it.</span>
          <span className={state === "failed" ? "col-start-1 row-start-1" : "invisible col-start-1 row-start-1"}>Copy failed. Try again.</span>
        </span>
      </Button>
      <span role="status" className="sr-only">
        {state === "copied" ? "Copied the setup instructions" : state === "failed" ? "Could not copy the setup instructions" : ""}
      </span>
    </div>
  )
}
