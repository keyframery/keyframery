"use client"

export * from "@/components/primitives/collapsible"

/* Theming: set on a part or its ancestor; unset variables preserve the original theme.
   --collapsible-height: Trigger height (default: 2.25rem).
   --collapsible-gap: Label and chevron gap (default: 0.75rem).
   --collapsible-radius: Trigger corners (default: 9px).
   --collapsible-font: Trigger label size (default: 13px).
   --collapsible-face: Trigger surface (default: transparent; hover --foreground 4.5%; pressed --foreground 7%).
   --collapsible-muted: Resting trigger text (default: --muted-foreground).
   --collapsible-ink: Open and hovered trigger text (default: --foreground).
 */

/* Styled collapsible: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Collapsible as CollapsibleRoot,
  CollapsiblePanel as CollapsiblePanelPart,
  CollapsibleTrigger as CollapsibleTriggerPart,
} from "@/components/primitives/collapsible"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Collapsible({ speed, className, ...props }: React.ComponentProps<typeof CollapsibleRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <CollapsibleRoot className={withClass("flex w-full flex-col", className)} {...props} />
    </Speed>
  )
}

/* A quiet row: muted text that wakes up on hover, with a chevron that turns when the panel opens. */
function CollapsibleTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CollapsibleTriggerPart>) {
  return (
    <CollapsibleTriggerPart
      className={withClass(
        cn(
          "group/collapsible-trigger flex h-[var(--collapsible-height,2.25rem)] w-full cursor-pointer items-center gap-[var(--collapsible-gap,0.75rem)] rounded-[var(--collapsible-radius,9px)] bg-[var(--collapsible-face,transparent)] px-2.5 text-left text-[length:var(--collapsible-font,13px)] leading-none font-medium text-[color:var(--collapsible-muted,var(--muted-foreground))] outline-none select-none",
          "[transition:color_calc(150ms*var(--kf-speed,1)),background-color_calc(150ms*var(--kf-speed,1)),scale_calc(220ms*var(--kf-speed,1))_var(--ease-pop)] motion-reduce:transition-none!",
          "not-data-disabled:hover:bg-[var(--collapsible-face,color-mix(in_oklab,var(--foreground)_4.5%,transparent))] not-data-disabled:hover:text-[color:var(--collapsible-ink,var(--foreground))]",
          "not-data-disabled:active:scale-[0.98] not-data-disabled:active:bg-[color-mix(in_oklab,var(--collapsible-face,transparent),var(--foreground)_7%)]",
          "data-open:text-[color:var(--collapsible-ink,var(--foreground))]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "data-disabled:cursor-not-allowed data-disabled:opacity-40",
        ),
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
  return <CollapsiblePanelPart className={className} {...props} />
}

export { Collapsible, CollapsiblePanel, CollapsibleTrigger }

/* UI SDK's helpers for this component, passed through. */
export { createCollapsibleController } from "@/components/primitives/collapsible"
