"use client"

export * from "@/components/primitives/message-scroller"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --message-scroller-face: Jump button surface; default: bg-background.
   --message-scroller-ink: Jump button text; default: text-foreground.
   --message-scroller-unread-face: Unread surface; default: bg-primary.
   --message-scroller-font: Jump label size; default: text-[12.5px].
   --message-scroller-height: Jump button height; default: h-8.
   --message-scroller-icon-size: Jump icon; default: size-3.5.
   --message-scroller-gap: Message spacing; default: gap-4.
   --message-scroller-padding: Conversation inset; default: p-4.
*/

/* A styled chat scroller: the animated primitive inside Keyframery's scroll area. The edges fade
   where more conversation waits, the slim scrollbar shows on hover, and "jump to latest" is a small
   key that rises from the bottom edge with the number of new messages. */

import * as React from "react"

import {
  MessageScrollerButton as MessageScrollerButtonPrimitive,
  MessageScrollerItem as MessageScrollerItemPrimitive,
  MessageScrollerLabel,
  type MessageScrollerRootProps,
  useMessageScrollerRoot,
} from "@/components/primitives/message-scroller"
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@/components/ui/scroll-area"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Give it a height (or put it in a column that has one). */
function MessageScroller({ speed, stickToEnd = true, className, ...props }: MessageScrollerRootProps & SpeedProps) {
  const root = useMessageScrollerRoot({ ...props, className: withClass("relative flex min-h-0 flex-col", className) }, (controller, children) => (
    <ScrollArea controller={controller} stickToEnd={stickToEnd} className="min-h-0 flex-1 rounded-[inherit]">
      {children}
      <ScrollAreaScrollbar>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  ))
  return <Speed speed={speed}>{root}</Speed>
}

/* The real scroller, a `log`. Name it with `aria-label`. */
function MessageScrollerViewport({ role = "log", className, ...props }: React.ComponentProps<typeof ScrollAreaViewport>) {
  return <ScrollAreaViewport role={role} className={className} {...props} />
}

function MessageScrollerContent({ className, ...props }: React.ComponentProps<typeof ScrollAreaContent>) {
  return <ScrollAreaContent className={withClass("flex min-h-full flex-col justify-end gap-[var(--message-scroller-gap,1rem)] p-[var(--message-scroller-padding,1rem)]", className)} {...props} />
}

function MessageScrollerItem({ className, ...props }: React.ComponentProps<typeof MessageScrollerItemPrimitive>) {
  return <MessageScrollerItemPrimitive className={withClass("min-w-0 shrink-0", className)} {...props} />
}

/* A small key, centred over the bottom edge. */
function MessageScrollerButton({ className, ...props }: React.ComponentProps<typeof MessageScrollerButtonPrimitive>) {
  return (
    <MessageScrollerButtonPrimitive
      className={withClass(
        cn(
          "absolute bottom-3 left-1/2 z-10 inline-flex h-[var(--message-scroller-height,2rem)] -translate-x-1/2 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[var(--message-scroller-face,var(--background))] ps-2.5 pe-3.5",
          "text-[length:var(--message-scroller-font,12.5px)] leading-none font-medium whitespace-nowrap text-[color:var(--message-scroller-ink,var(--foreground))] outline-none select-none [&_svg]:size-[var(--message-scroller-icon-size,0.875rem)] [&_svg]:shrink-0",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_2px_4px_-1px_rgb(0_0_0/0.08),0_8px_20px_-6px_rgb(0_0_0/0.18)]",
          "dark:bg-[var(--message-scroller-face,var(--accent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),inset_0_1px_0_rgb(255_255_255/0.08),0_8px_20px_-6px_rgb(0_0_0/0.7)]",
          "hover:bg-[color-mix(in_oklab,var(--background),var(--foreground)_3%)] dark:hover:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_7%)]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          /* New messages waiting: the key takes the primary colour. */
          "has-data-unread:bg-[var(--message-scroller-unread-face,var(--primary))] has-data-unread:text-primary-foreground dark:has-data-unread:bg-[var(--message-scroller-unread-face,var(--primary))]",
          "has-data-unread:hover:bg-[color-mix(in_oklab,var(--primary),var(--background)_10%)]",
          "rtl:translate-x-1/2",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerLabel, MessageScrollerViewport }
export { createScrollAreaController } from "@/components/primitives/message-scroller"
