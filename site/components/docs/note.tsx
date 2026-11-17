import type * as React from "react"

import { cn } from "@/lib/utils"

/* A short highlighted note in the docs: a bold lead-in, then one or two sentences on the same line.
   `tone="recommend"` is the green "do this" note (shadcn's style); `tone="info"` is a quiet neutral one.
   <Note title="Recommended for new projects:">Use [Create](/create) to …</Note> */
export function Note({
  title,
  tone = "recommend",
  className,
  children,
}: {
  title?: string
  tone?: "recommend" | "info"
  className?: string
  children: React.ReactNode
}) {
  return (
    <aside
      data-tone={tone}
      className={cn(
        "not-prose my-6 rounded-2xl border px-5 py-4 text-[15px] leading-7",
        "[&_a]:font-medium [&_a]:underline [&_a]:decoration-current/40 [&_a]:underline-offset-4 [&_a:hover]:decoration-current",
        "[&_p]:m-0 [&_p]:inline [&_code]:rounded-md [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px]",
        tone === "recommend" &&
          "border-emerald-500/50 bg-emerald-50 text-emerald-950 [&_code]:bg-emerald-900/10 dark:border-emerald-400/70 dark:bg-emerald-900/55 dark:text-emerald-50/90 dark:[&_code]:bg-emerald-50/10",
        tone === "info" && "border-border bg-muted/60 text-foreground [&_code]:bg-foreground/[0.06]",
        className,
      )}
    >
      {title ? <strong className="font-semibold">{title} </strong> : null}
      {children}
    </aside>
  )
}
