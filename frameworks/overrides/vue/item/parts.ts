/* UI SDK parts for item, made once from the shared core definition (the same file React uses).
   ItemSeparator is UI SDK's own Separator. */
import { createParts } from "@ui-sdk/vue/primitive"

import { item, itemGroup } from "@/components/keyframery/core/item-core"
import { cn } from "@/lib/utils"

const keyframes =
  "@keyframes kf-item-in{from{opacity:0;translate:0 10px;filter:blur(5px)}}" +
  "@keyframes kf-item-image{from{opacity:0;scale:1.12;filter:blur(8px)}}" +
  "@keyframes kf-item-line{from{scale:0 1}}"
if (typeof document !== "undefined" && !document.getElementById("kf-item")) {
  const s = document.createElement("style")
  s.id = "kf-item"
  s.textContent = keyframes
  document.head.append(s)
}

export const {
  Root: ItemRoot,
  Media: ItemMediaPart,
  Content: ItemContentPart,
  Title: ItemTitlePart,
  Description: ItemDescriptionPart,
  Actions: ItemActionsPart,
  Header: ItemHeaderPart,
  Footer: ItemFooterPart,
} = createParts(item, {
  root: "div",
  media: "div",
  content: "div",
  title: "div",
  description: "p",
  actions: "div",
  header: "div",
  footer: "div",
})
export const { Root: ItemGroupRoot } = createParts(itemGroup, { root: "div" })

/* Primitive motion, then the Keyframery look, per part (React: primitives/item.tsx, ui/item.tsx). */
export const itemClass = cn(
  cn(
    "group/item",
    "animate-[kf-item-in_calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
    "[animation-delay:calc((min(sibling-index(),10)-1)*calc(45ms*var(--kf-speed,1))*var(--kf-flourish,1))]",
    "[&:is(a,button)]:transition-[scale,background-color] [&:is(a,button)]:duration-[calc(220ms*var(--kf-speed,1))] [&:is(a,button)]:ease-pop",
    "[&:is(a,button)]:active:scale-[calc(1-0.015*var(--kf-flourish,1))] [&:is(a,button)]:active:duration-[calc(90ms*var(--kf-speed,1))] [&:is(a,button)]:active:ease-house",
    "in-data-[slot=item-group]:[&:is(a,button)]:data-hovered:[anchor-name:--kf-item] in-data-[slot=item-group]:[&:is(a,button)]:focus-visible:[anchor-name:--kf-item]",
    "in-data-[slot=item-group]:first:[anchor-name:--kf-item-rest]",
    "in-data-[slot=item-group]:first:[&:is(a,button)]:data-hovered:[anchor-name:--kf-item,--kf-item-rest] in-data-[slot=item-group]:first:[&:is(a,button)]:focus-visible:[anchor-name:--kf-item,--kf-item-rest]",
    "motion-reduce:animate-none! motion-reduce:transition-none!",
  ),
  cn(
    "flex flex-wrap items-center rounded-[var(--item-radius,12px)] text-[13px] text-[color:var(--item-ink,var(--foreground))] outline-none",
    "data-[size=default]:gap-[var(--item-gap,0.875rem)] data-[size=default]:p-[var(--item-padding,0.875rem)] data-[size=sm]:gap-3 data-[size=sm]:px-3 data-[size=sm]:py-2.5",
    "data-[variant=outline]:shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.04)] dark:data-[variant=outline]:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
    "data-[variant=muted]:bg-[var(--item-face,color-mix(in_oklab,var(--muted)_60%,transparent))] data-[variant=default]:bg-[var(--item-face,transparent)] data-[variant=outline]:bg-[var(--item-face,transparent)]",
    "[&:is(a,button)]:cursor-pointer [&:is(a,button)]:text-left [&:is(a,button)]:data-hovered:bg-foreground/[0.035]",
    "in-data-[slot=item-group]:[&:is(a,button)]:data-hovered:bg-[var(--item-face,transparent)]",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
  ),
)

