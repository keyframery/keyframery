"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** A live demo with a Keyframery / Stock switch. Stock wraps the stage in data-cut="none", which also reaches its portaled parts. */
export function Preview({ children, className }: { children: React.ReactNode; className?: string }) {
  const [stock, setStock] = React.useState(false)
  return (
    <div data-preview="" className="not-prose my-6 overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-1 border-b px-2 py-1.5 text-sm">
        {[false, true].map((s) => (
          <button
            key={String(s)}
            type="button"
            aria-pressed={stock === s}
            onClick={() => setStock(s)}
            className="rounded-md px-2.5 py-1 text-muted-foreground hover:bg-muted aria-pressed:bg-muted aria-pressed:text-foreground"
          >
            {s ? "Stock" : "Keyframery"}
          </button>
        ))}
        <span className="ml-auto pr-1 text-muted-foreground max-sm:hidden">{stock ? "shadcn's own motion" : "with <Cuts />"}</span>
      </div>
      <div data-preview-stage="" data-cut={stock ? "none" : undefined} className={cn("flex min-h-52 flex-wrap items-center justify-center gap-3 p-8", className)}>
        {children}
      </div>
    </div>
  )
}
