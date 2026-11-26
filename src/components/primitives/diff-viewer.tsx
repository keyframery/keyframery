"use client"

/* Animated diff viewer, on UI SDK's core. UI SDK ships no diff viewer, so the behaviour is defined in
   `@/components/core/diff-viewer` with `definePrimitive` and rendered here. This file adds motion only.
   Colours, radii, shadows and spacing stay yours (style `data-kind`, `data-changed`, `data-decision`,
   `data-view` and the `data-slot` names).

   Feedback (at every flourish):
   - Direction: switching unified and split, the new layout fades in from the side of its button,
     a few pixels, and the switch's key slides across.
   - Height: an opened fold grows from the fold row's height to its lines, which fade in.
   - A rejected hunk dims; the decision label rises in where the buttons were.
   Flourish (scaled by --kf-flourish; at 0 it is simply there):
   - Cascade: on mount, hunks rise in one after another with a little blur.
   - Roll: the +added and −removed counts roll up to their values.
   - Press depth on the buttons, the extra slide and blur of the view switch, the copy tick's draw. */

import type { StateOf } from "@ui-sdk/core"
import { createParts, type PartProps, usePart } from "@ui-sdk/react/primitive"
import * as React from "react"

import type { CodeBlockLanguage } from "@/components/core/code-block"
import { type DiffBlock, type DiffLine, type DiffView, diffViewer, segmentsOf, splitRows, type SplitRow } from "@/components/core/diff-viewer"
import { cn } from "@/lib/utils"

const parts = createParts(diffViewer, { root: "div", header: "div", title: "div", actions: "div" })

type ClassName<S> = string | ((state: S) => string | undefined) | undefined
/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: ClassName<S>) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const keyframes = [
  "@keyframes kf-diff-in{from{opacity:0;translate:0 calc(10px*var(--kf-flourish,1));filter:blur(calc(4px*var(--kf-flourish,1)))}}",
  "@keyframes kf-diff-view{from{opacity:0;translate:var(--diff-from,0) 0;filter:blur(calc(3px*var(--kf-flourish,1)))}}",
  "@keyframes kf-diff-tick{from{stroke-dashoffset:1}}",
].join("")

/* Hunks (and the row above each) rise in on mount, a beat apart. Not again after a view switch:
   then the whole body arrives by the switch. */
const cascade = cn(
  "animate-[kf-diff-in_calc(480ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_both]",
  "[animation-delay:calc(var(--diff-hunk-index,0)*calc(70ms*var(--kf-speed,1))*var(--kf-flourish,1)+calc(80ms*var(--kf-speed,1))*var(--kf-flourish,1))]",
  "group-data-switched/diff-viewer:animate-none motion-reduce:animate-none!",
)

function DiffViewer({ className, ...props }: React.ComponentProps<typeof parts.Root>) {
  return (
    <>
      <style href="kf-diff-viewer" precedence="default">
        {keyframes}
      </style>
      <parts.Root className={withClass("group/diff-viewer relative", className)} {...props} />
    </>
  )
}

const DiffViewerHeader = parts.Header
const DiffViewerTitle = parts.Title
const DiffViewerActions = parts.Actions

/* ---------- Counts ---------- */

/* Each digit is a column of 0 to 9; the count rolls up to its value on mount and when it changes. */
function Roll({ value }: { value: number }) {
  return (
    <span aria-hidden className="inline-flex h-[1em] overflow-hidden leading-none tabular-nums">
      {String(value)
        .split("")
        .map((c, i, all) => (
          <span
            key={all.length - i}
            style={{ "--d": Number(c) } as React.CSSProperties}
            className={cn(
              "flex flex-col [translate:0_calc(var(--d)*-1em)] starting:[translate:0_0]",
              "transition-[translate] duration-[calc(720ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring",
              "delay-[calc((180ms+var(--diff-roll-i,0)*40ms)*var(--kf-speed,1)*var(--kf-flourish,1))] motion-reduce:transition-none",
            )}
          >
            {Array.from({ length: 10 }, (_, d) => (
              <span key={d} className="h-[1em]">
                {d}
              </span>
            ))}
          </span>
        ))}
    </span>
  )
}