export const itemGroupClass = cn(
  cn(
    "relative isolate [anchor-scope:--kf-item,--kf-item-rest]",
    "before:pointer-events-none before:absolute before:-z-10 before:rounded-[inherit] before:opacity-0",
    "before:bg-[color-mix(in_oklch,currentColor_6%,transparent)]",
    "before:[position-anchor:--kf-item]",
    "before:top-[anchor(--kf-item_top,anchor(--kf-item-rest_top))] before:right-[anchor(--kf-item_right,anchor(--kf-item-rest_right))]",
    "before:bottom-[anchor(--kf-item_bottom,anchor(--kf-item-rest_bottom))] before:left-[anchor(--kf-item_left,anchor(--kf-item-rest_left))]",
    "before:[transition:top_calc(300ms*var(--kf-speed,1))_var(--ease-spring),right_calc(300ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(300ms*var(--kf-speed,1))_var(--ease-spring),left_calc(300ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(180ms*var(--kf-speed,1))_var(--ease-house)]",
    "has-[[data-slot=item]:is(a,button)[data-hovered],[data-slot=item]:is(a,button):focus-visible]:before:opacity-100",
    "motion-reduce:before:[transition:opacity_0s]!",
  ),
  cn("flex flex-col rounded-[var(--item-radius,12px)]", "before:bg-foreground/[0.045] dark:before:bg-foreground/[0.06]"),
)

export const itemSeparatorClass = cn(
  cn(
    "origin-center animate-[kf-item-line_calc(640ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
    "[animation-delay:calc((min(sibling-index(),10)-1)*calc(45ms*var(--kf-speed,1))*var(--kf-flourish,1))]",
    "transition-opacity duration-[calc(200ms*var(--kf-speed,1))] ease-house",
    "[[data-slot=item]:is(a,button):is([data-hovered],:focus-visible)+&]:opacity-0 [&:has(+[data-slot=item]:is(a,button):is([data-hovered],:focus-visible))]:opacity-0",
    "motion-reduce:animate-none! motion-reduce:transition-none!",
  ),
  "mx-3.5 h-px shrink-0 bg-border",
)

export const itemMediaClass = cn(
  cn(
    "data-[variant=image]:[&_img]:animate-[kf-item-image_calc(700ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_backwards]",
    "data-[variant=image]:[&_img]:[animation-delay:calc(60ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
    "motion-reduce:[&_img]:animate-none!",
  ),
  cn(
    "flex shrink-0 items-center justify-center gap-2 [&_svg]:pointer-events-none",
    "group-has-[[data-slot=item-description]]/item:self-start",
    "data-[variant=icon]:size-9 data-[variant=icon]:rounded-[10px] data-[variant=icon]:bg-muted data-[variant=icon]:text-[color:var(--item-ink,var(--foreground))] data-[variant=icon]:[&_svg]:size-4",
    "data-[variant=icon]:shadow-[inset_0_1px_2px_rgb(0_0_0/0.06),inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:data-[variant=icon]:shadow-[inset_0_1px_2px_rgb(0_0_0/0.45),inset_0_0_0_1px_rgb(255_255_255/0.05)]",
    "data-[variant=image]:size-10 data-[variant=image]:overflow-hidden data-[variant=image]:rounded-[10px] data-[variant=image]:bg-muted data-[variant=image]:[&_img]:size-full data-[variant=image]:[&_img]:object-cover",
    "data-[variant=image]:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)] dark:data-[variant=image]:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]",
  ),
)

export const itemContentClass = "flex min-w-0 flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none"
export const itemTitleClass = "flex w-fit items-center gap-2 text-[length:var(--item-font,13.5px)] leading-[1.3] font-medium tracking-[-0.005em]"
export const itemDescriptionClass = cn(
  "line-clamp-2 text-[12.5px] leading-[1.45] text-[color:var(--item-muted,var(--muted-foreground))]",
  "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-[color:var(--item-ink,var(--foreground))]",
)
export const itemActionsClass = cn(
  cn(
    "[&>svg]:transition-[translate] [&>svg]:duration-[calc(320ms*var(--kf-speed,1))] [&>svg]:ease-spring",
    "group-data-hovered/item:[&>svg]:translate-x-[calc(0.125rem*var(--kf-flourish,1))] group-focus-visible/item:[&>svg]:translate-x-[calc(0.125rem*var(--kf-flourish,1))]",
    "rtl:group-data-hovered/item:[&>svg]:-translate-x-[calc(0.125rem*var(--kf-flourish,1))] rtl:group-focus-visible/item:[&>svg]:-translate-x-[calc(0.125rem*var(--kf-flourish,1))]",
    "motion-reduce:[&>svg]:transition-none!",
  ),
  "flex items-center gap-2 [&>svg]:size-4 [&>svg]:text-[color:var(--item-muted,var(--muted-foreground))]",
)
export const itemHeaderClass = "flex basis-full items-center justify-between gap-2"
export const itemFooterClass = "flex basis-full items-center justify-between gap-2"
