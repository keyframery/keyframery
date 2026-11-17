"use client"

/* Animated empty state, on UI SDK's core. UI SDK ships no empty state, so the behaviour is defined
   in `@/components/core/empty` with `definePrimitive` and rendered here. This file adds motion
   only. Colours, radii, shadows and spacing stay yours.

   Cascade: the parts arrive one after another. The media pops (`ease-pop`, from 0.6) and the
   strokes of an icon inside it draw; then the title, the description and each action rise 10px out
   of a 6px blur on a spring. It plays every time the empty state appears (after a search that
   finds nothing, or when the last item is removed). Under reduced motion they only fade. */

import { createParts } from "@ui-sdk/react/primitive"
import * as React from "react"

import { empty } from "@/components/core/empty"
import { cn } from "@/lib/utils"

/* `className` may be a string or a function of the part's state: keep both working. */
function withClass<C>(className: C, ...base: string[]): C {
  return (typeof className === "function"
    ? (state: unknown) => cn(...base, (className as (state: unknown) => string | undefined)(state))
    : cn(...base, className as string | undefined)) as C
}

const {
  Root: EmptyRoot,
  Header: EmptyHeaderPart,
  Media: EmptyMediaPart,
  Title: EmptyTitlePart,
  Description: EmptyDescriptionPart,
  Content: EmptyContentPart,
} = createParts(empty, { root: "div", header: "div", media: "div", title: "div", description: "p", content: "div" })

const keyframes =
  "@keyframes kf-empty-rise{from{opacity:0;translate:0 10px;filter:blur(6px)}}" +
  "@keyframes kf-empty-pop{from{opacity:0;scale:0.6;filter:blur(4px)}}" +
  "@keyframes kf-empty-draw{from{stroke-dasharray:80;stroke-dashoffset:80}to{stroke-dasharray:80;stroke-dashoffset:0}}" +
  "@media (prefers-reduced-motion:reduce){@keyframes kf-empty-rise{from{opacity:0}}@keyframes kf-empty-pop{from{opacity:0}}@keyframes kf-empty-draw{from{opacity:1}}}"

const rise = "animate-[kf-empty-rise_calc(560ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none"

function Empty({ className, ...props }: React.ComponentProps<typeof EmptyRoot>) {
  return (
    <>
      <style href="kf-empty" precedence="default">
        {keyframes}
      </style>
      <EmptyRoot
        className={withClass(className, "transition-opacity duration-[calc(240ms*var(--kf-speed,1))] ease-house data-starting-style:opacity-0 motion-reduce:transition-none")}
        {...props}
      />
    </>
  )
}

const EmptyHeader = EmptyHeaderPart

function EmptyMedia({ className, ...props }: React.ComponentProps<typeof EmptyMediaPart>) {
  return (
    <EmptyMediaPart
      className={withClass(className, "animate-[kf-empty-pop_calc(560ms*var(--kf-speed,1))_var(--ease-pop)_backwards]",
        "[&_svg_*]:animate-[kf-empty-draw_calc(720ms*var(--kf-speed,1))_var(--ease-house)_backwards] [&_svg_*]:[animation-delay:calc(160ms*var(--kf-speed,1))]",
        /* Pictures in the media (a stack of photos) pop one after another. */
        "[&>img]:animate-[kf-empty-pop_calc(560ms*var(--kf-speed,1))_var(--ease-pop)_backwards] [&>img]:[animation-delay:calc((min(sibling-index(),6)-1)*70ms*var(--kf-speed,1))]",
        "motion-reduce:animate-none motion-reduce:[&_svg_*]:animate-none motion-reduce:[&>img]:animate-none")}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<typeof EmptyTitlePart>) {
  return <EmptyTitlePart className={withClass(className, rise, "[animation-delay:calc(110ms*var(--kf-speed,1))]")} {...props} />
}

function EmptyDescription({ className, ...props }: React.ComponentProps<typeof EmptyDescriptionPart>) {
  return <EmptyDescriptionPart className={withClass(className, rise, "[animation-delay:calc(170ms*var(--kf-speed,1))]")} {...props} />
}

/* Each action rises on its own beat after the description. */
function EmptyContent({ className, ...props }: React.ComponentProps<typeof EmptyContentPart>) {
  return (
    <EmptyContentPart
      className={withClass(className, "*:animate-[kf-empty-rise_calc(560ms*var(--kf-speed,1))_var(--ease-spring)_backwards]",
        "*:[animation-delay:calc((230ms+(min(sibling-index(),6)-1)*60ms)*var(--kf-speed,1))]",
        "motion-reduce:*:animate-none")}
      {...props}
    />
  )
}

export { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle }
