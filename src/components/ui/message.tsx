"use client"

export * from "@/components/primitives/message"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --message-face: Incoming bubble surface; default: --muted.
   --message-muted: Sender and receipt; default: text-muted-foreground.
   --message-font: Sender size; default: text-[12px].
   --message-gap: Avatar gap; default: gap-2.5.
   --message-turn-gap: Turn spacing; default: gap-4.
   --message-content-gap: Bubble spacing; default: gap-1.
   --message-avatar-size: Avatar size; default: size-8.
*/

/* A styled chat message: the animated primitive plus the Keyframery look. The avatar sits at the
   foot of the turn, level with the last bubble; your own messages mirror to the other side. */

import * as React from "react"

import {
  Message as MessagePrimitive,
  MessageAvatar as MessageAvatarPrimitive,
  MessageContent as MessageContentPrimitive,
  MessageFooter as MessageFooterPrimitive,
  MessageGroup as MessageGroupPrimitive,
  MessageHeader as MessageHeaderPrimitive,
} from "@/components/primitives/message"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function MessageGroup({ speed, className, ...props }: React.ComponentProps<typeof MessageGroupPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <MessageGroupPrimitive className={withClass("flex min-w-0 flex-col gap-[var(--message-turn-gap,1rem)]", className)} {...props} />
    </Speed>
  )
}

function Message({ speed, className, ...props }: React.ComponentProps<typeof MessagePrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <MessagePrimitive
        className={withClass("relative flex w-full min-w-0 gap-[var(--message-gap,0.625rem)] text-[14px] data-[align=end]:flex-row-reverse", className)}
        {...props}
      />
    </Speed>
  )
}

/* A round picture at the foot of the turn. With a footer under the bubbles it rises to stay level
   with the last one. */
function MessageAvatar({ className, ...props }: React.ComponentProps<typeof MessageAvatarPrimitive>) {
  return (
    <MessageAvatarPrimitive
      className={withClass(
        cn(
          "flex size-[var(--message-avatar-size,2rem)] shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-[var(--message-face,var(--muted))] text-[length:var(--message-font,12px)] font-medium text-[color:var(--message-muted,var(--muted-foreground))]",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
          "group-has-data-[slot=message-footer]/message:mb-[22px]",
          "[&_img]:size-full [&_img]:object-cover",
        ),
        className,
      )}
      {...props}
    />
  )
}

function MessageContent({ className, ...props }: React.ComponentProps<typeof MessageContentPrimitive>) {
  return (
    <MessageContentPrimitive
      className={withClass(
        cn(
          "flex w-full min-w-0 flex-col gap-[var(--message-content-gap,0.25rem)] wrap-break-word",
          "group-data-[align=end]/message:items-end",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The sender and the time, small, above the first bubble. */
function MessageHeader({ className, ...props }: React.ComponentProps<typeof MessageHeaderPrimitive>) {
  return (
    <MessageHeaderPrimitive
      className={withClass(
        cn(
          "flex max-w-full min-w-0 items-center gap-1.5 px-1 pb-0.5 text-[length:var(--message-font,12px)] leading-none font-medium text-[color:var(--message-muted,var(--muted-foreground))]",
          "group-data-[align=end]/message:justify-end group-has-data-[variant=ghost]/message:px-0",
          "[&_time]:font-normal [&_time]:tabular-nums",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Read receipts, "Edited", a time: under the last bubble. */
function MessageFooter({ className, ...props }: React.ComponentProps<typeof MessageFooterPrimitive>) {
  return (
    <MessageFooterPrimitive
      className={withClass(
        cn(
          "flex h-[18px] max-w-full min-w-0 items-center gap-[var(--message-content-gap,0.25rem)] px-1 text-[11px] leading-none text-[color:var(--message-muted,var(--muted-foreground))] tabular-nums",
          "group-data-[align=end]/message:justify-end group-has-data-[variant=ghost]/message:px-0",
          "[&_svg]:size-3.5 [&_svg]:shrink-0",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader }
