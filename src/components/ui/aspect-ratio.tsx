"use client"

export * from "@/components/primitives/aspect-ratio"

/* Theming (unset variables keep the original appearance):
   --aspect-ratio-face: Frame surface (default: --muted).
   --aspect-ratio-radius: Frame corners (default: 14px).
   --aspect-ratio-fit: Image fit (default: cover).
   --aspect-ratio-position-x: Horizontal crop (default: 50%).
   --aspect-ratio-position-y: Vertical crop (default: 50%).
   --aspect-ratio-saturation: Saturation (default: 1).
   --aspect-ratio-contrast: Contrast (default: 1).
   --aspect-ratio-brightness: Brightness (default: 1).
*/

/* Styled aspect ratio: the animated primitive plus the Keyframery look. The frame is a soft well
   (`bg-muted`) with a hairline drawn inside it, so a photo with a white edge still has a border,
   and it rounds and clips whatever it holds. */

import * as React from "react"

import {
  AspectRatio as AspectRatioPrimitive,
  AspectRatioImage as AspectRatioImagePrimitive,
} from "@/components/primitives/aspect-ratio"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* `className` may be a string or a function of the part's state: keep both working. */
function withClass<C>(className: C, ...base: string[]): C {
  return (typeof className === "function"
    ? (state: unknown) => cn(...base, (className as (state: unknown) => string | undefined)(state))
    : cn(...base, className as string | undefined)) as C
}

function AspectRatio({ speed, className, ...props }: React.ComponentProps<typeof AspectRatioPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <AspectRatioPrimitive
        className={withClass(className, "w-full overflow-hidden rounded-[var(--aspect-ratio-radius,14px)] bg-[var(--aspect-ratio-face,var(--muted))]",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.07)] dark:after:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]")}
        {...props}
      />
    </Speed>
  )
}

function AspectRatioImage({ className, ...props }: React.ComponentProps<typeof AspectRatioImagePrimitive>) {
  return (
    <AspectRatioImagePrimitive
      className={withClass(className,
        "[object-fit:var(--aspect-ratio-fit,cover)] [object-position:var(--aspect-ratio-position-x,50%)_var(--aspect-ratio-position-y,50%)]",
        "saturate-[var(--aspect-ratio-saturation,1)] contrast-[var(--aspect-ratio-contrast,1)] brightness-[var(--aspect-ratio-brightness,1)]")}
      {...props}
    />
  )
}

export { AspectRatio, AspectRatioImage }
