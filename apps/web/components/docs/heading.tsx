"use client"

import { Check, Link as LinkIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

type Level = "h2" | "h3" | "h4"

/**
 * Fumadocs' heading with its copy-link button, except the button is named with aria-label instead of hidden text.
 * The hidden text was part of the heading's text, so search engines and AI tools read every heading as
 * "Install Copy Anchor Link".
 */
export function Heading({ as: As, id, className, children, ...props }: React.ComponentProps<"h2"> & { as: Level }) {
  const [copied, setCopied] = React.useState(false)
  if (!id)
    return (
      <As className={className} {...props}>
        {children}
      </As>
    )
  const copy = () => {
    const link = new URL(window.location.href)
    link.hash = id
    void navigator.clipboard.writeText(link.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <As id={id} className={cn("group/heading flex scroll-m-28 flex-row items-center gap-1", className)} {...props}>
      <a data-card="" href={`#${id}`}>
        {children}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied link to this section" : "Copy link to this section"}
        className="not-prose inline-flex size-6 shrink-0 items-center justify-center rounded-md text-fd-muted-foreground opacity-0 transition-opacity group-hover/heading:opacity-100 hover:bg-fd-accent focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:outline-none [&_svg]:size-4"
      >
        {copied ? <Check aria-hidden="true" /> : <LinkIcon aria-hidden="true" />}
      </button>
    </As>
  )
}
