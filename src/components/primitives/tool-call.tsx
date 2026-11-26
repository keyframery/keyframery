"use client"

/* Animated tool call, on UI SDK's core. UI SDK ships no tool call, so its parts are defined in
   `@/components/core/tool-call` with `definePrimitive` and rendered here; the body that opens is UI
   SDK's collapsible (through Keyframery's animated collapsible primitive), controlled by the tool
   call's own `open`, so the card is one component to an agent. This file adds motion only.
   Colours, radii and spacing stay yours (style `data-status`).

   Feedback (runs at any --kf-flourish):
   - Spinner: a running call's mark turns; a running title has a light passing through it.
   - Height: the body opens to its real height; the chevron turns.
   - Fade: a status label that changes fades in.
   Flourish (scaled by --kf-flourish, gone at 0):
   - Rise: the card rises in when it arrives.
   - Draw and Pop: the done tick pops in and draws itself; the failed and denied marks pop.
   - Direction: a new status label rises into place; the body's sections cascade in.
   - Press depth on the header. */

import type { StateOf } from "@ui-sdk/core"
import { type PartProps, usePart, usePrimitive, type PrimitiveHandle } from "@ui-sdk/react/primitive"
import * as React from "react"

import {
  Collapsible as CollapsibleRoot,
  CollapsiblePanel as CollapsiblePanelPart,
  CollapsibleTrigger as CollapsibleTriggerPart,
} from "@/components/primitives/collapsible"
import { statusLabels, toolCall, type ToolCallOptions } from "@/components/core/tool-call"
import { cn } from "@/lib/utils"

type ClassName<S> = string | ((state: S) => string | undefined) | undefined
function withClass<S>(base: string, className: ClassName<S>) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const keyframes = [
  "@keyframes kf-tool-call-in{from{opacity:0;translate:0 calc(8px*var(--kf-flourish,1));filter:blur(calc(4px*var(--kf-flourish,1)))}}",
  "@keyframes kf-tool-call-shimmer{from{background-position:100% 0}to{background-position:0% 0}}",
  "@keyframes kf-tool-call-tick{from{stroke-dashoffset:1}}",
  "@keyframes kf-tool-call-pop{from{scale:calc(1 - 0.6*var(--kf-flourish,1));opacity:0}}",
  "@keyframes kf-tool-call-label{from{opacity:0;translate:0 calc(6px*var(--kf-flourish,1));filter:blur(calc(3px*var(--kf-flourish,1)))}}",
].join("")

/* The instance, for the parts that hand changes back to it (the collapsible's open). */
const HandleContext = React.createContext<PrimitiveHandle<typeof toolCall> | null>(null)
/** The tool call around this part: its `state` and `api` (`setOpen`, `toggle`). */
function useToolCall() {
  const handle = React.use(HandleContext)
  if (!handle) throw new Error("Tool call parts must be inside <ToolCall>.")
  return handle
}

type RootProps = ToolCallOptions & Omit<PartProps<"div", StateOf<typeof toolCall, "root">>, "title">

/* The card rises in when it arrives. Its body is UI SDK's collapsible, controlled by the tool
   call's `open`: an agent's `setOpen` on the collapsible comes back here through `onOpenChange`. */
function ToolCall({
  name,
  title,
  status,
  input,
  output,
  error,
  duration,
  open,
  defaultOpen,
  onOpenChange,
  openOnError,
  className,
  children,
  ...props
}: RootProps) {
  const handle = usePrimitive(toolCall, { name, title, status, input, output, error, duration, open, defaultOpen, onOpenChange, openOnError })
  const root = usePart(
    handle,
    "root",
    {},
    {
      ...props,
      className: withClass(
        "group/tool-call animate-[kf-tool-call-in_calc(460ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] motion-reduce:animate-none",
        className,
      ),
      children: (state) => (
        <CollapsibleRoot
          open={state.open}
          onOpenChange={(next, details) => handle.api.setOpen(next, details.event, "trigger-press")}
          className="contents"
        >
          {typeof children === "function" ? children(state) : children}
        </CollapsibleRoot>
      ),
    },
    "div",
  )
  return (
    <HandleContext value={handle}>
      <style href="kf-tool-call" precedence="default">
        {keyframes}
      </style>
      {root}
    </HandleContext>
  )
}

/* The header: a button that opens the body, with a chevron after it that turns as it opens. */
function ToolCallTrigger({ className, children, ...props }: React.ComponentProps<typeof CollapsibleTriggerPart>) {
  return (
    <CollapsibleTriggerPart
      className={withClass(
        "group/tool-call-trigger transition-[scale,background-color,color] duration-[calc(220ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.01*var(--kf-flourish,1))] motion-reduce:transition-none!",
        className,
      )}
      {...props}
    >
      {(state) => (
        <>
          {typeof children === "function" ? children(state) : children}
          <span
            data-slot="tool-call-chevron"
            aria-hidden
            className="inline-grid shrink-0 place-items-center transition-[rotate] duration-[calc(420ms*var(--kf-speed,1))] ease-spring group-data-open/tool-call-trigger:rotate-180 motion-reduce:transition-none!"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
              <path d="m4 6 4 4 4-4" />
            </svg>
          </span>
        </>
      )}
    </CollapsibleTriggerPart>
  )
}

/* The body: opens to its real height, its sections rising in one after another. */
const ToolCallContent = CollapsiblePanelPart

/* The mark for each status, when the icon is given no children. All six are there; the card's
   `data-status` shows one. A mark that starts showing replays its animation, so the tick pops in
   and draws itself the moment the call finishes. */
const pop = "animate-[kf-tool-call-pop_calc(380ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)_backwards] motion-reduce:animate-none"

function StatusMarks() {
  return (
    <>
      <svg data-mark="pending" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2.2" className={"hidden group-data-[status=pending]/tool-call:block"}>
        <circle cx="8" cy="8" r="5.25" />
      </svg>
      <svg data-mark="running" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={cn("hidden group-data-[status=running]/tool-call:block", "animate-spin [animation-duration:calc(800ms*var(--kf-speed,1))] motion-reduce:[animation-duration:calc(2400ms*var(--kf-speed,1))]")}>
        <circle cx="8" cy="8" r="5.75" opacity="0.22" />
        <path d="M8 2.25A5.75 5.75 0 0 1 13.75 8" />
      </svg>
      <svg data-mark="approval" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={cn("hidden group-data-[status=approval]/tool-call:block", pop)}>
        <circle cx="8" cy="8" r="5.75" />
        <path d="M6.5 6v4M9.5 6v4" />
      </svg>
      <svg data-mark="error" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={cn("hidden group-data-[status=error]/tool-call:block", pop)}>
        <circle cx="8" cy="8" r="5.75" />
        <path d="M8 5v3.25M8 10.75v.01" />
      </svg>
      <svg data-mark="denied" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={cn("hidden group-data-[status=denied]/tool-call:block", pop)}>
        <circle cx="8" cy="8" r="5.75" />
        <path d="m4 4 8 8" />
      </svg>
      <svg data-mark="done" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("hidden group-data-[status=done]/tool-call:block", pop)}>
        <circle cx="8" cy="8" r="5.75" />
        <path
          d="M5.5 8.25 7.25 10l3.25-3.75"
          pathLength={1}
          className="[stroke-dasharray:1] animate-[kf-tool-call-tick_calc(320ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_calc(120ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards] motion-reduce:animate-none"
        />
      </svg>
    </>
  )
}

/* Decorative. With no children it shows the call's status; pass your own icon to name the tool. */
function ToolCallIcon({ children, ...props }: PartProps<"span", StateOf<typeof toolCall, "icon">>) {
  return usePart(toolCall, "icon", {}, { ...props, children: children ?? <StatusMarks /> }, "span")
}

/* The light runs across a running title. Its colour is the text's own, so it works on any theme. */
function ToolCallTitle({ className, ...props }: PartProps<"span", StateOf<typeof toolCall, "title">>) {
  return usePart(
    toolCall,
    "title",
    {},
    {
      ...props,
      className: withClass(
        cn(
          "group-data-[status=running]/tool-call:bg-[linear-gradient(90deg,currentColor_0%,currentColor_38%,color-mix(in_oklch,currentColor_30%,transparent)_50%,currentColor_62%,currentColor_100%)]",
          "group-data-[status=running]/tool-call:bg-[length:250%_100%] group-data-[status=running]/tool-call:bg-clip-text group-data-[status=running]/tool-call:[-webkit-text-fill-color:transparent]",
          "group-data-[status=running]/tool-call:animate-[kf-tool-call-shimmer_calc(1800ms*var(--kf-speed,1))_var(--ease-house)_infinite]",
          "motion-reduce:animate-none! motion-reduce:bg-none! motion-reduce:[-webkit-text-fill-color:currentColor]!",
        ),
        className,
      ),
    },
    "span",
  )
}

function ToolCallName(props: PartProps<"code", StateOf<typeof toolCall, "name">>) {
  return usePart(toolCall, "name", {}, props, "code")
}

/* The status in words. With no children it says the status ("Running", "Needs approval"); a new
   label rises into place. */
function ToolCallStatusText({ className, children, ...props }: PartProps<"span", StateOf<typeof toolCall, "status">>) {
  return usePart(
    toolCall,
    "status",
    {},
    {
      ...props,
      className: withClass("inline-grid", className),
      children: (state) => (
        <span
          key={state.status}
          className="col-start-1 row-start-1 animate-[kf-tool-call-label_calc(360ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none"
        >
          {typeof children === "function" ? children(state) : (children ?? statusLabels[state.status])}
        </span>
      ),
    },
    "span",
  )
}

function ToolCallDuration(props: PartProps<"span", StateOf<typeof toolCall, "duration">>) {
  return usePart(toolCall, "duration", {}, props, "span")
}

/* "Input", "Output" or "Error": a label and its value. */
function ToolCallSection({ kind, ...props }: PartProps<"div", StateOf<typeof toolCall, "section">> & { kind?: "input" | "output" | "error" }) {
  return usePart(toolCall, "section", { kind }, props, "div")
}

function ToolCallLabel(props: PartProps<"div", StateOf<typeof toolCall, "caption">>) {
  return usePart(toolCall, "caption", {}, props, "div")
}

export {
  ToolCall,
  ToolCallContent,
  ToolCallDuration,
  ToolCallIcon,
  ToolCallLabel,
  ToolCallName,
  ToolCallSection,
  ToolCallStatusText,
  ToolCallTitle,
  ToolCallTrigger,
  useToolCall,
}
export { formatDuration, serialize, statusLabels, summarize, type ToolCallStatus } from "@/components/core/tool-call"
