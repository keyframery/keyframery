"use client"

/* Animated drop-in for `@ui-sdk/react/file-input`: same parts, same props. Swap the import and keep
   your code. This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  FileInputDropzone as FileInputDropzonePart,
  FileInputItem as FileInputItemPart,
  FileInputItemRemove as FileInputItemRemovePart,
  FileInputTrigger as FileInputTriggerPart,
} from "@ui-sdk/react/file-input"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/file-input"

/* While files are over it, the zone lifts toward them on a spring. */
function FileInputDropzone({
  className,
  ...props
}: React.ComponentProps<typeof FileInputDropzonePart>) {
  return (
    <FileInputDropzonePart
      className={withClass(
        cn(
          "[transition:translate_calc(460ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(460ms*var(--kf-speed,1))_var(--ease-spring),border-color_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(200ms*var(--kf-speed,1))_var(--ease-house)]",
          "data-dragging:-translate-y-1.5 data-dragging:scale-[1.02]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function FileInputTrigger({ className, ...props }: React.ComponentProps<typeof FileInputTriggerPart>) {
  return (
    <FileInputTriggerPart
      className={withClass(
        cn(
          "[transition:scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop),translate_calc(260ms*var(--kf-speed,1))_var(--ease-pop),box-shadow_calc(120ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(120ms*var(--kf-speed,1))_var(--ease-house)] active:scale-[0.96]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Cascade: rows rise in out of a blur, each one 32ms after the row above it. Only opacity,
   translate and filter transition here, so the delay never slows anything else. */
function FileInputItem({ className, ...props }: React.ComponentProps<typeof FileInputItemPart>) {
  return (
    <FileInputItemPart
      className={withClass(
        cn(
          "transition-[opacity,translate,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-spring [transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1)))]",
          "starting:translate-y-2 starting:opacity-0 starting:blur-[4px]",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function FileInputItemRemove({
  className,
  ...props
}: React.ComponentProps<typeof FileInputItemRemovePart>) {
  return (
    <FileInputItemRemovePart
      className={withClass(
        cn(
          "[transition:scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop),color_calc(150ms*var(--kf-speed,1)),background-color_calc(150ms*var(--kf-speed,1))] active:scale-[0.82]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { FileInputDropzone, FileInputItem, FileInputItemRemove, FileInputTrigger }
