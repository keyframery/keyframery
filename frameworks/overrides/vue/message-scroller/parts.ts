/* Classes for message-scroller. Its parts are written with usePart (keyed items, a root that renders
   UI SDK's scroll area inside), like the React primitive. */
import { cn } from "@/lib/utils"

export const rootClass = "relative flex min-h-0 flex-col"

/* Rise, for a message that arrives after the first frame. */
export const itemClass = cn(
  cn(
    "transition-[translate,opacity] duration-[calc(520ms*var(--kf-speed,1))] ease-spring",
    "data-starting-style:translate-y-[calc(0.5rem+0.5rem*var(--kf-flourish,1))] data-starting-style:opacity-0 data-starting-style:transition-none",
    "motion-reduce:transition-none!",
  ),
  "min-w-0 shrink-0",
)

export const contentClass = "flex min-h-full flex-col justify-end gap-[var(--message-scroller-gap,1rem)] p-[var(--message-scroller-padding,1rem)]"

/* Jump to latest: out of sight it waits below the edge, small and blurred; once the reader scrolls
   away it rises with a pop. Then the Keyframery look: a small key centred over the bottom edge. */
export const buttonClass = cn(
  cn(
    "origin-bottom [transition:translate_calc(460ms*var(--kf-speed,1))_var(--ease-pop),scale_calc(460ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house),filter_calc(260ms*var(--kf-speed,1))_var(--ease-house)]",
    "not-data-visible:pointer-events-none not-data-visible:translate-y-[calc(0.5rem+0.25rem*var(--kf-flourish,1))] not-data-visible:scale-[calc(0.95-0.15*var(--kf-flourish,1))] not-data-visible:opacity-0 not-data-visible:blur-[calc(4px*var(--kf-flourish,1))]",
    "not-data-visible:[transition:translate_calc(180ms*var(--kf-speed,1))_var(--ease-house),scale_calc(180ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house),filter_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
    "active:scale-[calc(1-0.04*var(--kf-flourish,1))] motion-reduce:[transition:none]!",
  ),
  cn(
    "absolute bottom-3 left-1/2 z-10 inline-flex h-[var(--message-scroller-height,2rem)] -translate-x-1/2 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[var(--message-scroller-face,var(--background))] ps-2.5 pe-3.5",
    "text-[length:var(--message-scroller-font,12.5px)] leading-none font-medium whitespace-nowrap text-[color:var(--message-scroller-ink,var(--foreground))] outline-none select-none [&_svg]:size-[var(--message-scroller-icon-size,0.875rem)] [&_svg]:shrink-0",
    "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_2px_4px_-1px_rgb(0_0_0/0.08),0_8px_20px_-6px_rgb(0_0_0/0.18)]",
    "dark:bg-[var(--message-scroller-face,var(--accent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),inset_0_1px_0_rgb(255_255_255/0.08),0_8px_20px_-6px_rgb(0_0_0/0.7)]",
    "hover:bg-[color-mix(in_oklab,var(--background),var(--foreground)_3%)] dark:hover:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_7%)]",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "has-data-unread:bg-[var(--message-scroller-unread-face,var(--primary))] has-data-unread:text-primary-foreground dark:has-data-unread:bg-[var(--message-scroller-unread-face,var(--primary))]",
    "has-data-unread:hover:bg-[color-mix(in_oklab,var(--primary),var(--background)_10%)]",
    "rtl:translate-x-1/2",
  ),
)
