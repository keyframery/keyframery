"use client"

/* Animated reasoning, on UI SDK's core. UI SDK ships none, so its timing is defined in
   `@/components/core/reasoning` with `definePrimitive` and rendered here; opening and closing is UI
   SDK's collapsible (through Keyframery's animated collapsible primitive), and the thinking itself is
   Keyframery's streaming markdown. This file adds motion only. Colours, type and spacing stay yours
   (style `data-streaming` and the `data-slot` of each part).

   - Shimmer: while it thinks, a light passes through "Thinking…"; it stops for reduced motion.
   - Height and Cascade: the thinking opens to its real height on its own when streaming starts and
     closes when it ends (unless the reader toggled it); the chevron turns on a spring.
   - Follow: while it streams, the thinking keeps its newest line in view.
   The shimmer says "working" and always runs; the cascade and the press depth scale with
   --kf-flourish, and the height always animates. */

import { createParts } from "@ui-sdk/react/primitive"
import * as React from "react"

import {
  Collapsible as CollapsibleRoot,
  CollapsiblePanel as CollapsiblePanelPart,
  CollapsibleTrigger as CollapsibleTriggerPart,
} from "@/components/primitives/collapsible"
import { Markdown } from "@/components/primitives/markdown"
import { reasoning } from "@/components/core/reasoning"
import { cn } from "@/lib/utils"

const parts = createParts(reasoning, { root: "div", label: "span" })

type ClassName<S> = string | ((state: S) => string | undefined) | undefined
function withClass<S>(base: string, className: ClassName<S>) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const keyframes = "@keyframes kf-reasoning-shimmer{from{background-position:100% 0}to{background-position:0% 0}}"

const ReasoningContext = React.createContext<{ streaming: boolean }>({ streaming: false })

type CollapsibleProps = React.ComponentProps<typeof CollapsibleRoot>
type OpenChangeDetails = Parameters<NonNullable<CollapsibleProps["onOpenChange"]>>[1]

type ReasoningProps = Omit<React.ComponentProps<typeof parts.Root>, "children"> & {
  /** True while the model is still thinking: the trigger shimmers and the thinking shows. */
  streaming?: boolean
  /** How long it thought, in seconds. Without it, the time between `streaming` turning on and off. */
  duration?: number
  /** Close on its own when the thinking ends, unless the reader toggled it. Default true. */
  autoClose?: boolean
  /** Open at first, when not streaming. */
  defaultOpen?: boolean
  /** Controlled open state. Streaming starting and ending still asks for a change through `onOpenChange`. */
  open?: boolean
  /** Called with the new open state, from the reader or from streaming starting and ending (no details then). */
  onOpenChange?: (open: boolean, details?: OpenChangeDetails) => void
  children?: React.ReactNode
}

/* Opens on its own while streaming, closes when it ends; a reader's toggle wins until the next stream. */
function Reasoning({
  streaming = false,
  duration,
  autoClose = true,
  defaultOpen = false,
  open: controlled,
  onOpenChange,
  className,
  children,
  ...props
}: ReasoningProps) {
  const [auto, setAuto] = React.useState(streaming || defaultOpen)
  const [chosen, setChosen] = React.useState<boolean | undefined>(undefined)
  const [was, setWas] = React.useState(streaming)
  if (was !== streaming) {
    setWas(streaming)
    if (streaming) {
      setChosen(undefined)
      setAuto(true)
    } else if (autoClose && chosen === undefined) setAuto(false)
  }

  /* A controlled owner hears about the automatic changes too. */
  const report = React.useRef(onOpenChange)
  report.current = onOpenChange
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    report.current?.(auto)
  }, [auto])

  const open = controlled ?? chosen ?? auto
  const context = React.useMemo(() => ({ streaming }), [streaming])

  return (
    <ReasoningContext value={context}>
      <style href="kf-reasoning" precedence="default">
        {keyframes}
      </style>
      <parts.Root streaming={streaming} duration={duration} className={className} {...props}>
        <CollapsibleRoot
          open={open}
          onOpenChange={(next, details) => {
            setChosen(next)
            onOpenChange?.(next, details)
          }}
        >
          {children}
        </CollapsibleRoot>
      </parts.Root>
    </ReasoningContext>
  )
}

