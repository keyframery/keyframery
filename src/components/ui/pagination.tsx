"use client"

export * from "@/components/primitives/pagination"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --pagination-track: Pagination well (default: --muted)
   --pagination-key: Current page key (default: --background, --accent in dark)
   --pagination-ink: Page labels (default: --muted-foreground)
   --pagination-selected-ink: Current and hovered page (default: --foreground)
   --pagination-size: Page height and least width (default: 2rem)
   --pagination-radius: Well corners (default: 12px)
   --pagination-key-radius: Page corners (default: 9px)
   --pagination-gap: Page gap (default: 0.125rem)
*/

/* Styled pagination: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Pagination as PaginationRoot,
  PaginationEllipsis as PaginationEllipsisPart,
  PaginationFirst as PaginationFirstPart,
  PaginationItem as PaginationItemPart,
  PaginationLast as PaginationLastPart,
  PaginationLink as PaginationLinkPart,
  PaginationList as PaginationListPart,
  PaginationNext as PaginationNextPart,
  PaginationPrevious as PaginationPreviousPart,
  PaginationRoll,
  createPaginationController,
  paginationRange,
} from "@/components/primitives/pagination"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Every button in the row shares one box. */
const pageBox =
  "relative inline-flex h-[var(--pagination-size,2rem)] min-w-[var(--pagination-size,2rem)] shrink-0 cursor-pointer items-center justify-center gap-1 rounded-[var(--pagination-key-radius,9px)] px-2 text-[13px] leading-none font-medium text-[color:var(--pagination-ink,var(--muted-foreground))] tabular-nums whitespace-nowrap outline-none select-none [&_svg]:size-4 [&_svg]:shrink-0"

/* The primitive springs a pressed button back; this colours the hover. */
const press =
  "transition-[color,background-color,scale] duration-[calc(200ms*var(--kf-speed,1))] hover:text-[color:var(--pagination-selected-ink,var(--foreground))] " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted motion-reduce:transition-none!"

/* A step that has reached its end stays focusable but reads as unavailable. */
const step = cn(
  pageBox,
  press,
  "hover:bg-foreground/[0.045] data-disabled:cursor-default data-disabled:opacity-40 data-disabled:hover:bg-transparent data-disabled:hover:text-[color:var(--pagination-ink,var(--muted-foreground))]",
)

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9.5 3.5 5 8l4.5 4.5" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6.5 3.5 11 8l-4.5 4.5" />
    </svg>
  )
}

function ChevronsLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 3.5 3.5 8 8 12.5M12.5 3.5 8 8l4.5 4.5" />
    </svg>
  )
}

function ChevronsRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 3.5 12.5 8 8 12.5M3.5 3.5 8 8l-4.5 4.5" />
    </svg>
  )
}

function Pagination({ speed, className, ...props }: React.ComponentProps<typeof PaginationRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <PaginationRoot className={withClass("flex w-fit", className)} {...props} />
    </Speed>
  )
}

/* The row is a well, and the current-page key the primitive glides along it is a raised key.
   Without children it lays out Previous, the pages with their gaps, and Next. */
function PaginationList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationListPart>) {
  return (
    <PaginationListPart
      className={withClass(
        cn(
          "flex items-center gap-[var(--pagination-gap,0.125rem)] rounded-[var(--pagination-radius,12px)] bg-[var(--pagination-track,var(--muted))] p-1",
          "shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)]",
          "dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
          "before:rounded-[var(--pagination-key-radius,9px)] before:bg-[var(--pagination-key,var(--background))] before:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
          "dark:before:bg-[var(--pagination-key,var(--accent))] dark:before:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
        ),
        className,
      )}
      {...props}
    >
      {children ??
        (({ items }) => (
          <>
            <PaginationItem>
              <PaginationPrevious />
            </PaginationItem>
            {items.map((item) => (
              <PaginationItem key={item}>
                {typeof item === "number" ? <PaginationLink page={item} /> : <PaginationEllipsis />}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </>
        ))}
    </PaginationListPart>
  )
}

function PaginationItem({ className, ...props }: React.ComponentProps<typeof PaginationItemPart>) {
  return <PaginationItemPart className={withClass("flex", className)} {...props} />
}

/* A page. The current one sits on the key the list glides under it, so it only darkens its number. */
function PaginationLink({ className, ...props }: React.ComponentProps<typeof PaginationLinkPart>) {
  return (
    <PaginationLinkPart
      className={withClass(
        cn(
          pageBox,
          press,
          "data-current:text-[color:var(--pagination-selected-ink,var(--foreground))] data-current:cursor-default",
        ),
        className,
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationPreviousPart>) {
  return (
    <PaginationPreviousPart
      aria-label={children ? undefined : "Previous page"}
      className={withClass(step, className)}
      {...props}
    >
      {children ?? <ChevronLeftIcon />}
    </PaginationPreviousPart>
  )
}

function PaginationNext({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationNextPart>) {
  return (
    <PaginationNextPart
      aria-label={children ? undefined : "Next page"}
      className={withClass(step, className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </PaginationNextPart>
  )
}

function PaginationFirst({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationFirstPart>) {
  return (
    <PaginationFirstPart
      aria-label={children ? undefined : "First page"}
      className={withClass(step, className)}
      {...props}
    >
      {children ?? <ChevronsLeftIcon />}
    </PaginationFirstPart>
  )
}

function PaginationLast({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationLastPart>) {
  return (
    <PaginationLastPart
      aria-label={children ? undefined : "Last page"}
      className={withClass(step, className)}
      {...props}
    >
      {children ?? <ChevronsRightIcon />}
    </PaginationLastPart>
  )
}

/* The gap: three quiet dots in a page-sized box. */
function PaginationEllipsis({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationEllipsisPart>) {
  return (
    <PaginationEllipsisPart
      className={withClass("inline-flex h-[var(--pagination-size,2rem)] w-6 items-center justify-center text-[color:color-mix(in_oklab,var(--pagination-ink,var(--muted-foreground))_70%,transparent)] select-none [&_svg]:size-4", className)}
      {...props}
    >
      {children ?? (
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <circle cx="3.5" cy="8" r="1" />
          <circle cx="8" cy="8" r="1" />
          <circle cx="12.5" cy="8" r="1" />
        </svg>
      )}
    </PaginationEllipsisPart>
  )
}

export {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
  PaginationRoll,
  createPaginationController,
  paginationRange,
}
