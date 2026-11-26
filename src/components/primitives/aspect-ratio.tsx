"use client"

/* Animated aspect ratio, on UI SDK's core. UI SDK ships no aspect ratio, so the frame is defined
   in `@/components/core/aspect-ratio` with `definePrimitive` and rendered here. The image inside
   is UI SDK's own avatar primitive (`@ui-sdk/react/avatar`), which already knows when an image
   has loaded or failed, under a name that fits a photo. This file adds motion only. Colours,
   radii and shadows stay yours.

   - A new `ratio` is reached on a spring: the frame reshapes instead of snapping.
   - `AspectRatioImage` fades up out of an 18px blur and a 1.08 zoom once it has loaded, so a
     photo never paints in strips. A new `src` plays it again. Until then, its children (a
     placeholder) show. The blur, zoom and rise scale with --kf-flourish; the fade always plays. */

import { Avatar, AvatarFallback, AvatarImage } from "@ui-sdk/react/avatar"
import { createParts } from "@ui-sdk/react/primitive"
import * as React from "react"

import { aspectRatio } from "@/components/core/aspect-ratio"
import { cn } from "@/lib/utils"

/* `className` may be a string or a function of the part's state: keep both working. */
function withClass<C>(className: C, ...base: string[]): C {
  return (typeof className === "function"
    ? (state: unknown) => cn(...base, (className as (state: unknown) => string | undefined)(state))
    : cn(...base, className as string | undefined)) as C
}

const { Root: AspectRatioRoot } = createParts(aspectRatio, { root: "div" })

function AspectRatio({ className, ...props }: React.ComponentProps<typeof AspectRatioRoot>) {
  return (
    <AspectRatioRoot
      className={withClass(className, "relative transition-[aspect-ratio] duration-[calc(620ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none")}
      {...props}
    />
  )
}

type AvatarProps = React.ComponentProps<typeof Avatar>

function AspectRatioImage({
  src,
  alt = "",
  className,
  children,
  onLoadingStatusChange,
  ...props
}: Omit<React.ComponentProps<typeof AvatarImage>, "children"> & {
  /** Shown until the image has loaded, and if it fails: a colour, a blurred thumbnail, a caption. */
  children?: React.ReactNode
  /** Runs when the image starts loading, loads or fails. */
  onLoadingStatusChange?: AvatarProps["onLoadingStatusChange"]
}) {
  return (
    /* Keyed by the source, so each new photo gets its own entrance. The frame is the image for
       screen readers and agents: it carries the description, and is hidden when there is none. */
    <Avatar
      key={typeof src === "string" ? src : undefined}
      onLoadingStatusChange={onLoadingStatusChange}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className="absolute inset-0 block overflow-hidden"
    >
      <AvatarImage
        src={src}
        alt={alt}
        className={withClass(className, "absolute inset-0 size-full object-cover",
          "[transition:opacity_calc(460ms*var(--kf-speed,1))_var(--ease-house),filter_calc(760ms*var(--kf-speed,1))_var(--ease-house),scale_calc(900ms*var(--kf-speed,1))_var(--ease-spring),translate_calc(900ms*var(--kf-speed,1))_var(--ease-spring)]",
          "not-data-[loading-status=loaded]:translate-y-[calc(0.5rem*var(--kf-flourish,1))] not-data-[loading-status=loaded]:scale-[calc(1+0.08*var(--kf-flourish,1))] not-data-[loading-status=loaded]:opacity-0 not-data-[loading-status=loaded]:blur-[calc(18px*var(--kf-flourish,1))]",
          "starting:translate-y-[calc(0.5rem*var(--kf-flourish,1))] starting:scale-[calc(1+0.08*var(--kf-flourish,1))] starting:opacity-0 starting:blur-[calc(18px*var(--kf-flourish,1))]",
          "motion-reduce:transition-none!")}
        {...props}
      />
      {children !== undefined && <AvatarFallback className="absolute inset-0 block">{children}</AvatarFallback>}
    </Avatar>
  )
}

export { AspectRatio, AspectRatioImage }
