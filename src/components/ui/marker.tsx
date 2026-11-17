"use client"

export * from "@/components/primitives/marker"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --marker-ink: Marker text; default: text-muted-foreground.
   --marker-link: Marker links; default: text-foreground.
   --marker-line: Rule colour; default: bg-border.
   --marker-font: Marker size; default: text-[12px].
   --marker-gap: Content gap; default: gap-2.
   --marker-icon-size: Marker icon; default: size-3.5.
   --marker-line-width: Rule thickness; default: h-px.
   --marker-height: Minimum height; default: min-h-4.
*/

/* Styled marker: the animated primitive plus the Keyframery look. A quiet line of hint-sized
   text in a stream: plain, between two hairlines (`separator`), or over one (`border`). */

import * as React from "react"

import {
  Marker as MarkerPrimitive,
  MarkerContent as MarkerContentPrimitive,
  MarkerIcon as MarkerIconPrimitive,
} from "@/components/primitives/marker"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Marker({ speed, className, ...props }: React.ComponentProps<typeof MarkerPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <MarkerPrimitive
        className={withClass(
          cn(
            "group/marker relative flex min-h-[var(--marker-height,1rem)] w-full items-center gap-[var(--marker-gap,0.5rem)] text-left text-[length:var(--marker-font,12px)] leading-4 text-[color:var(--marker-ink,var(--muted-foreground))]",
            "[&_svg]:size-[var(--marker-icon-size,0.875rem)] [&_svg]:shrink-0",
            "[&_a]:text-[color:var(--marker-link,var(--foreground))] [&_a]:underline [&_a]:decoration-foreground/25 [&_a]:underline-offset-3 [&_a:hover]:decoration-foreground",
            "data-[variant=separator]:before:h-[var(--marker-line-width,1px)] data-[variant=separator]:before:min-w-0 data-[variant=separator]:before:flex-1 data-[variant=separator]:before:bg-[var(--marker-line,var(--border))] data-[variant=separator]:before:me-1",
            "data-[variant=separator]:after:h-[var(--marker-line-width,1px)] data-[variant=separator]:after:min-w-0 data-[variant=separator]:after:flex-1 data-[variant=separator]:after:bg-[var(--marker-line,var(--border))] data-[variant=separator]:after:ms-1",
            "data-[variant=border]:pb-2.5 data-[variant=border]:after:absolute data-[variant=border]:after:inset-x-0 data-[variant=border]:after:bottom-0 data-[variant=border]:after:h-[var(--marker-line-width,1px)] data-[variant=border]:after:bg-[var(--marker-line,var(--border))]",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

function MarkerIcon({ className, ...props }: React.ComponentProps<typeof MarkerIconPrimitive>) {
  return (
    <MarkerIconPrimitive
      className={withClass("size-[var(--marker-icon-size,0.875rem)] shrink-0 items-center justify-center [&_svg]:size-[var(--marker-icon-size,0.875rem)]", className)}
      {...props}
    />
  )
}

function MarkerContent({ className, ...props }: React.ComponentProps<typeof MarkerContentPrimitive>) {
  return (
    <MarkerContentPrimitive
      className={withClass(
        cn(
          "min-w-0 font-medium wrap-break-word",
          "group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Marker, MarkerContent, MarkerIcon }
