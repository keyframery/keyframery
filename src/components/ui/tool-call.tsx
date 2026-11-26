"use client"

export * from "@/components/primitives/tool-call"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --tool-call-face: Card surface; default: bg-card.
   --tool-call-ink: Title text; default: text-foreground.
   --tool-call-muted: Name, time and labels; default: text-muted-foreground.
   --tool-call-success: Done tick; default: payoff green oklch(0.62 0.16 150).
   --tool-call-error: Failed call; default: text-destructive.
   --tool-call-radius: Card corners; default: rounded-[12px].
   --tool-call-font: Title size; default: text-[13px].
   --tool-call-code-height: Tallest input or output before it scrolls; default: max-h-[220px].
*/

/* Styled tool call: the animated primitive plus the Keyframery look. A quiet card on the card
   surface. The header reads like a line of a trace: the status mark, the title, the tool's name in
   a small mono chip, and the time it took on the right. The body holds the input and the output
   as small JSON code blocks; a failure shows its error in a destructive tint and opens on its own. */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block"
import {
  ToolCall as ToolCallRoot,
  ToolCallContent as ToolCallContentPrimitive,
  ToolCallDuration as ToolCallDurationPrimitive,
  ToolCallIcon as ToolCallIconPrimitive,
  ToolCallLabel as ToolCallLabelPrimitive,
  ToolCallName as ToolCallNamePrimitive,
  ToolCallSection as ToolCallSectionPrimitive,
  ToolCallStatusText as ToolCallStatusTextPrimitive,
  ToolCallTitle as ToolCallTitlePrimitive,
  ToolCallTrigger as ToolCallTriggerPrimitive,
  formatDuration,
  serialize,
  type ToolCallStatus,
} from "@/components/primitives/tool-call"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* The time since `from`, ticking while `live`. A clock, not an animation. */
function useElapsed(from: number | undefined, live: boolean) {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    if (!live || from === undefined) return
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(timer)
  }, [from, live])
  return from === undefined ? undefined : Math.max(0, now - from)
}

type ToolCallProps = React.ComponentProps<typeof ToolCallRoot> &
  SpeedProps & {
    /** When the call started (epoch ms): a running call shows the time since. */
    startedAt?: number
  }

/* With no children it renders the whole card from its props; pass parts to compose your own. */
function ToolCall({ speed, className, children, startedAt, ...props }: ToolCallProps) {
  return (
    <Speed speed={speed}>
      <ToolCallRoot
        className={withClass(
          cn(
            "@container w-full min-w-0 overflow-hidden rounded-[var(--tool-call-radius,12px)] bg-[var(--tool-call-face,var(--card))] text-[length:var(--tool-call-font,13px)] text-card-foreground",
            "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
            "has-[[data-slot=collapsible-trigger]:focus-visible]:ring-2 has-[[data-slot=collapsible-trigger]:focus-visible]:ring-ring has-[[data-slot=collapsible-trigger]:focus-visible]:ring-offset-2 has-[[data-slot=collapsible-trigger]:focus-visible]:ring-offset-background",
          ),
          className,
        )}
        {...props}
      >
        {children ?? <ToolCallCard {...props} startedAt={startedAt} />}
      </ToolCallRoot>
    </Speed>
  )
}

/* The card the props describe: header, then input and output (or the error). */
function ToolCallCard({
  name,
  title,
  status = "done",
  input,
  output,
  error,
  duration,
  startedAt,
}: Pick<ToolCallProps, "name" | "title" | "status" | "input" | "output" | "error" | "duration" | "startedAt">) {
  const elapsed = useElapsed(startedAt, status === "running")
  const time = status === "running" ? formatDuration(elapsed) : formatDuration(duration)
  const hasOutput = output !== undefined && output !== null && output !== ""
  return (
    <>
      <ToolCallTrigger>
        <ToolCallIcon />
        <ToolCallTitle>{title || name}</ToolCallTitle>
        {title && name && <ToolCallName>{name}</ToolCallName>}
        <span className="ms-auto flex shrink-0 items-center gap-2 ps-1">
          {status === "approval" ? (
            <Badge variant="outline"><ToolCallStatusText /></Badge>
          ) : (
            status !== "done" && status !== "running" && <ToolCallStatusText />
          )}
          {status === "running" && <span className="sr-only"><ToolCallStatusText /></span>}
          {time && (status === "done" || status === "running") && <ToolCallDuration>{time}</ToolCallDuration>}
        </span>
      </ToolCallTrigger>
      <ToolCallContent>
        {input !== undefined && (
          <ToolCallSection kind="input">
            <ToolCallLabel>Input</ToolCallLabel>
            <ToolCallValue value={input} />
          </ToolCallSection>
        )}
        {status === "error" && error ? (
          <ToolCallSection kind="error">
            <ToolCallLabel>Error</ToolCallLabel>
            <ToolCallError>{error}</ToolCallError>
          </ToolCallSection>
        ) : hasOutput ? (
          <ToolCallSection kind="output">
            <ToolCallLabel>Output</ToolCallLabel>
            <ToolCallValue value={output} />
          </ToolCallSection>
        ) : status === "running" || status === "pending" || status === "approval" ? (
          <ToolCallSection kind="output">
            <ToolCallLabel>Output</ToolCallLabel>
            <p className="text-[12.5px] text-[color:var(--tool-call-muted,var(--muted-foreground))]">
              {status === "approval" ? "Waits for your approval." : status === "pending" ? "Not started yet." : "Waiting for the tool…"}
            </p>
          </ToolCallSection>
        ) : null}
      </ToolCallContent>
    </>
  )
}