function DiffViewerStats({ className, children, ...props }: PartProps<"div", StateOf<typeof diffViewer, "stats">>) {
  return usePart(
    diffViewer,
    "stats",
    {},
    {
      ...props,
      className: withClass("inline-flex items-center", className),
      children:
        children ??
        ((state) => (
          <>
            <span data-slot="diff-viewer-additions" className="inline-flex items-center">
              +<Roll value={state.additions} />
            </span>
            <span data-slot="diff-viewer-deletions" className="inline-flex items-center [--diff-roll-i:1]">
              −<Roll value={state.deletions} />
            </span>
          </>
        )),
    },
    "div",
  )
}

/* ---------- View switch ---------- */

/* The key slides between the two halves. Its surface follows the text colour; restyle it with before:. */
function DiffViewerViewSwitch({ className, children, ...props }: PartProps<"div", StateOf<typeof diffViewer, "view-switch">>) {
  return usePart(
    diffViewer,
    "view-switch",
    {},
    {
      ...props,
      className: withClass(
        cn(
          "relative isolate grid grid-cols-2",
          "before:pointer-events-none before:absolute before:inset-y-0 before:start-0 before:-z-10 before:w-1/2 before:content-['']",
          "before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
          "before:transition-[translate] before:duration-[calc(320ms*var(--kf-speed,1))] before:ease-spring motion-reduce:before:transition-none",
          "data-[view=split]:before:translate-x-full rtl:data-[view=split]:before:-translate-x-full",
        ),
        className,
      ),
      children:
        children ??
        (() => (
          <>
            <DiffViewerViewOption value="unified" />
            <DiffViewerViewOption value="split" />
          </>
        )),
    },
    "div",
  )
}

function DiffViewerViewOption({
  value,
  className,
  children,
  ...props
}: { value: DiffView } & Omit<PartProps<"button", StateOf<typeof diffViewer, "view-option">>, "value">) {
  return usePart(
    diffViewer,
    "view-option",
    { value },
    {
      ...props,
      className: withClass(
        "transition-[color,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.05*var(--kf-flourish,1))] motion-reduce:transition-none",
        className,
      ),
      children: children ?? (value === "split" ? "Split" : "Unified"),
    },
    "button",
  )
}

/* ---------- Copy ---------- */

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <rect x="5.25" y="5.25" width="8" height="8" rx="2" />
      <path d="M10.75 5.25V4.5a1.75 1.75 0 0 0-1.75-1.75H4.5A1.75 1.75 0 0 0 2.75 4.5V9c0 .97.78 1.75 1.75 1.75h.75" />
    </svg>
  )
}

const swapIn = "transition-[opacity,scale,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-pop motion-reduce:transition-none!"
const swapOut = "transition-[opacity,scale,filter] duration-[calc(160ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!"

function DiffViewerCopyButton({ className, children, ...props }: PartProps<"button", StateOf<typeof diffViewer, "copy">>) {
  return usePart(
    diffViewer,
    "copy",
    {},
    {
      ...props,
      className: withClass(
        "relative transition-[scale] duration-[calc(260ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.08*var(--kf-flourish,1))] active:duration-[calc(90ms*var(--kf-speed,1))] motion-reduce:transition-none!",
        className,
      ),
      children:
        children ??
        ((state) => (
          <span className="grid place-items-center *:[grid-area:1/1]">
            <CopyIcon className={cn("size-4", state.copied ? cn(swapOut, "scale-[calc(1-0.5*var(--kf-flourish,1))] opacity-0 blur-[calc(3px*var(--kf-flourish,1))]") : swapIn)} />
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className={cn("size-4", state.copied ? swapIn : cn(swapOut, "scale-[calc(1-0.4*var(--kf-flourish,1))] opacity-0"))}
            >
              {state.copied && (
                <path
                  d="M3.5 8.5 6.5 11.5 12.5 4.75"
                  pathLength={1}
                  className="[stroke-dasharray:1] animate-[kf-diff-tick_calc(300ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_calc(80ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards] motion-reduce:animate-none"
                />
              )}
            </svg>
          </span>
        )),
    },
    "button",
  )
}

/* ---------- Lines ---------- */

const signs = { added: "+", removed: "−", context: " " } as const
const spoken = { added: "Added: ", removed: "Removed: ", context: "" } as const

/* A line's text, cut into coloured tokens; changed words carry `data-changed`. */
const LineText = React.memo(function LineText({ line, language, words }: { line: DiffLine; language: CodeBlockLanguage; words: boolean }) {
  const segments = segmentsOf(line, language, words)
  return (
    <span data-slot="diff-viewer-line-content">
      {spoken[line.kind] && <span className="sr-only">{spoken[line.kind]}</span>}
      {segments.length === 0 || (segments.length === 1 && segments[0].text === "")
        ? "​"
        : segments.map((segment, i) => (
            <span key={i} data-token={segment.kind} data-changed={segment.changed ? "" : undefined}>
              {segment.text}
            </span>
          ))}
    </span>
  )
})

const firstPaint = 240

type LinesProps = { lines: DiffLine[]; view: DiffView; language: CodeBlockLanguage; words: boolean }

/* The rows of one hunk or fold, in either view. Memoised: they re-render only when their lines,
   the view, the language or word marking change. */
const DiffViewerLines = React.memo(function DiffViewerLines({ lines: all, view, language, words }: LinesProps) {
  /* A very long run (a rewritten file) paints its first rows at once and the rest in a transition,
     which React renders in slices, so the page never stops answering. */
  const [ready, setReady] = React.useState<DiffLine[] | null>(all.length > firstPaint ? null : all)
  React.useEffect(() => {
    if (ready !== all) React.startTransition(() => setReady(all))
  }, [all, ready])
  const lines = ready === all ? all : all.slice(0, firstPaint)
  const rows: React.ReactNode[] =
    view === "split"
      ? splitOf(lines).map((row, i) => <SplitLine key={i} row={row} language={language} words={words} />)
      : lines.map((line, i) => <UnifiedLine key={i} line={line} language={language} words={words} />)
  if (rows.length <= chunk * 2) return rows
  /* Long runs go in chunks the browser skips styling and laying out while they are off screen. */
  const chunks: React.ReactNode[] = []
  for (let i = 0; i < rows.length; i += chunk)
    chunks.push(
      <div key={i} data-slot="diff-viewer-chunk" className="[content-visibility:auto] [contain-intrinsic-size:auto_calc(64*1.7em)]">
        {rows.slice(i, i + chunk)}
      </div>,
    )
  return chunks
})

const chunk = 64

const UnifiedLine = React.memo(function UnifiedLine({ line, language, words }: { line: DiffLine; language: CodeBlockLanguage; words: boolean }) {
  return (
    <div data-slot="diff-viewer-line" data-kind={line.kind}>
      <span data-slot="diff-viewer-line-number" data-side="old" aria-hidden>
        {line.old}
      </span>
      <span data-slot="diff-viewer-line-number" data-side="new" aria-hidden>
        {line.new}
      </span>
      <span data-slot="diff-viewer-line-sign" aria-hidden>
        {signs[line.kind]}
      </span>
      <LineText line={line} language={language} words={words} />
    </div>
  )
})

const splitCache = new WeakMap<DiffLine[], SplitRow[]>()
function splitOf(lines: DiffLine[]) {
  let rows = splitCache.get(lines)
  if (!rows) splitCache.set(lines, (rows = splitRows(lines)))
  return rows
}

function SplitCell({ line, side, language, words }: { line?: DiffLine; side: "old" | "new"; language: CodeBlockLanguage; words: boolean }) {
  return (
    <div data-slot="diff-viewer-cell" data-side={side} data-kind={line ? line.kind : "empty"}>
      <span data-slot="diff-viewer-line-number" data-side={side} aria-hidden>
        {line ? (side === "old" ? line.old : line.new) : null}
      </span>
      <span data-slot="diff-viewer-line-sign" aria-hidden>
        {line ? signs[line.kind] : null}
      </span>
      {line ? <LineText line={line} language={language} words={words} /> : <span data-slot="diff-viewer-line-content" />}
    </div>
  )
}

const SplitLine = React.memo(function SplitLine({ row, language, words }: { row: SplitRow; language: CodeBlockLanguage; words: boolean }) {
  return (
    <div data-slot="diff-viewer-row">
      <SplitCell line={row.left} side="old" language={language} words={words} />
      <SplitCell line={row.right} side="new" language={language} words={words} />
    </div>
  )
})

/* ---------- Hunks and folds ---------- */

function DiffViewerHunk({ value, className, ...props }: { value: string } & Omit<PartProps<"div", StateOf<typeof diffViewer, "hunk">>, "value">) {
  return usePart(
    diffViewer,
    "hunk",
    { value },
    {
      ...props,
      className: withClass(cn("relative transition-[opacity,filter] duration-[calc(240ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none", cascade), className),
    },
    "div",
  )
}

function DiffViewerHunkHeader({ value, className, ...props }: { value: string } & Omit<PartProps<"div", StateOf<typeof diffViewer, "hunk-header">>, "value">) {
  return usePart(diffViewer, "hunk-header", { value }, { ...props, className: withClass(cascade, className) }, "div")
}

