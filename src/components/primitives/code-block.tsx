"use client"

/* Animated code block, on UI SDK's core. UI SDK ships no code block, so the behaviour is defined in
   `@/components/core/code-block` with `definePrimitive` and rendered here. This file adds motion only.
   Colours, radii, shadows and spacing stay yours (style `data-token`, `data-variant` and `data-copied`).

   - Cascade: the lines arrive one after another from the left when the block mounts or the code changes.
   - Draw: a highlighted line's band sweeps in from the left; when the highlight moves, the old bands
     shrink back and the new ones sweep in, top to bottom.
   - Pop and Draw: on copy, the copy icon blurs away, the tick pops in and draws itself, and the button
     sinks under the press.
   - The cascade, the band's stagger, the tick's draw and the icons' shrink, blur and press scale with
     --kf-flourish; at 0 the lines are simply there and the icons cross-fade. */

import type { StateOf } from "@ui-sdk/core"
import { createParts, type PartProps, usePart } from "@ui-sdk/react/primitive"
import * as React from "react"

import { codeBlock } from "@/components/core/code-block"
import { cn } from "@/lib/utils"

const parts = createParts(codeBlock, { root: "div", header: "div", title: "div", actions: "div", footer: "div" })

type ClassName<S> = string | ((state: S) => string | undefined) | undefined
/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: ClassName<S>) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const keyframes = [
  "@keyframes kf-code-line{from{opacity:0;translate:-10px 0;filter:blur(3px)}}",
  "@keyframes kf-code-tick{from{stroke-dashoffset:1}}",
].join("")

function CodeBlock({ className, ...props }: React.ComponentProps<typeof parts.Root>) {
  return (
    <>
      <style href="kf-code-block" precedence="default">
        {keyframes}
      </style>
      <parts.Root className={withClass("group/code-block relative", className)} {...props} />
    </>
  )
}

const CodeBlockHeader = parts.Header
const CodeBlockTitle = parts.Title
const CodeBlockActions = parts.Actions
const CodeBlockFooter = parts.Footer

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <rect x="5.25" y="5.25" width="8" height="8" rx="2" />
      <path d="M10.75 5.25V4.5a1.75 1.75 0 0 0-1.75-1.75H4.5A1.75 1.75 0 0 0 2.75 4.5V9c0 .97.78 1.75 1.75 1.75h.75" />
    </svg>
  )
}

/* The two icons share one cell. Copied: the copy icon shrinks into a blur, the tick pops in from 60%
   and its stroke draws. Back: the tick fades, the copy icon returns. */
const swapIn = "transition-[opacity,scale,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-pop motion-reduce:transition-none!"
const swapOut = "transition-[opacity,scale,filter] duration-[calc(160ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!"

function CodeBlockCopyButton({
  className,
  children,
  ...props
}: PartProps<"button", StateOf<typeof codeBlock, "copy">>) {
  return usePart(
    codeBlock,
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
          <>
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
                    className="[stroke-dasharray:1] animate-[kf-code-tick_calc(300ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_calc(80ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards] motion-reduce:animate-none"
                  />
                )}
              </svg>
            </span>
          </>
        )),
    },
    "button",
  )
}

/* One line. With no children it renders its tokens, each a span with `data-token` set to its kind. */
function CodeBlockLine({
  value,
  className,
  children,
  ...props
}: { value: string } & Omit<PartProps<"span", StateOf<typeof codeBlock, "line">>, "value">) {
  return usePart(
    codeBlock,
    "line",
    { value },
    {
      ...props,
      className: withClass(
        cn(
          "relative block",
          /* Cascade: each line a beat after the one above it, the first 16 staggered. */
          "animate-[kf-code-line_calc(460ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
          "[animation-delay:calc((min(var(--code-line-index,0),16)*calc(22ms*var(--kf-speed,1))+calc(60ms*var(--kf-speed,1)))*var(--kf-flourish,1))]",
          /* Draw: the band sweeps in from the left. Its surface follows the text colour; restyle it with before:. */
          "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:content-['']",
          "before:bg-[color-mix(in_oklch,currentColor_7%,transparent)]",
          "before:transition-[scale] before:duration-[calc(180ms*var(--kf-speed,1))] before:ease-house",
          "data-[variant=highlighted]:before:scale-x-100 data-[variant=added]:before:scale-x-100 data-[variant=removed]:before:scale-x-100",
          "data-[variant=highlighted]:before:duration-[calc(560ms*var(--kf-speed,1))] data-[variant=highlighted]:before:ease-spring",
          "data-[variant=highlighted]:before:[transition-delay:calc(min(var(--code-line-index,0),16)*calc(18ms*var(--kf-speed,1))*var(--kf-flourish,1))]",
          "motion-reduce:animate-none! motion-reduce:before:transition-none!",
        ),
        className,
      ),
      children:
        children ??
        ((state) => (
          <>
            {state.lineNumbers && (
              <span data-slot="code-block-line-number" aria-hidden className="select-none">
                {state.number}
              </span>
            )}
            <span data-slot="code-block-line-content">
              {state.tokens.length === 0
                ? "\n"
                : state.tokens.map((token, index) => (
                    <span key={index} data-token={token.kind}>
                      {token.text}
                    </span>
                  ))}
            </span>
          </>
        )),
    },
    "span",
  )
}

/* The scrolling `pre`. With no children it renders a line part for every line of `code`. */
function CodeBlockContent({
  className,
  children,
  ...props
}: PartProps<"pre", StateOf<typeof codeBlock, "content">>) {
  return usePart(
    codeBlock,
    "content",
    {},
    {
      ...props,
      className: withClass("isolate", className),
      children:
        children ??
        ((state) => (
          <code data-slot="code-block-code" className="block min-w-max in-data-wrap:min-w-0">
            {state.numbers.map((number) => (
              <CodeBlockLine key={number} value={number} />
            ))}
          </code>
        )),
    },
    "pre",
  )
}

export {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFooter,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
}
export { tokenize, type CodeBlockLanguage, type CodeToken, type CodeTokenKind } from "@/components/core/code-block"
