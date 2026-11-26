"use client"

export * from "@/components/primitives/reasoning"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --reasoning-ink: Trigger text; default: text-muted-foreground.
   --reasoning-text: Thinking text; default: text-muted-foreground.
   --reasoning-font: Thinking size; default: text-[13px].
   --reasoning-rule: Rule beside the thinking; default: border-border.
   --reasoning-indent: Thinking indent; default: ps-3.5.
   --reasoning-max-height: Tallest the thinking gets before it scrolls; default: max-h-72.
*/

/* Styled reasoning: the animated primitive plus the Keyframery look. A quiet muted trigger that wakes
   on hover; the thinking hangs off a hairline in smaller muted text, rendered with Keyframery's
   markdown, and scrolls once it gets long. */

import * as React from "react"

import { Markdown } from "@/components/ui/markdown"
import {
  Reasoning as ReasoningRoot,
  ReasoningContent as ReasoningContentPrimitive,
  ReasoningContext,
  ReasoningLabel,
  ReasoningTrigger as ReasoningTriggerPrimitive,
  type ReasoningProps,
} from "@/components/primitives/reasoning"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Reasoning({ speed, className, ...props }: ReasoningProps & SpeedProps) {
  return (
    <Speed speed={speed}>
      <ReasoningRoot className={withClass("flex w-full min-w-0 flex-col", className)} {...props} />
    </Speed>
  )
}

function ReasoningTrigger({ className, ...props }: React.ComponentProps<typeof ReasoningTriggerPrimitive>) {
  return (
    <ReasoningTriggerPrimitive
      className={withClass(
        cn(
          "-mx-1.5 flex h-7 w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-[7px] px-1.5 text-start text-[13px] leading-none font-medium outline-none select-none",
          "text-[color:var(--reasoning-ink,var(--muted-foreground))] transition-[color,background-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
          "hover:text-foreground data-open:text-foreground in-data-streaming:text-foreground",
          "*:data-[slot=reasoning-chevron]:text-muted-foreground/70",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "*:data-[slot=reasoning-label]:truncate *:data-[slot=reasoning-label]:py-px",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Pass the thinking as a markdown string (it streams with the trigger's `streaming`), or your own content. */
function ReasoningContent({ className, children, ...props }: React.ComponentProps<typeof ReasoningContentPrimitive>) {
  const { streaming } = React.useContext(ReasoningContext)
  return (
    <ReasoningContentPrimitive
      className={withClass(
        cn(
          "ms-[3px] min-w-0 border-s border-[color:var(--reasoning-rule,var(--border))]",
          "*:data-[slot=reasoning-scroll]:mt-2 *:data-[slot=reasoning-scroll]:mb-1 *:data-[slot=reasoning-scroll]:max-h-[var(--reasoning-max-height,18rem)] *:data-[slot=reasoning-scroll]:overflow-y-auto *:data-[slot=reasoning-scroll]:overscroll-contain *:data-[slot=reasoning-scroll]:[scrollbar-width:thin]",
          "*:data-[slot=reasoning-scroll]:ps-[var(--reasoning-indent,0.875rem)] *:data-[slot=reasoning-scroll]:text-[length:var(--reasoning-font,13px)] *:data-[slot=reasoning-scroll]:leading-relaxed",
          "*:data-[slot=reasoning-scroll]:text-[color:var(--reasoning-text,var(--muted-foreground))]",
        ),
        className,
      )}
      {...props}
    >
      {typeof children === "string" ? (
        <Markdown
          streaming={streaming}
          caret={false}
          className="[--markdown-font:var(--reasoning-font,13px)] [--markdown-gap:0.5rem] [--markdown-ink:var(--reasoning-text,var(--muted-foreground))] [&_[data-slot=markdown-heading]]:text-[1em]! [&_[data-slot=markdown-strong]]:font-medium [&_[data-slot=markdown-strong]]:text-foreground/80"
        >
          {children}
        </Markdown>
      ) : (
        children
      )}
    </ReasoningContentPrimitive>
  )
}

export { Reasoning, ReasoningContent, ReasoningContext, ReasoningLabel, ReasoningTrigger }
export type { ReasoningProps } from "@/components/primitives/reasoning"