function DiffViewerGap({ value, className, ...props }: { value: string } & Omit<PartProps<"div", StateOf<typeof diffViewer, "gap">>, "value">) {
  return usePart(diffViewer, "gap", { value }, { ...props, className: withClass(cascade, className) }, "div")
}

function UnfoldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M5 5.5 8 2.5l3 3M5 10.5l3 3 3-3M8 2.5v4M8 13.5v-4" />
    </svg>
  )
}

function DiffViewerFold({ value, className, children, ...props }: { value: string } & Omit<PartProps<"button", StateOf<typeof diffViewer, "fold">>, "value">) {
  return usePart(
    diffViewer,
    "fold",
    { value },
    {
      ...props,
      className: withClass(
        cn(
          "transition-[color,background-color,scale] duration-[calc(160ms*var(--kf-speed,1))] ease-house active:scale-[calc(1-0.015*var(--kf-flourish,1))] motion-reduce:transition-none",
          "[&_svg]:transition-[translate,scale] [&_svg]:duration-[calc(260ms*var(--kf-speed,1))] [&_svg]:ease-pop hover:[&_svg]:scale-[calc(1+0.12*var(--kf-flourish,1))]",
        ),
        className,
      ),
      children:
        children ??
        ((state) => (
          <>
            <UnfoldIcon />
            <span>
              {state.lines} <span data-slot="diff-viewer-fold-word">unchanged </span>
              {state.lines === 1 ? "line" : "lines"}
            </span>
          </>
        )),
    },
    "button",
  )
}

/* An opened fold: grows from the fold row's height (`--diff-fold-height`) to its lines, which fade in. */
function DiffViewerExpanded({ value, className, children, ...props }: { value: string } & Omit<PartProps<"div", StateOf<typeof diffViewer, "expanded">>, "value">) {
  return usePart(
    diffViewer,
    "expanded",
    { value },
    {
      ...props,
      className: withClass(
        cn(
          "grid grid-rows-[1fr] starting:grid-rows-[0fr] starting:min-h-[var(--diff-fold-height,2rem)]",
          "transition-[grid-template-rows,min-height] duration-[calc(380ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
        ),
        className,
      ),
      children: (state) => (
        <div
          data-slot="diff-viewer-expanded-lines"
          className="min-h-0 overflow-hidden opacity-100 transition-opacity delay-[calc(60ms*var(--kf-speed,1))] duration-[calc(320ms*var(--kf-speed,1))] ease-house starting:opacity-0 motion-reduce:transition-none"
        >
          {typeof children === "function" ? children(state) : children}
        </div>
      ),
    },
    "div",
  )
}

/* ---------- Review ---------- */

const press =
  "transition-[color,background-color,box-shadow,scale] duration-[calc(160ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.05*var(--kf-flourish,1))] motion-reduce:transition-none"
const arrive = cn(
  "transition-[opacity,translate] duration-[calc(300ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none",
  "starting:opacity-0 starting:translate-y-[calc(4px+4px*var(--kf-flourish,1))]",
)

function DiffViewerAccept({ value, className, children, ...props }: { value: string } & Omit<PartProps<"button", StateOf<typeof diffViewer, "accept">>, "value">) {
  return usePart(diffViewer, "accept", { value }, { ...props, className: withClass(cn(press, arrive), className), children: children ?? "Accept" }, "button")
}

function DiffViewerReject({ value, className, children, ...props }: { value: string } & Omit<PartProps<"button", StateOf<typeof diffViewer, "reject">>, "value">) {
  return usePart(diffViewer, "reject", { value }, { ...props, className: withClass(cn(press, arrive), className), children: children ?? "Reject" }, "button")
}

function DiffViewerStatus({ value, className, children, ...props }: { value: string } & Omit<PartProps<"span", StateOf<typeof diffViewer, "status">>, "value">) {
  return usePart(
    diffViewer,
    "status",
    { value },
    {
      ...props,
      className: withClass(arrive, className),
      children:
        children ??
        ((state) => (
          <>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {state.decision === "accepted" ? (
                <path
                  d="M3.5 8.5 6.5 11.5 12.5 4.75"
                  pathLength={1}
                  className="[stroke-dasharray:1] animate-[kf-diff-tick_calc(320ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_calc(120ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards] motion-reduce:animate-none"
                />
              ) : (
                <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
              )}
            </svg>
            {state.decision === "accepted" ? "Accepted" : "Rejected"}
          </>
        )),
    },
    "span",
  )
}

