"use client"

export * from "@/components/primitives/description-list"

/* Styled description list: the animated primitive plus the Keyframery look. The label and value rows
   of a detail page. `layout="rows"` puts the labels in a fixed column with hairlines between items,
   `"stacked"` puts each label above its value, `"grid"` lays items in two or three columns. Every
   layout falls back to stacked when the list is narrower than 28rem (a container query), so it
   reflows on a phone without a prop.

   Theming: set these CSS variables on the list or anything around it. Each falls back to the
   theme's own token, so nothing changes until you set one.
     --description-list-term    the labels                   (default: --muted-foreground)
     --description-list-ink     the values                   (default: --foreground)
     --description-list-rule    the hairlines between rows   (default: --border)
     --description-list-label   the label column in rows     (default: 10rem)
     --description-list-gap     the space above and below an item (default: 0.75rem)
     --description-list-font    the values' size             (default: 13px) */

import * as React from "react"

import {
  DescriptionList as DescriptionListPrimitive,
  DescriptionListActions as DescriptionListActionsPrimitive,
  DescriptionListCopy as DescriptionListCopyPrimitive,
  DescriptionListDetails as DescriptionListDetailsPrimitive,
  DescriptionListItem as DescriptionListItemPrimitive,
  DescriptionListTerm as DescriptionListTermPrimitive,
  DescriptionListValue as DescriptionListValuePrimitive,
} from "@/components/primitives/description-list"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK parts take a class name or a function of the part's state. Keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function DescriptionList({ speed, className, ...props }: React.ComponentProps<typeof DescriptionListPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <DescriptionListPrimitive
        className={withClass(
          cn(
            "@container/dl grid w-full min-w-0 text-[length:var(--description-list-font,13px)] leading-[1.45]",
            /* Grid: the given number of columns while each can be at least 11rem wide, fewer below that. */
            "data-[layout=grid]:gap-x-8 data-[layout=grid]:gap-y-1",
            "data-[layout=grid]:grid-cols-[repeat(auto-fill,minmax(max(11rem,calc((100%-(var(--description-list-columns,2)-1)*2rem)/var(--description-list-columns,2))),1fr))]",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

function DescriptionListItem({ className, ...props }: React.ComponentProps<typeof DescriptionListItemPrimitive>) {
  return (
    <DescriptionListItemPrimitive
      className={withClass(
        cn(
          "flex min-w-0 flex-col gap-1 py-[var(--description-list-gap,0.75rem)]",
          /* Rows and stacked: hairlines between items. */
          "not-data-[layout=grid]:border-b not-data-[layout=grid]:border-[color:var(--description-list-rule,var(--border))] not-data-[layout=grid]:last:border-b-0",
          /* Rows: a fixed label column once there is room. */
          "@md/dl:data-[layout=rows]:grid @md/dl:data-[layout=rows]:grid-cols-[var(--description-list-label,10rem)_minmax(0,1fr)] @md/dl:data-[layout=rows]:items-baseline @md/dl:data-[layout=rows]:gap-4",
        ),
        className,
      )}
      {...props}
    />
  )
}

function DescriptionListTerm({ className, ...props }: React.ComponentProps<typeof DescriptionListTermPrimitive>) {
  return (
    <DescriptionListTermPrimitive
      className={withClass("text-[12px] leading-[1.45] font-medium text-[color:var(--description-list-term,var(--muted-foreground))]", className)}
      {...props}
    />
  )
}

/* The value cell: the value, then any actions at its end. */
function DescriptionListDetails({ className, ...props }: React.ComponentProps<typeof DescriptionListDetailsPrimitive>) {
  return (
    <DescriptionListDetailsPrimitive
      className={withClass(
        "flex min-h-7 min-w-0 items-center gap-2 text-[color:var(--description-list-ink,var(--foreground))] tabular-nums",
        className,
      )}
      {...props}
    />
  )
}

function DescriptionListValue({ className, ...props }: React.ComponentProps<typeof DescriptionListValuePrimitive>) {
  return (
    <DescriptionListValuePrimitive
      className={withClass("min-w-0 flex-1 [overflow-wrap:anywhere] data-truncate:truncate", className)}
      {...props}
    />
  )
}

function DescriptionListActions({ className, ...props }: React.ComponentProps<typeof DescriptionListActionsPrimitive>) {
  return (
    <DescriptionListActionsPrimitive
      className={withClass("-my-1 ml-auto flex shrink-0 items-center gap-1", className)}
      {...props}
    />
  )
}

/* A quiet square key; copied, it turns the success green for as long as it says so. */
function DescriptionListCopy({ className, ...props }: React.ComponentProps<typeof DescriptionListCopyPrimitive>) {
  return (
    <DescriptionListCopyPrimitive
      className={withClass(
        cn(
          "grid size-7 shrink-0 cursor-pointer place-items-center rounded-[7px] text-muted-foreground outline-none",
          "hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring",
          "data-copied:text-[oklch(0.62_0.16_150)] data-copied:hover:text-[oklch(0.62_0.16_150)]",
        ),
        className,
      )}
      {...props}
    />
  )
}

export {
  DescriptionList,
  DescriptionListActions,
  DescriptionListCopy,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
  DescriptionListValue,
}
