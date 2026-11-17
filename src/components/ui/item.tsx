"use client"

export * from "@/components/primitives/item"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --item-face: Muted row surface; default: bg-muted/60.
   --item-ink: Row text; default: text-foreground.
   --item-muted: Row details; default: text-muted-foreground.
   --item-radius: Row corners; default: rounded-[12px].
   --item-font: Title size; default: text-[13.5px].
   --item-gap: Row gap; default: gap-3.5.
   --item-padding: Row padding; default: p-3.5.
*/

/* Styled items: the animated primitive plus the Keyframery look. A row of content that can stay
   plain, sit on a hairline (`outline`) or a soft fill (`muted`), or become a link with `render`.
   In a group the rows share one highlight that glides between them. */

import * as React from "react"

import {
  Item as ItemPrimitive,
  ItemActions as ItemActionsPrimitive,
  ItemContent as ItemContentPrimitive,
  ItemDescription as ItemDescriptionPrimitive,
  ItemFooter as ItemFooterPrimitive,
  ItemGroup as ItemGroupPrimitive,
  ItemHeader as ItemHeaderPrimitive,
  ItemMedia as ItemMediaPrimitive,
  ItemSeparator as ItemSeparatorPrimitive,
  ItemTitle as ItemTitlePrimitive,
} from "@/components/primitives/item"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Item({ speed, className, ...props }: React.ComponentProps<typeof ItemPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <ItemPrimitive
        className={withClass(
          cn(
            "flex flex-wrap items-center rounded-[var(--item-radius,12px)] text-[13px] text-[color:var(--item-ink,var(--foreground))] outline-none",
            "data-[size=default]:gap-[var(--item-gap,0.875rem)] data-[size=default]:p-[var(--item-padding,0.875rem)] data-[size=sm]:gap-3 data-[size=sm]:px-3 data-[size=sm]:py-2.5",
            "data-[variant=outline]:shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.04)] dark:data-[variant=outline]:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
            "data-[variant=muted]:bg-[var(--item-face,color-mix(in_oklab,var(--muted)_60%,transparent))] data-[variant=default]:bg-[var(--item-face,transparent)] data-[variant=outline]:bg-[var(--item-face,transparent)]",
            /* A row that is a link or a button. Alone it lights up under the pointer; in a group the
               group's gliding highlight does that instead. */
            "[&:is(a,button)]:cursor-pointer [&:is(a,button)]:text-left [&:is(a,button)]:data-hovered:bg-foreground/[0.035]",
            "in-data-[slot=item-group]:[&:is(a,button)]:data-hovered:bg-[var(--item-face,transparent)]",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "aria-disabled:pointer-events-none aria-disabled:opacity-50",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

function ItemGroup({ className, ...props }: React.ComponentProps<typeof ItemGroupPrimitive>) {
  return (
    <ItemGroupPrimitive
      className={withClass(
        cn(
          "flex flex-col rounded-[var(--item-radius,12px)]",
          "before:bg-foreground/[0.045] dark:before:bg-foreground/[0.06]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ItemSeparator({ className, ...props }: React.ComponentProps<typeof ItemSeparatorPrimitive>) {
  return <ItemSeparatorPrimitive className={withClass("mx-3.5 h-px shrink-0 bg-border", className)} {...props} />
}

/* Media sits level with the title; with a description under the title it rides up to the top. */
function ItemMedia({ className, ...props }: React.ComponentProps<typeof ItemMediaPrimitive>) {
  return (
    <ItemMediaPrimitive
      className={withClass(
        cn(
          "flex shrink-0 items-center justify-center gap-2 [&_svg]:pointer-events-none",
          "group-has-[[data-slot=item-description]]/item:self-start",
          "data-[variant=icon]:size-9 data-[variant=icon]:rounded-[10px] data-[variant=icon]:bg-muted data-[variant=icon]:text-[color:var(--item-ink,var(--foreground))] data-[variant=icon]:[&_svg]:size-4",
          "data-[variant=icon]:shadow-[inset_0_1px_2px_rgb(0_0_0/0.06),inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:data-[variant=icon]:shadow-[inset_0_1px_2px_rgb(0_0_0/0.45),inset_0_0_0_1px_rgb(255_255_255/0.05)]",
          "data-[variant=image]:size-10 data-[variant=image]:overflow-hidden data-[variant=image]:rounded-[10px] data-[variant=image]:bg-muted data-[variant=image]:[&_img]:size-full data-[variant=image]:[&_img]:object-cover",
          "data-[variant=image]:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)] dark:data-[variant=image]:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.ComponentProps<typeof ItemContentPrimitive>) {
  return (
    <ItemContentPrimitive
      className={withClass("flex min-w-0 flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none", className)}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: React.ComponentProps<typeof ItemTitlePrimitive>) {
  return (
    <ItemTitlePrimitive
      className={withClass("flex w-fit items-center gap-2 text-[length:var(--item-font,13.5px)] leading-[1.3] font-medium tracking-[-0.005em]", className)}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.ComponentProps<typeof ItemDescriptionPrimitive>) {
  return (
    <ItemDescriptionPrimitive
      className={withClass(
        cn(
          "line-clamp-2 text-[12.5px] leading-[1.45] text-[color:var(--item-muted,var(--muted-foreground))]",
          "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-[color:var(--item-ink,var(--foreground))]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: React.ComponentProps<typeof ItemActionsPrimitive>) {
  return (
    <ItemActionsPrimitive
      className={withClass("flex items-center gap-2 [&>svg]:size-4 [&>svg]:text-[color:var(--item-muted,var(--muted-foreground))]", className)}
      {...props}
    />
  )
}

function ItemHeader({ className, ...props }: React.ComponentProps<typeof ItemHeaderPrimitive>) {
  return (
    <ItemHeaderPrimitive
      className={withClass("flex basis-full items-center justify-between gap-2", className)}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }: React.ComponentProps<typeof ItemFooterPrimitive>) {
  return (
    <ItemFooterPrimitive
      className={withClass("flex basis-full items-center justify-between gap-2", className)}
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