function DiffViewerUndo({ value, className, children, ...props }: { value: string } & Omit<PartProps<"button", StateOf<typeof diffViewer, "undo">>, "value">) {
  return usePart(diffViewer, "undo", { value }, { ...props, className: withClass(cn(press, arrive), className), children: children ?? "Undo" }, "button")
}

/* ---------- Content ---------- */

/* The review actions for one hunk: Reject and Accept, or the decision and Undo. */
function Review({ value }: { value: string }) {
  return (
    <span data-slot="diff-viewer-review">
      <DiffViewerReject value={value} />
      <DiffViewerAccept value={value} />
      <DiffViewerStatus value={value} />
      <DiffViewerUndo value={value} />
    </span>
  )
}

type BlocksProps = { blocks: DiffBlock[]; view: DiffView; expanded: string[]; review: boolean; language: CodeBlockLanguage; words: boolean }

/* Every block of the diff: folds, opened folds, hunk headers and hunks. */
const DiffViewerBlocks = React.memo(function DiffViewerBlocks({ blocks, view, expanded, review, language, words }: BlocksProps) {
  return blocks.map((block) => {
    const gap = block.gap
    const open = gap && expanded.includes(gap.key)
    const lines = gap && open && gap.lines ? (
      <DiffViewerExpanded key={`${gap.key}-open`} value={gap.key}>
        <DiffViewerLines lines={gap.lines} view={view} language={language} words={words} />
      </DiffViewerExpanded>
    ) : null
    if (block.type === "gap") {
      return lines ?? (
        <DiffViewerGap key={block.gap.key} value={block.gap.key}>
          <DiffViewerFold value={block.gap.key} />
        </DiffViewerGap>
      )
    }
    const value = String(block.hunk.index)
    const header = (gap && !open) || review
    return (
      <React.Fragment key={value}>
        {lines}
        {header && (
          <DiffViewerHunkHeader value={value}>
            {gap && !open && <DiffViewerFold value={gap.key} />}
            <span data-slot="diff-viewer-range">
              {block.hunk.range}
              {block.hunk.section && <span data-slot="diff-viewer-section"> {block.hunk.section}</span>}
            </span>
            {review && <Review value={value} />}
          </DiffViewerHunkHeader>
        )}
        <DiffViewerHunk value={value}>
          <DiffViewerLines lines={block.hunk.lines} view={view} language={language} words={words} />
        </DiffViewerHunk>
      </React.Fragment>
    )
  })
})

/* The scrolling body. With no children it renders the whole diff. Switching views remounts the body,
   which arrives from the side of the view chosen (split from the right, unified from the left). */
function DiffViewerContent({ className, children, ...props }: PartProps<"div", StateOf<typeof diffViewer, "content">>) {
  return usePart(
    diffViewer,
    "content",
    {},
    {
      ...props,
      className: withClass("isolate", className),
      children:
        children ??
        ((state) => (
          <div
            key={state.view}
            data-slot="diff-viewer-body"
            data-view={state.view}
            className={cn(
              "[--diff-from:calc(-1*(6px+10px*var(--kf-flourish,1)))] data-[view=split]:[--diff-from:calc(6px+10px*var(--kf-flourish,1))]",
              "group-data-switched/diff-viewer:animate-[kf-diff-view_calc(300ms*var(--kf-speed,1))_var(--ease-house)_both] motion-reduce:animate-none!",
            )}
          >
            <DiffViewerBlocks blocks={state.model.blocks} view={state.view} expanded={state.expanded} review={state.review} language={state.language} words={state.wordDiff} />
          </div>
        )),
    },
    "div",
  )
}

export {
  DiffViewer,
  DiffViewerAccept,
  DiffViewerActions,
  DiffViewerBlocks,
  DiffViewerContent,
  DiffViewerCopyButton,
  DiffViewerExpanded,
  DiffViewerFold,
  DiffViewerGap,
  DiffViewerHeader,
  DiffViewerHunk,
  DiffViewerHunkHeader,
  DiffViewerLines,
  DiffViewerReject,
  DiffViewerStats,
  DiffViewerStatus,
  DiffViewerTitle,
  DiffViewerUndo,
  DiffViewerViewOption,
  DiffViewerViewSwitch,
}
export {
  buildDiff,
  type DiffBlock,
  type DiffDecision,
  type DiffHunk,
  type DiffLine,
  type DiffModel,
  type DiffView,
  diffWords,
  parsePatch,
} from "@/components/core/diff-viewer"
