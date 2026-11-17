"use client"

/* Animated breadcrumb, on UI SDK's core. UI SDK ships no breadcrumb, so the behaviour is defined in
   `@/components/core/breadcrumb` with `definePrimitive` and rendered here. This file adds motion only.
   Colours, radii, shadows and spacing stay yours.

   - Cascade: on first render the crumbs and separators arrive one after another from the left.
   - Direction: a crumb added later (you went one level deeper) slides in from the right with a blur,
     right away.
   - Draw: each separator's chevron draws itself as it arrives.
   - A link's underline grows from its start on hover or keyboard focus. */

import { createParts } from "@ui-sdk/react/primitive"
import * as React from "react"

import { breadcrumb } from "@/components/core/breadcrumb"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const {
  Root: BreadcrumbRoot,
  List: BreadcrumbListPart,
  Item: BreadcrumbItemPart,
  Link: BreadcrumbLinkPart,
  Page: BreadcrumbPagePart,
  Separator: BreadcrumbSeparatorPart,
  Ellipsis: BreadcrumbEllipsisPart,
} = createParts(breadcrumb, {
  root: "nav",
  list: "ol",
  item: "li",
  link: "a",
  page: "span",
  separator: "li",
  ellipsis: "span",
})

function Breadcrumb({ "aria-label": label = "Breadcrumb", ...props }: React.ComponentProps<typeof BreadcrumbRoot>) {
  return <BreadcrumbRoot aria-label={label} {...props} />
}

/* Holds the cascade's delays until the first crumbs are in; after that a new crumb arrives at once. */
function BreadcrumbList({ className, ...props }: React.ComponentProps<typeof BreadcrumbListPart>) {
  const ref = React.useRef<HTMLOListElement>(null)
  const [settled, setSettled] = React.useState(false)
  React.useEffect(() => {
    const el = ref.current
    const speed = (el && parseFloat(getComputedStyle(el).getPropertyValue("--kf-speed"))) || 1
    const timer = setTimeout(() => setSettled(true), 700 * speed)
    return () => clearTimeout(timer)
  }, [])
  return (
    <BreadcrumbListPart
      ref={ref}
      data-settled={settled || undefined}
      className={withClass("group/breadcrumb", className)}
      {...props}
    />
  )
}

/* Arrives from the side, out of a blur. Only these three properties transition, so the delay never
   slows anything else. */
const arrive = cn(
  "transition-[opacity,translate,filter] duration-[calc(460ms*var(--kf-speed,1))] ease-spring",
  "starting:opacity-0 starting:translate-x-4 starting:blur-[4px] rtl:starting:-translate-x-4",
  "[transition-delay:calc((min(sibling-index(),12)-1)*calc(36ms*var(--kf-speed,1)))] group-data-settled/breadcrumb:[transition-delay:0ms]",
  "motion-reduce:transition-none!",
)

function BreadcrumbItem({ className, ...props }: React.ComponentProps<typeof BreadcrumbItemPart>) {
  return <BreadcrumbItemPart className={withClass(arrive, className)} {...props} />
}

/* The underline is the link's `background`: a 1px line sized from 0 to 100% along the text. */
function BreadcrumbLink({ className, ...props }: React.ComponentProps<typeof BreadcrumbLinkPart>) {
  return (
    <BreadcrumbLinkPart
      className={withClass(
        cn(
          "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat rtl:bg-right-bottom",
          "[transition:color_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-size_calc(320ms*var(--kf-speed,1))_var(--ease-spring)]",
          "hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px] data-hovered:bg-[length:100%_1px]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* When a link becomes the page (you went back up), its colour eases over. */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<typeof BreadcrumbPagePart>) {
  return (
    <BreadcrumbPagePart
      className={withClass("[transition:color_calc(200ms*var(--kf-speed,1))_var(--ease-house)] motion-reduce:[transition:none]!", className)}
      {...props}
    />
  )
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rtl:-scale-x-100">
      <path
        d="m6.5 3.5 4.5 4.5-4.5 4.5"
        pathLength={1}
        className="[stroke-dasharray:1] [stroke-dashoffset:0] starting:[stroke-dashoffset:1] [transition:stroke-dashoffset_calc(300ms*var(--kf-speed,1))_var(--ease-house)_calc(80ms*var(--kf-speed,1))] motion-reduce:[transition:none]!"
      />
    </svg>
  )
}

/* Draws a chevron unless you pass your own mark. */
function BreadcrumbSeparator({ className, children, ...props }: React.ComponentProps<typeof BreadcrumbSeparatorPart>) {
  return (
    <BreadcrumbSeparatorPart className={withClass(arrive, className)} {...props}>
      {children ?? <Chevron />}
    </BreadcrumbSeparatorPart>
  )
}

function BreadcrumbEllipsis({ className, children, ...props }: React.ComponentProps<typeof BreadcrumbEllipsisPart>) {
  return (
    <BreadcrumbEllipsisPart className={className} {...props}>
      {children ?? (
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="3.5" cy="8" r="1.15" />
          <circle cx="8" cy="8" r="1.15" />
          <circle cx="12.5" cy="8" r="1.15" />
        </svg>
      )}
    </BreadcrumbEllipsisPart>
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