/* "Thinking…" with a light passing through it while it streams, "Thought for 12s" after. */
function ReasoningLabel({
  thinkingLabel = "Thinking…",
  doneLabel = (seconds) => (seconds === undefined ? "Thought for a few seconds" : `Thought for ${seconds}s`),
  className,
  ...props
}: Omit<React.ComponentProps<typeof parts.Label>, "children"> & {
  thinkingLabel?: React.ReactNode
  doneLabel?: (seconds: number | undefined) => React.ReactNode
}) {
  return (
    <parts.Label
      className={withClass(
        cn(
          "data-streaming:bg-[linear-gradient(90deg,currentColor_0%,currentColor_38%,color-mix(in_oklch,currentColor_25%,transparent)_50%,currentColor_62%,currentColor_100%)]",
          "data-streaming:bg-[length:250%_100%] data-streaming:bg-clip-text data-streaming:[-webkit-text-fill-color:transparent]",
          "data-streaming:animate-[kf-reasoning-shimmer_calc(1800ms*var(--kf-speed,1))_var(--ease-house)_infinite]",
          "motion-reduce:animate-none! motion-reduce:bg-none! motion-reduce:[-webkit-text-fill-color:currentColor]!",
        ),
        className,
      )}
      {...props}
    >
      {(state) => (state.streaming ? thinkingLabel : doneLabel(state.seconds))}
    </parts.Label>
  )
}

/* The button. With no children it shows the label, then a chevron that turns down as it opens. */
function ReasoningTrigger({
  className,
  children,
  thinkingLabel,
  doneLabel,
  ...props
}: React.ComponentProps<typeof CollapsibleTriggerPart> & Pick<React.ComponentProps<typeof ReasoningLabel>, "thinkingLabel" | "doneLabel">) {
  return (
    <CollapsibleTriggerPart
      className={withClass(
        "group/reasoning-trigger transition-[scale] duration-[calc(220ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.02*var(--kf-flourish,1))] motion-reduce:transition-none!",
        className,
      )}
      {...props}
    >
      {(state) => (
        <>
          {children === undefined ? (
            <ReasoningLabel thinkingLabel={thinkingLabel} doneLabel={doneLabel} />
          ) : typeof children === "function" ? (
            children(state)
          ) : (
            children
          )}
          <span
            data-slot="reasoning-chevron"
            aria-hidden
            className="inline-grid shrink-0 place-items-center transition-[rotate] duration-[calc(460ms*var(--kf-speed,1))] ease-spring group-data-open/reasoning-trigger:rotate-90 rtl:-scale-x-100 motion-reduce:transition-none!"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <path d="m6 4 4 4-4 4" />
            </svg>
          </span>
        </>
      )}
    </CollapsibleTriggerPart>
  )
}

/* The thinking: opens to its real height and its content rises in (from the collapsible primitive).
   A string is rendered as streaming markdown; while it streams, the newest line stays in view. */
function ReasoningContent({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CollapsiblePanelPart>, "children"> & { children?: React.ReactNode }) {
  const { streaming } = React.useContext(ReasoningContext)
  const scroller = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    const el = scroller.current
    if (el && streaming) el.scrollTop = el.scrollHeight
  })
  return (
    <CollapsiblePanelPart className={className} {...props}>
      <div ref={scroller} data-slot="reasoning-scroll">
        {typeof children === "string" ? <Markdown streaming={streaming} caret={false}>{children}</Markdown> : children}
      </div>
    </CollapsiblePanelPart>
  )
}

export { Reasoning, ReasoningContent, ReasoningContext, ReasoningLabel, ReasoningTrigger }
export type { ReasoningProps }
