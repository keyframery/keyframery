"use client"

/* An animated chat scroller, on UI SDK's core and UI SDK's scroll area. The scroll area does the
   scrolling, keeps the newest message in view as the conversation grows (`stickToEnd`) and owns the
   "jump to latest" button; `@/components/core/message-scroller` adds what it lacks (history,
   unread count, following your own messages). This file renders both and adds motion only.
   Colours, radii, shadows and spacing stay yours.

   - Rise: a message that arrives after the first frame rises 16px into place; the history loaded
     with the page sits still.
   - Follow: while the reader is at the end, the view stays on the newest message as it grows.
   - The jump-to-latest button rises from the bottom edge with a pop once the reader scrolls away,
     and its count of new messages rolls up as each one arrives.
   The rise past 8px, the button's extra shrink and blur, its press depth and the roll scale with
   --kf-flourish; at 0 a new message fades in with a small rise and the count simply changes. */

import { usePart, usePrimitive, type PartProps } from "@ui-sdk/react/primitive"
import type { StateOf } from "@ui-sdk/core"
import * as React from "react"

import { type MessageScrollerOptions, messageScroller } from "@/components/core/message-scroller"
import {
  createScrollAreaController,
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollToEnd,
  ScrollAreaViewport,
} from "@/components/primitives/scroll-area"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

type ScrollAreaController = ReturnType<typeof createScrollAreaController>

type MessageScrollerRootProps = Omit<MessageScrollerOptions, "scroller"> &
  Omit<PartProps<"div", StateOf<typeof messageScroller, "root">>, "defaultValue"> & {
    /** The scroll area's controller. Pass one to scroll from your own code; one is made otherwise. */
    controller?: ScrollAreaController
    /** Keeps the newest message in view as the conversation grows. On by default. */
    stickToEnd?: boolean
  }

/* Makes the controller (unless one is passed) and the primitive's instance, and hands the
   controller to whatever renders the scroll area inside. */
function useMessageScrollerRoot(
  { controller, unread, defaultUnread, onUnreadChange, ...props }: Omit<MessageScrollerRootProps, "stickToEnd">,
  renderArea: (controller: ScrollAreaController, children: React.ReactNode) => React.ReactNode,
) {
  const [own] = React.useState(createScrollAreaController)
  const scroller = controller ?? own
  const handle = usePrimitive(messageScroller, { scroller, unread, defaultUnread, onUnreadChange })
  const { children, ...rest } = props
  return usePart(
    handle,
    "root",
    {},
    { ...rest, children: (state) => renderArea(scroller, typeof children === "function" ? children(state) : children) },
    "div",
  )
}

/* The scroller: a box holding UI SDK's scroll area. Give it a height. */
function MessageScroller({ stickToEnd = true, className, ...props }: MessageScrollerRootProps) {
  return useMessageScrollerRoot({ ...props, className: withClass("relative flex min-h-0 flex-col", className) }, (controller, children) => (
    <ScrollArea controller={controller} stickToEnd={stickToEnd} className="min-h-0 flex-1">
      {children}
    </ScrollArea>
  ))
}

/* The real scroller. A chat is a `log`, so screen readers hear new messages as they arrive. */
function MessageScrollerViewport({ role = "log", ...props }: React.ComponentProps<typeof ScrollAreaViewport>) {
  return <ScrollAreaViewport role={role} {...props} />
}

function MessageScrollerContent(props: React.ComponentProps<typeof ScrollAreaContent>) {
  return <ScrollAreaContent {...props} />
}

/* Rise, for a message that arrives after the first frame. */
const itemMotion = cn(
  "transition-[translate,opacity] duration-[calc(520ms*var(--kf-speed,1))] ease-spring",
  "data-starting-style:translate-y-[calc(0.5rem+0.5rem*var(--kf-flourish,1))] data-starting-style:opacity-0 data-starting-style:transition-none",
  "motion-reduce:transition-none!",
)

/* One message in the scroller, keyed by `value`. `follow` brings the view down when it arrives,
   for the person's own messages. */
function MessageScrollerItem({
  value,
  follow,
  className,
  ...props
}: { value: string; follow?: boolean } & Omit<PartProps<"div", StateOf<typeof messageScroller, "item">>, "value">) {
  return usePart(messageScroller, "item", { value, follow }, { ...props, className: withClass(itemMotion, className) }, "div")
}

/* Roll: each digit is a column of 0 to 9 that slides to its value. */
function Roll({ value }: { value: number }) {
  const text = value > 99 ? "99" : String(value)
  return (
    <span aria-hidden className="inline-flex h-[1em] overflow-hidden leading-none tabular-nums">
      {text.split("").map((digit, index) => (
        <span
          key={text.length - index}
          style={{ "--d": Number(digit) } as React.CSSProperties}
          className="flex flex-col transition-[translate] duration-[calc(500ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring [translate:0_calc(var(--d)*-1em)] motion-reduce:transition-none"
        >
          {Array.from({ length: 10 }, (_, d) => (
            <span key={d} className="h-[1em]">
              {d}
            </span>
          ))}
        </span>
      ))}
      {value > 99 ? "+" : null}
    </span>
  )
}

/* The words on the jump-to-latest button: "Jump to latest", or how many new messages wait, with the
   count rolling up. Pass children (or a function of `{ unread }`) for your own words. */
function MessageScrollerLabel({ children, ...props }: PartProps<"span", StateOf<typeof messageScroller, "label">>) {
  return usePart(
    messageScroller,
    "label",
    {},
    {
      ...props,
      children:
        children ??
        (({ unread }: { unread: number }) =>
          unread ? (
            <>
              <span className="sr-only">{unread}</span>
              <Roll value={unread} /> new {unread === 1 ? "message" : "messages"}
            </>
          ) : (
            "Jump to latest"
          )),
    },
    "span",
  )
}

function ArrowDown() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 3v10M3.75 8.75 8 13l4.25-4.25" />
    </svg>
  )
}

/* Jump to latest: UI SDK's scroll-to-end button. Out of sight it waits below the edge, small and
   blurred; once the reader scrolls away it rises with a pop. */
function MessageScrollerButton({ className, children, ...props }: React.ComponentProps<typeof ScrollAreaScrollToEnd>) {
  return (
    <ScrollAreaScrollToEnd
      className={withClass(
        cn(
          "origin-bottom [transition:translate_calc(460ms*var(--kf-speed,1))_var(--ease-pop),scale_calc(460ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house),filter_calc(260ms*var(--kf-speed,1))_var(--ease-house)]",
          "not-data-visible:pointer-events-none not-data-visible:translate-y-[calc(0.5rem+0.25rem*var(--kf-flourish,1))] not-data-visible:scale-[calc(0.95-0.15*var(--kf-flourish,1))] not-data-visible:opacity-0 not-data-visible:blur-[calc(4px*var(--kf-flourish,1))]",
          "not-data-visible:[transition:translate_calc(180ms*var(--kf-speed,1))_var(--ease-house),scale_calc(180ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house),filter_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
          "active:scale-[calc(1-0.04*var(--kf-flourish,1))] motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <ArrowDown />
          <MessageScrollerLabel />
        </>
      )}
    </ScrollAreaScrollToEnd>
  )
}

export {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerLabel,
  MessageScrollerViewport,
  useMessageScrollerRoot,
  type MessageScrollerRootProps,
}
export { createScrollAreaController } from "@/components/primitives/scroll-area"
