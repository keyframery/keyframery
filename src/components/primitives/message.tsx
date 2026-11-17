"use client"

/* An animated chat message, on UI SDK's core. UI SDK ships no message, so the behaviour is defined in
   `@/components/core/message` with `definePrimitive` and rendered here. This file adds motion only.
   Colours, radii, shadows and spacing stay yours (style `data-align`).

   - Rise: a new message's header, content and footer rise into place one after another
     (Cascade), the header first and the footer, with its "Read" or time, last.
   - The avatar pops in with `ease-pop` as the first line lands.
   Bubbles inside a message pop by themselves (see `@/components/primitives/bubble`). */

import { createParts } from "@ui-sdk/react/primitive"
import * as React from "react"

import { message, messageGroup } from "@/components/core/message"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const {
  Root: MessageRoot,
  Avatar: MessageAvatarPart,
  Content: MessageContentPart,
  Header: MessageHeaderPart,
  Footer: MessageFooterPart,
} = createParts(message, { root: "div", avatar: "div", content: "div", header: "div", footer: "div" })
const { Root: MessageGroupRoot } = createParts(messageGroup, { root: "div" })

/* Rise: what each line does while its message has `data-starting-style`. Only opacity, translate
   and filter transition, and nothing transitions during that first frame. */
const rise = cn(
  "transition-[opacity,translate,filter] duration-[calc(460ms*var(--kf-speed,1))] ease-spring",
  "group-data-starting-style/message:translate-y-3 group-data-starting-style/message:opacity-0 group-data-starting-style/message:blur-[4px]",
  "group-data-starting-style/message:transition-none motion-reduce:transition-none!",
)

function MessageGroup({ className, ...props }: React.ComponentProps<typeof MessageGroupRoot>) {
  return <MessageGroupRoot className={className} {...props} />
}

function Message({ className, ...props }: React.ComponentProps<typeof MessageRoot>) {
  return <MessageRoot className={withClass("group/message", className)} {...props} />
}

function MessageAvatar({ className, ...props }: React.ComponentProps<typeof MessageAvatarPart>) {
  return (
    <MessageAvatarPart
      className={withClass(
        cn(
          "origin-bottom transition-[scale,opacity] duration-[calc(520ms*var(--kf-speed,1))] ease-pop delay-[calc(60ms*var(--kf-speed,1))]",
          "group-data-starting-style/message:scale-50 group-data-starting-style/message:opacity-0 group-data-starting-style/message:transition-none",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function MessageHeader({ className, ...props }: React.ComponentProps<typeof MessageHeaderPart>) {
  return <MessageHeaderPart className={withClass(rise, className)} {...props} />
}

function MessageContent({ className, ...props }: React.ComponentProps<typeof MessageContentPart>) {
  return <MessageContentPart className={withClass(
    cn(
      rise, "delay-[calc(50ms*var(--kf-speed,1))]",
    ),
    className,
  )} {...props} />
}

function MessageFooter({ className, ...props }: React.ComponentProps<typeof MessageFooterPart>) {
  return <MessageFooterPart className={withClass(
    cn(
      rise, "delay-[calc(320ms*var(--kf-speed,1))]",
    ),
    className,
  )} {...props} />
}

export { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader }
