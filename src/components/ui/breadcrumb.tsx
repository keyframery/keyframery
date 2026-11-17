"use client"

export * from "@/components/primitives/breadcrumb"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --breadcrumb-ink: Link colour; default: text-muted-foreground.
   --breadcrumb-current: Current page; default: text-foreground.
   --breadcrumb-separator: Separator colour; default: text-muted-foreground/60.
   --breadcrumb-font: Label size; default: text-[13px].
   --breadcrumb-gap: Trail gap; default: gap-1.
   --breadcrumb-item-gap: Icon gap; default: gap-1.5.
   --breadcrumb-icon-size: Icon size; default: size-3.5.
   --breadcrumb-radius: Link corners; default: rounded-[4px].
*/

/* Styled breadcrumb: the animated primitive plus the Keyframery look. Quiet links in the muted colour,
   the current page in the foreground, small chevrons between them. */

import * as React from "react"

import {
  Breadcrumb as BreadcrumbPrimitive,
  BreadcrumbEllipsis as BreadcrumbEllipsisPrimitive,
  BreadcrumbItem as BreadcrumbItemPrimitive,
  BreadcrumbLink as BreadcrumbLinkPrimitive,
  BreadcrumbList as BreadcrumbListPrimitive,
  BreadcrumbPage as BreadcrumbPagePrimitive,
  BreadcrumbSeparator as BreadcrumbSeparatorPrimitive,
} from "@/components/primitives/breadcrumb"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Breadcrumb({ speed, ...props }: React.ComponentProps<typeof BreadcrumbPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <BreadcrumbPrimitive {...props} />
    </Speed>
  )
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<typeof BreadcrumbListPrimitive>) {
  return (
    <BreadcrumbListPrimitive
      className={withClass("flex min-w-0 flex-wrap items-center gap-[var(--breadcrumb-gap,0.25rem)] text-[length:var(--breadcrumb-font,13px)] leading-5 break-words text-[color:var(--breadcrumb-ink,var(--muted-foreground))]", className)}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<typeof BreadcrumbItemPrimitive>) {
  return <BreadcrumbItemPrimitive className={withClass("inline-flex min-w-0 items-center gap-[var(--breadcrumb-item-gap,0.375rem)]", className)} {...props} />
}

function BreadcrumbLink({ className, ...props }: React.ComponentProps<typeof BreadcrumbLinkPrimitive>) {
  return (
    <BreadcrumbLinkPrimitive
      className={withClass(
        cn(
          "inline-flex items-center gap-[var(--breadcrumb-item-gap,0.375rem)] rounded-[var(--breadcrumb-radius,4px)] outline-none hover:text-[color:var(--breadcrumb-current,var(--foreground))] focus-visible:text-[color:var(--breadcrumb-current,var(--foreground))] [&_svg]:size-[var(--breadcrumb-icon-size,0.875rem)] [&_svg]:shrink-0",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ),
        className,
      )}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<typeof BreadcrumbPagePrimitive>) {
  return (
    <BreadcrumbPagePrimitive
      className={withClass("inline-flex items-center gap-[var(--breadcrumb-item-gap,0.375rem)] font-medium text-[color:var(--breadcrumb-current,var(--foreground))] [&_svg]:size-[var(--breadcrumb-icon-size,0.875rem)] [&_svg]:shrink-0", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({ className, ...props }: React.ComponentProps<typeof BreadcrumbSeparatorPrimitive>) {
  return (
    <BreadcrumbSeparatorPrimitive
      className={withClass("inline-flex text-[color:var(--breadcrumb-separator,color-mix(in_oklab,var(--muted-foreground)_60%,transparent))] [&>svg]:size-[var(--breadcrumb-icon-size,0.875rem)]", className)}
      {...props}
    />
  )
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<typeof BreadcrumbEllipsisPrimitive>) {
  return (
    <BreadcrumbEllipsisPrimitive
      className={withClass("flex size-6 items-center justify-center [&>svg]:size-4", className)}
      {...props}
    />
  )
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
