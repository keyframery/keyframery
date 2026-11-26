/* UI SDK parts for message, made once from the shared core definition (the same file React uses). */
import { createParts } from "@ui-sdk/vue/primitive"

import { message, messageGroup } from "@/components/keyframery/core/message-core"
import { cn } from "@/lib/utils"

export const {
  Root: MessageRoot,
  Avatar: MessageAvatarPart,
  Content: MessageContentPart,
  Header: MessageHeaderPart,
  Footer: MessageFooterPart,
} = createParts(message, { root: "div", avatar: "div", content: "div", header: "div", footer: "div" })
export const { Root: MessageGroupRoot } = createParts(messageGroup, { root: "div" })

/* Rise: what each line does while its message has `data-starting-style`. The blur, the stagger and
   all but 8px of the rise scale with --kf-flourish. */
const rise = cn(
  "transition-[opacity,translate,filter] duration-[calc(460ms*var(--kf-speed,1))] ease-spring",
  "group-data-starting-style/message:translate-y-[calc(8px+4px*var(--kf-flourish,1))] group-data-starting-style/message:opacity-0 group-data-starting-style/message:blur-[calc(4px*var(--kf-flourish,1))]",
  "group-data-starting-style/message:transition-none motion-reduce:transition-none!",
)

export const groupLook = "flex min-w-0 flex-col gap-[var(--message-turn-gap,1rem)]"
export const messageClass = cn(
  "group/message",
  "relative flex w-full min-w-0 gap-[var(--message-gap,0.625rem)] text-[14px] data-[align=end]:flex-row-reverse",
)

export const avatarClass = cn(
  cn(
    "origin-bottom transition-[scale,opacity] duration-[calc(520ms*var(--kf-speed,1))] ease-pop delay-[calc(60ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
    "group-data-starting-style/message:scale-[calc(0.95-0.45*var(--kf-flourish,1))] group-data-starting-style/message:opacity-0 group-data-starting-style/message:transition-none",
    "motion-reduce:transition-none!",
  ),
  cn(
    "flex size-[var(--message-avatar-size,2rem)] shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-[var(--message-face,var(--muted))] text-[length:var(--message-font,12px)] font-medium text-[color:var(--message-muted,var(--muted-foreground))]",
    "shadow-[0_0_0_1px_rgb(0_0_0/0.06)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
    "group-has-data-[slot=message-footer]/message:mb-[22px]",
    "[&_img]:size-full [&_img]:object-cover",
  ),
)

export const headerClass = cn(
  rise,
  cn(
    "flex max-w-full min-w-0 items-center gap-1.5 px-1 pb-0.5 text-[length:var(--message-font,12px)] leading-none font-medium text-[color:var(--message-muted,var(--muted-foreground))]",
    "group-data-[align=end]/message:justify-end group-has-data-[variant=ghost]/message:px-0",
    "[&_time]:font-normal [&_time]:tabular-nums",
  ),
)

export const contentClass = cn(
  cn(rise, "delay-[calc(50ms*var(--kf-speed,1)*var(--kf-flourish,1))]"),
  cn("flex w-full min-w-0 flex-col gap-[var(--message-content-gap,0.25rem)] wrap-break-word", "group-data-[align=end]/message:items-end"),
)

export const footerClass = cn(
  cn(rise, "delay-[calc(320ms*var(--kf-speed,1)*var(--kf-flourish,1))]"),
  cn(
    "flex h-[18px] max-w-full min-w-0 items-center gap-[var(--message-content-gap,0.25rem)] px-1 text-[11px] leading-none text-[color:var(--message-muted,var(--muted-foreground))] tabular-nums",
    "group-data-[align=end]/message:justify-end group-has-data-[variant=ghost]/message:px-0",
    "[&_svg]:size-3.5 [&_svg]:shrink-0",
  ),
)
