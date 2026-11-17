"use client"

/* Animated trace, on UI SDK's core. UI SDK ships no trace, so its lines are defined in
   `@/components/core/trace` with `definePrimitive` and rendered here; a line that expands is UI SDK's
   collapsible (through Keyframery's animated collapsible primitive). This file adds motion only.
   Colours, radii and spacing stay yours (style `data-status`).

   - Cascade: lines rise in one after another as they arrive.
   - Shimmer: a running line's title has a light passing through it; it stops for reduced motion.
   - Draw and Pop: with no icon given, the mark follows the status: a spinner while running, and a
     tick that pops in and draws itself when the step is done.
   - Height and Cascade: a row opens to its real height and its detail rises in; the chevron turns
     on a spring. */

import { createParts } from "@ui-sdk/react/primitive"
import * as React from "react"

import {
  Collapsible as CollapsibleRoot,
  CollapsiblePanel as CollapsiblePanelPart,
  CollapsibleTrigger as CollapsibleTriggerPart,
} from "@/components/primitives/collapsible"
import { trace } from "@/components/core/trace"
import { cn } from "@/lib/utils"

const parts = createParts(trace, { root: "div", line: "span", icon: "span", title: "span", description: "span" })

type ClassName<S> = string | ((state: S) => string | undefined) | undefined
function withClass<S>(base: string, className: ClassName<S>) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const keyframes = [
  "@keyframes kf-trace-row{from{opacity:0;translate:0 8px;filter:blur(4px)}}",
  "@keyframes kf-trace-shimmer{from{background-position:100% 0}to{background-position:0% 0}}",
  "@keyframes kf-trace-tick{from{stroke-dashoffset:1}}",
  "@keyframes kf-trace-pop{from{scale:0.4;opacity:0}}",
].join("")

/* Each direct child (a line, a link, a row that expands) rises in a beat after the one above it. */
function Trace({ className, ...props }: React.ComponentProps<typeof parts.Root>) {
  return (
    <>
      <style href="kf-trace" precedence="default">
        {keyframes}
      </style>
      <parts.Root
        className={withClass(
          cn(
            "*:animate-[kf-trace-row_calc(460ms*var(--kf-speed,1))_var(--ease-spring)_backwards]",
            "*:[animation-delay:calc((min(sibling-index(),10)-1)*calc(55ms*var(--kf-speed,1)))]",
            "motion-reduce:*:animate-none!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

function TraceLine({ className, ...props }: React.ComponentProps<typeof parts.Line>) {
  return <parts.Line className={withClass("group/trace-line", className)} {...props} />
}

/* The light runs across the text of a running title. Its colour is the text's own, so it works on
   any theme. */
function TraceTitle({ className, ...props }: React.ComponentProps<typeof parts.Title>) {
  return (
    <parts.Title
      className={withClass(
        cn(
          "group-data-[status=running]/trace-line:bg-[linear-gradient(90deg,currentColor_0%,currentColor_38%,color-mix(in_oklch,currentColor_25%,transparent)_50%,currentColor_62%,currentColor_100%)]",
          "group-data-[status=running]/trace-line:bg-[length:250%_100%] group-data-[status=running]/trace-line:bg-clip-text group-data-[status=running]/trace-line:[-webkit-text-fill-color:transparent]",
          "group-data-[status=running]/trace-line:animate-[kf-trace-shimmer_calc(1800ms*var(--kf-speed,1))_var(--ease-house)_infinite]",
          "motion-reduce:animate-none! motion-reduce:bg-none! motion-reduce:[-webkit-text-fill-color:currentColor]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

const TraceDescription = parts.Description

/* The mark for each status, when the icon is given no children. All four are there; the line's
   `data-status` shows one. A mark that starts showing replays its animation, so the tick pops in and
   draws itself the moment a step finishes. */
const pop = "animate-[kf-trace-pop_calc(380ms*var(--kf-speed,1))_var(--ease-pop)_backwards] motion-reduce:animate-none"

function StatusMarks() {
  return (
    <>
      <svg data-mark="running" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="hidden animate-spin [animation-duration:calc(800ms*var(--kf-speed,1))] group-data-[status=running]/trace-line:block motion-reduce:[animation-duration:calc(2400ms*var(--kf-speed,1))]">
        <circle cx="8" cy="8" r="5.75" opacity="0.25" />
        <path d="M8 2.25A5.75 5.75 0 0 1 13.75 8" />
      </svg>
      <svg data-mark="pending" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2.2" className="hidden group-data-[status=pending]/trace-line:block">
        <circle cx="8" cy="8" r="5.25" />
      </svg>
      <svg data-mark="error" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={cn("hidden group-data-[status=error]/trace-line:block", pop)}>
        <circle cx="8" cy="8" r="5.75" />
        <path d="M8 5v3.25M8 10.75v.01" />
      </svg>
      <svg data-mark="done" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cn("hidden group-data-done/trace-line:block", pop)}>
        <circle cx="8" cy="8" r="5.75" />
        <path
          d="M5.5 8.25 7.25 10l3.25-3.75"
          pathLength={1}
          className="[stroke-dasharray:1] animate-[kf-trace-tick_calc(320ms*var(--kf-speed,1))_var(--ease-house)_calc(120ms*var(--kf-speed,1))_backwards] motion-reduce:animate-none"
        />
      </svg>
    </>
  )
}

/* Decorative. With no children it shows its line's status; pass your own icon to name the action. */
function TraceIcon({ children, ...props }: React.ComponentProps<typeof parts.Icon>) {
  return <parts.Icon {...props}>{children ?? <StatusMarks />}</parts.Icon>
}

/* A row that expands: UI SDK's collapsible. */
const TraceCollapsible = CollapsibleRoot

/* The button around a line. It adds a chevron after the line that turns down on a spring as the row opens. */
function TraceCollapsibleTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CollapsibleTriggerPart>) {
  return (
    <CollapsibleTriggerPart
      className={withClass("group/trace-trigger transition-[scale] duration-[calc(220ms*var(--kf-speed,1))] ease-pop active:scale-[0.98] motion-reduce:transition-none!", className)}
      {...props}
    >
      {(state) => (
        <>
          {typeof children === "function" ? children(state) : children}
          <span
            data-slot="trace-chevron"
            aria-hidden
            className="inline-grid shrink-0 place-items-center transition-[rotate] duration-[calc(460ms*var(--kf-speed,1))] ease-spring group-data-open/trace-trigger:rotate-90 rtl:-scale-x-100 motion-reduce:transition-none!"
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

/* The detail: opens to its real height, and its children rise in one after another (from the
   collapsible primitive). */
const TraceCollapsibleContent = CollapsiblePanelPart

export {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
}
export type { TraceStatus } from "@/components/core/trace"
