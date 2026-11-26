/* The class strings the menubar's menu parts share, as in the React primitive and ui files. */
import { cn } from "@/lib/utils"

/* Unfold + Cascade + Glide, shared by the content and its submenus (the primitive). */
export const primitiveSheet = cn(
  "group/kf-menu origin-(--transform-origin)",
  "[transition:opacity_calc(380ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(380ms*var(--kf-speed,1))_var(--ease-spring),translate_calc(380ms*var(--kf-speed,1))_var(--ease-spring),filter_calc(380ms*var(--kf-speed,1))_var(--ease-spring)]",
  "data-[side=bottom]:[--kf-from:0_-8px] data-[side=top]:[--kf-from:0_8px] data-[side=left]:[--kf-from:8px_0] data-[side=right]:[--kf-from:-8px_0]",
  "data-[side=inline-end]:[--kf-from:-8px_0] data-[side=inline-start]:[--kf-from:8px_0]",
  "data-starting-style:[translate:var(--kf-from,0_0)] data-starting-style:scale-[calc(0.95-0.09*var(--kf-flourish,1))] data-starting-style:opacity-0 data-starting-style:blur-[calc(6px*var(--kf-flourish,1))]",
  "data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:blur-[calc(2px*var(--kf-flourish,1))]",
  "data-ending-style:[transition:opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house),scale_calc(150ms*var(--kf-speed,1))_var(--ease-house),translate_calc(150ms*var(--kf-speed,1))_var(--ease-house),filter_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
  "[&>*:not([data-slot=menu-content])]:transition-[opacity,translate,filter] [&>*:not([data-slot=menu-content])]:duration-[calc(420ms*var(--kf-speed,1)*var(--kf-flourish,1))] [&>*:not([data-slot=menu-content])]:ease-spring",
  "[&>*:not([data-slot=menu-content])]:[transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1))*var(--kf-flourish,1))]",
  "data-starting-style:[&>*:not([data-slot=menu-content])]:translate-y-2 data-starting-style:[&>*:not([data-slot=menu-content])]:opacity-0 data-starting-style:[&>*:not([data-slot=menu-content])]:blur-[4px]",
  "data-ending-style:[&>*:not([data-slot=menu-content])]:[transition-delay:0ms]",
  "motion-reduce:[&>*:not([data-slot=menu-content])]:[translate:none]! motion-reduce:[&>*:not([data-slot=menu-content])]:[filter:none]! data-starting-style:[&>*:not([data-slot=menu-content])]:[transition:none]",
  "relative isolate [anchor-scope:--kf-hl]",
  "before:pointer-events-none before:absolute before:-z-10 before:hidden before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
  "before:[position-anchor:--kf-hl] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
  "before:[transition:top_calc(260ms*var(--kf-speed,1))_var(--ease-spring),right_calc(260ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(260ms*var(--kf-speed,1))_var(--ease-spring),left_calc(260ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
  "has-[[data-highlighted],[data-slot=menu-trigger][data-open]]:before:block starting:before:opacity-0",
  "motion-reduce:[transition:none]! motion-reduce:before:[transition:none]! motion-reduce:[&>*]:[transition:none]",
)

/* The sheet's look: the highlight's colour and radius, red under a destructive row. */
export const sheetLook = cn(
  "m-0 max-h-(--available-height) min-w-44 overflow-y-auto overscroll-contain border-0 p-1.5 outline-none",
  "rounded-[var(--menubar-radius,14px)] bg-[var(--menubar-surface,var(--popover))] text-[color:var(--menubar-ink,var(--popover-foreground))]",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
  "before:rounded-[var(--menubar-item-radius,8px)] before:bg-[var(--menubar-highlight,var(--accent))]",
  "has-[[data-destructive][data-highlighted]]:before:bg-[color-mix(in_oklab,var(--menubar-danger,var(--destructive))_10%,transparent)]",
  "has-[[data-disabled][data-highlighted]]:before:bg-[color-mix(in_oklab,var(--menubar-highlight,var(--accent))_50%,transparent)]",
)

/* One row for every kind of item; the sheet's highlight glides under it. */
export const rowLook = cn(
  "relative flex min-h-8 cursor-default items-center gap-2 rounded-[var(--menubar-item-radius,8px)] px-2 py-1.5 text-[13px] leading-4 outline-none select-none",
  "data-highlighted:text-[color:var(--menubar-ink,var(--accent-foreground))]",
  "data-disabled:text-muted-foreground/60 data-disabled:data-highlighted:text-muted-foreground/60",
  "[[data-has-icons]>&:not([data-has-icon])]:ps-8 [[data-has-icons]>[role=group]>&:not([data-has-icon])]:ps-8",
)

/* A row anchors the highlight while it is highlighted (the primitive). */
export const primitiveRow = "data-highlighted:[anchor-name:--kf-hl]"
