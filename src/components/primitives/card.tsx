"use client"

/* Animated card. UI SDK has no card, so these are plain elements with the shadcn part names
   (Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter): swap the import
   and keep your markup. This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import * as React from "react"

import { cn } from "@/lib/utils"

/* Cascade: the card fades up out of a light blur, then its parts follow one after another,
   and inside the header the title leads the description. Keyframes with a backwards fill, so a
   part is hidden on its first frame and the delay never slows anything later (hover, press). */
const keyframes =
  "@keyframes kf-card-in{from{opacity:0;scale:.97;filter:blur(6px)}}" +
  "@keyframes kf-card-part{from{opacity:0;translate:0 12px;filter:blur(5px)}}"

function Card({
  className,
  interactive,
  spotlight,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  ...props
}: React.ComponentProps<"div"> & {
  /** Lifts 2px on hover on a spring, presses down with a pop. */
  interactive?: boolean
  /** A soft light that follows the pointer. */
  spotlight?: boolean
}) {
  /* Hover is mirrored in `data-hovered`, so pointer events from a script or a touch get the
     same lift and light as a real :hover. Pass `data-hovered` / `data-pressed` yourself to drive it. */
  const [hovered, setHovered] = React.useState(false)
  const tracks = interactive || spotlight

  return (
    <>
      <style href="kf-card" precedence="default">
        {keyframes}
      </style>
      <div
        data-slot="card"
        data-interactive={interactive || undefined}
        data-spotlight={spotlight || undefined}
        data-hovered={(tracks && hovered) || undefined}
        onPointerEnter={(e) => {
          if (tracks) setHovered(true)
          onPointerEnter?.(e)
        }}
        onPointerLeave={(e) => {
          if (tracks) setHovered(false)
          onPointerLeave?.(e)
        }}
        onPointerMove={(e) => {
          /* Spotlight: the pointer position goes into two CSS variables; no animation loop. */
          if (spotlight) {
            const r = e.currentTarget.getBoundingClientRect()
            e.currentTarget.style.setProperty("--kf-x", `${e.clientX - r.left}px`)
            e.currentTarget.style.setProperty("--kf-y", `${e.clientY - r.top}px`)
          }
          onPointerMove?.(e)
        }}
        className={cn(
          "group/card relative isolate",
          "animate-[kf-card-in_calc(520ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none!",
          "[&>*]:animate-[kf-card-part_calc(560ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:[&>*]:animate-none",
          "[&>*]:[animation-delay:calc(calc(70ms*var(--kf-speed,1))+(min(sibling-index(),10)-1)*calc(70ms*var(--kf-speed,1)))]",
          /* Lift and press. Translate and shadow settle on a spring; the press scale pops back. */
          "[transition:translate_calc(420ms*var(--kf-speed,1))_var(--ease-spring),box-shadow_calc(320ms*var(--kf-speed,1))_var(--ease-house),scale_calc(280ms*var(--kf-speed,1))_var(--ease-pop)]",
          "[&[data-interactive]:is(:hover,[data-hovered])]:-translate-y-0.5",
          "[&[data-interactive]:is(:hover,[data-hovered]):is(:active,[data-pressed])]:translate-y-0 [&[data-interactive]:is(:active,[data-pressed])]:scale-[0.985]",
          "motion-reduce:[transition:none]!",
          /* The light: a radial wash under the content, centred on the pointer. It follows the text
             colour by default; set --kf-spotlight to change it. */
          "data-spotlight:before:pointer-events-none data-spotlight:before:absolute data-spotlight:before:inset-0 data-spotlight:before:-z-10 data-spotlight:before:rounded-[inherit]",
          "data-spotlight:before:bg-[radial-gradient(300px_circle_at_var(--kf-x,50%)_var(--kf-y,0%),var(--kf-spotlight,color-mix(in_oklch,currentColor_13%,transparent)),transparent_70%)]",
          "data-spotlight:before:opacity-0 data-spotlight:before:transition-opacity data-spotlight:before:duration-[calc(320ms*var(--kf-speed,1))] data-spotlight:before:ease-house",
          "data-spotlight:[&:is(:hover,[data-hovered])]:before:opacity-100 motion-reduce:before:transition-none!",
          className,
        )}
        {...props}
      />
    </>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "[&>*]:animate-[kf-card-part_calc(560ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:[&>*]:animate-none",
        "[&>*]:[animation-delay:calc(calc(110ms*var(--kf-speed,1))+(min(sibling-index(),10)-1)*calc(60ms*var(--kf-speed,1)))]",
        className,
      )}
      {...props}
    />
  )
}

function CardTitle(props: React.ComponentProps<"div">) {
  return <div data-slot="card-title" {...props} />
}

function CardDescription(props: React.ComponentProps<"div">) {
  return <div data-slot="card-description" {...props} />
}

function CardAction(props: React.ComponentProps<"div">) {
  return <div data-slot="card-action" {...props} />
}

function CardContent(props: React.ComponentProps<"div">) {
  return <div data-slot="card-content" {...props} />
}

function CardFooter(props: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" {...props} />
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
