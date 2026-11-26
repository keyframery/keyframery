"use client"

/* Animated items, on UI SDK's core. UI SDK ships no item, so the behaviour is defined in
   `@/components/core/item` with `definePrimitive` and rendered here. `ItemSeparator` is UI SDK's
   own Separator. This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Cascade: items arrive one after another as they mount, rising out of a soft blur.
   - Glide: in a group, one highlight moves from row to row under the pointer or the keyboard
     focus, instead of each row lighting up on its own. Only rows that are links or buttons take it.
   - Press: a row that is a link or a button gives a little when pressed and springs back.
   - An image in `ItemMedia` clears out of a blur as it arrives; an icon in `ItemActions` nudges
     toward the reading direction while its row is hovered.
   The cascade, the line draw, the image clearing, the press depth and the nudge scale with
   --kf-flourish; at 0 the rows are simply there and the gliding highlight remains. */

import { createParts } from "@ui-sdk/react/primitive"
import { Separator as SeparatorPart } from "@ui-sdk/react/separator"
import * as React from "react"

import { item, itemGroup } from "@/components/core/item"
import { cn } from "@/lib/utils"

const {
  Root: ItemRoot,
  Media: ItemMediaPart,
  Content: ItemContent,
  Title: ItemTitle,
  Description: ItemDescription,
  Actions: ItemActionsPart,
  Header: ItemHeader,
  Footer: ItemFooter,
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
const { Root: ItemGroupRoot } = createParts(itemGroup, { root: "div" })

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const keyframes =
  "@keyframes kf-item-in{from{opacity:0;translate:0 10px;filter:blur(5px)}}" +
  "@keyframes kf-item-image{from{opacity:0;scale:1.12;filter:blur(8px)}}" +
  "@keyframes kf-item-line{from{scale:0 1}}"

function Keyframes() {
  return (
    <style href="kf-item" precedence="default">
      {keyframes}
    </style>
  )
}

function Item({ className, ...props }: React.ComponentProps<typeof ItemRoot>) {
  return (
    <>
      <Keyframes />
      <ItemRoot
        className={withClass(
          cn(
            "group/item",
            /* Cascade on mount: each row a beat after the one before it. */
            "animate-[kf-item-in_calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
            "[animation-delay:calc((min(sibling-index(),10)-1)*calc(45ms*var(--kf-speed,1))*var(--kf-flourish,1))]",
            /* Press, for a row that does something. */
            "[&:is(a,button)]:transition-[scale,background-color] [&:is(a,button)]:duration-[calc(220ms*var(--kf-speed,1))] [&:is(a,button)]:ease-pop",
            "[&:is(a,button)]:active:scale-[calc(1-0.015*var(--kf-flourish,1))] [&:is(a,button)]:active:duration-[calc(90ms*var(--kf-speed,1))] [&:is(a,button)]:active:ease-house",
            /* Glide: the hovered or focused row in a group names the anchor the highlight follows. */
            "in-data-[slot=item-group]:[&:is(a,button)]:data-hovered:[anchor-name:--kf-item] in-data-[slot=item-group]:[&:is(a,button)]:focus-visible:[anchor-name:--kf-item]",
            "in-data-[slot=item-group]:first:[anchor-name:--kf-item-rest]",
            "in-data-[slot=item-group]:first:[&:is(a,button)]:data-hovered:[anchor-name:--kf-item,--kf-item-rest] in-data-[slot=item-group]:first:[&:is(a,button)]:focus-visible:[anchor-name:--kf-item,--kf-item-rest]",
            "motion-reduce:animate-none! motion-reduce:transition-none!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

/* The highlight is the group's own `before:`, anchored to whichever row names `--kf-item`. With no
   row named for a moment (the pointer between rows), it rests on the first row instead of jumping. */
function ItemGroup({ className, ...props }: React.ComponentProps<typeof ItemGroupRoot>) {
  return (
    <ItemGroupRoot
      className={withClass(
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
        className,
      )}
      {...props}
    />
  )
}

/* UI SDK's Separator, drawn out from its centre as it arrives, in step with the rows around it. */
function ItemSeparator({ className, ...props }: React.ComponentProps<typeof SeparatorPart>) {
  return (
    <>
      <Keyframes />
      <SeparatorPart
        orientation="horizontal"
        className={withClass(
          cn(
            "origin-center animate-[kf-item-line_calc(640ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
            "[animation-delay:calc((min(sibling-index(),10)-1)*calc(45ms*var(--kf-speed,1))*var(--kf-flourish,1))]",
            /* The highlight covers the row; the lines on either side of it step out of its way. */
            "transition-opacity duration-[calc(200ms*var(--kf-speed,1))] ease-house",
            "[[data-slot=item]:is(a,button):is([data-hovered],:focus-visible)+&]:opacity-0 [&:has(+[data-slot=item]:is(a,button):is([data-hovered],:focus-visible))]:opacity-0",
            "motion-reduce:animate-none! motion-reduce:transition-none!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

function ItemMedia({ className, ...props }: React.ComponentProps<typeof ItemMediaPart>) {
  return (
    <ItemMediaPart
      className={withClass(
        cn(
          "data-[variant=image]:[&_img]:animate-[kf-item-image_calc(700ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_backwards]",
          "data-[variant=image]:[&_img]:[animation-delay:calc(60ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
          "motion-reduce:[&_img]:animate-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* An icon placed straight in the actions (a chevron, an arrow) leans 2px toward where the row
   leads while it is hovered or focused; in right to left it leans the other way. */
function ItemActions({ className, ...props }: React.ComponentProps<typeof ItemActionsPart>) {
  return (
    <ItemActionsPart
      className={withClass(
        cn(
          "[&>svg]:transition-[translate] [&>svg]:duration-[calc(320ms*var(--kf-speed,1))] [&>svg]:ease-spring",
          "group-data-hovered/item:[&>svg]:translate-x-[calc(0.125rem*var(--kf-flourish,1))] group-focus-visible/item:[&>svg]:translate-x-[calc(0.125rem*var(--kf-flourish,1))]",
          "rtl:group-data-hovered/item:[&>svg]:-translate-x-[calc(0.125rem*var(--kf-flourish,1))] rtl:group-focus-visible/item:[&>svg]:-translate-x-[calc(0.125rem*var(--kf-flourish,1))]",
          "motion-reduce:[&>svg]:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
}