/* The header row: a full-width button with the chevron at the end. */
function ToolCallTrigger({ className, ...props }: React.ComponentProps<typeof ToolCallTriggerPrimitive>) {
  return (
    <ToolCallTriggerPrimitive
      className={withClass(
        cn(
          "flex h-11 w-full min-w-0 cursor-pointer items-center gap-2.5 ps-3 pe-3 text-start outline-none select-none",
          "hover:bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)] active:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)]",
          "*:data-[slot=tool-call-chevron]:text-[color:var(--tool-call-muted,var(--muted-foreground))]",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* 16px. Done takes the payoff green, a failure the destructive colour. */
function ToolCallIcon({ className, ...props }: React.ComponentProps<typeof ToolCallIconPrimitive>) {
  return (
    <ToolCallIconPrimitive
      className={withClass(
        cn(
          "grid size-4 shrink-0 place-items-center text-[color:var(--tool-call-ink,var(--foreground))] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
          "[&_[data-mark=done]]:text-[color:var(--tool-call-success,oklch(0.62_0.16_150))]",
          "[&_[data-mark=error]]:text-[color:var(--tool-call-error,var(--destructive))]",
          "[&_[data-mark=denied]]:text-[color:var(--tool-call-muted,var(--muted-foreground))] [&_[data-mark=pending]]:text-[color:var(--tool-call-muted,var(--muted-foreground))]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ToolCallTitle({ className, ...props }: React.ComponentProps<typeof ToolCallTitlePrimitive>) {
  return (
    <ToolCallTitlePrimitive
      className={withClass(
        cn(
          "min-w-0 truncate leading-[1.35] font-medium text-[color:var(--tool-call-ink,var(--foreground))]",
          "group-data-[status=pending]/tool-call:text-[color:var(--tool-call-muted,var(--muted-foreground))] group-data-[status=denied]/tool-call:text-[color:var(--tool-call-muted,var(--muted-foreground))]",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The tool's own name, in a small mono chip. It gives way first when the row is narrow. */
function ToolCallName({ className, ...props }: React.ComponentProps<typeof ToolCallNamePrimitive>) {
  return (
    <ToolCallNamePrimitive
      className={withClass(
        "min-w-0 shrink-[2] truncate rounded-[5px] @max-[24rem]:hidden bg-[color-mix(in_oklab,var(--muted)_80%,transparent)] px-1.5 py-[3px] font-mono text-[11px] leading-none text-[color:var(--tool-call-muted,var(--muted-foreground))]",
        className,
      )}
      {...props}
    />
  )
}

/* The status in words; red when it failed. In the card it sits in an outline badge while it waits for a person. */
function ToolCallStatusText({ className, ...props }: React.ComponentProps<typeof ToolCallStatusTextPrimitive>) {
  return (
    <ToolCallStatusTextPrimitive
      className={withClass(
        cn(
          "text-[12px] leading-none font-medium whitespace-nowrap text-[color:var(--tool-call-muted,var(--muted-foreground))]",
          "data-[status=error]:text-[color:var(--tool-call-error,var(--destructive))]",
          "in-data-[slot=badge]:text-[length:inherit] in-data-[slot=badge]:text-[color:inherit]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ToolCallDuration({ className, ...props }: React.ComponentProps<typeof ToolCallDurationPrimitive>) {
  return (
    <ToolCallDurationPrimitive
      className={withClass("text-[12px] leading-none whitespace-nowrap text-[color:var(--tool-call-muted,var(--muted-foreground))] tabular-nums", className)}
      {...props}
    />
  )
}

/* The body sits under a hairline; its sections rise in one after another as it opens. */
function ToolCallContent({ className, ...props }: React.ComponentProps<typeof ToolCallContentPrimitive>) {
  return (
    <ToolCallContentPrimitive
      className={withClass(
        cn(
          "min-w-0 shadow-[inset_0_1px_0_rgb(0_0_0/0.06)] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.07)]",
          "flex flex-col gap-3 *:first:mt-3 *:last:mb-3",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ToolCallSection({ className, ...props }: React.ComponentProps<typeof ToolCallSectionPrimitive>) {
  return <ToolCallSectionPrimitive className={withClass("flex min-w-0 flex-col gap-1.5 px-3", className)} {...props} />
}

function ToolCallLabel({ className, ...props }: React.ComponentProps<typeof ToolCallLabelPrimitive>) {
  return (
    <ToolCallLabelPrimitive
      className={withClass("text-[11.5px] leading-none font-medium text-[color:var(--tool-call-muted,var(--muted-foreground))]", className)}
      {...props}
    />
  )
}

/* A value as a small code block: objects as pretty JSON, strings as they are. */
function ToolCallValue({ value, className }: { value: unknown; className?: string }) {
  const code = serialize(value)
  return (
    <CodeBlock code={code} language={typeof value === "string" ? "text" : "json"} wrap size="sm" className={cn("shadow-[0_0_0_1px_rgb(0_0_0/0.06)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]", className)}>
      <CodeBlockContent className="max-h-[var(--tool-call-code-height,220px)]" />
    </CodeBlock>
  )
}

function ToolCallError({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="tool-call-error"
      className={cn(
        "rounded-[10px] px-3 py-2 text-[12.5px] leading-relaxed text-[color:var(--tool-call-error,var(--destructive))]",
        "bg-[color-mix(in_oklab,var(--tool-call-error,var(--destructive))_7%,transparent)] dark:bg-[color-mix(in_oklab,var(--tool-call-error,var(--destructive))_12%,transparent)]",
        className,
      )}
      {...props}
    />
  )
}

export {
  ToolCall,
  ToolCallContent,
  ToolCallDuration,
  ToolCallError,
  ToolCallTrigger,
  ToolCallIcon,
  ToolCallLabel,
  ToolCallName,
  ToolCallSection,
  ToolCallStatusText,
  ToolCallTitle,
  ToolCallValue,
}
export type { ToolCallStatus }
