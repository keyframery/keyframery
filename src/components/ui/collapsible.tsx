"use client"

/* Styled collapsible: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Collapsible as CollapsibleRoot,
  CollapsiblePanel as CollapsiblePanelPart,
  CollapsibleTrigger as CollapsibleTriggerPart,
} from "@/components/primitives/collapsible"
import { cn } from "@/lib/utils"

function Collapsible({ className, ...props }: React.ComponentProps<typeof CollapsibleRoot>) {
  return <CollapsibleRoot className={cn("flex w-full flex-col", className)} {...props} />
}

/* A quiet row: muted text that wakes up on hover, with a chevron that turns when the panel opens. */
function CollapsibleTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CollapsibleTriggerPart>) {
  return (
    <CollapsibleTriggerPart
      className={cn(
        "group/collapsible-trigger flex h-9 w-full cursor-pointer items-center gap-3 rounded-[9px] px-2.5 text-left text-[13px] leading-none font-medium text-muted-foreground outline-none select-none",
        "[transition:color_calc(150ms*var(--kf-speed,1)),background-color_calc(150ms*var(--kf-speed,1)),scale_calc(220ms*var(--kf-speed,1))_var(--ease-pop)] motion-reduce:transition-none!",
        "not-data-disabled:hover:bg-foreground/[0.045] not-data-disabled:hover:text-foreground",
        "not-data-disabled:active:scale-[0.98] not-data-disabled:active:bg-foreground/[0.07]",
        "data-open:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-disabled:cursor-not-allowed data-disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {(state) => (
        <>
          <span className="min-w-0 flex-1 truncate">
            {typeof children === "function" ? children(state) : children}
          </span>
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 shrink-0 transition-[rotate] duration-[calc(480ms*var(--kf-speed,1))] ease-spring group-data-open/collapsible-trigger:rotate-180 motion-reduce:transition-none!"
          >
            <path d="m4 6 4 4 4-4" />
          </svg>
        </>
      )}
    </CollapsibleTriggerPart>
  )
}

/* Height and the cascade of the content come from the primitive: put rows straight inside. */
function CollapsiblePanel({ className, ...props }: React.ComponentProps<typeof CollapsiblePanelPart>) {
  return <CollapsiblePanelPart className={cn(className)} {...props} />
}

export { Collapsible, CollapsiblePanel, CollapsibleTrigger }
