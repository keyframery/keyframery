"use client"

export * from "@/components/primitives/empty"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --empty-face: Icon surface; default: bg-background.
   --empty-ink: Icon and links; default: text-foreground.
   --empty-muted: Description colour; default: text-muted-foreground.
   --empty-radius: Icon corners; default: rounded-[13px].
   --empty-font: Title size; default: text-[15px].
   --empty-gap: Section gap; default: gap-5.
   --empty-padding: Empty-state padding; default: p-8.
   --empty-media-size: Icon tile size; default: size-12.
*/

/* Styled empty state: the animated primitive plus the Keyframery look. Centred and balanced; the
   icon media is a raised key with the icon drawn in it; the title is the house title size. */

import * as React from "react"

import {
  Empty as EmptyPrimitive,
  EmptyContent as EmptyContentPrimitive,
  EmptyDescription as EmptyDescriptionPrimitive,
  EmptyHeader as EmptyHeaderPrimitive,
  EmptyMedia as EmptyMediaPrimitive,
  EmptyTitle as EmptyTitlePrimitive,
} from "@/components/primitives/empty"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* `className` may be a string or a function of the part's state: keep both working. */
function withClass<C>(className: C, ...base: string[]): C {
  return (typeof className === "function"
    ? (state: unknown) => cn(...base, (className as (state: unknown) => string | undefined)(state))
    : cn(...base, className as string | undefined)) as C
}

function Empty({ speed, className, ...props }: React.ComponentProps<typeof EmptyPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <EmptyPrimitive
        className={withClass(className, "flex min-w-0 flex-1 flex-col items-center justify-center gap-[var(--empty-gap,1.25rem)] rounded-[16px] p-[var(--empty-padding,2rem)] text-center text-balance")}
        {...props}
      />
    </Speed>
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<typeof EmptyHeaderPrimitive>) {
  return <EmptyHeaderPrimitive className={withClass(className, "flex max-w-[320px] flex-col items-center gap-1.5")} {...props} />
}

function EmptyMedia({ className, variant = "default", ...props }: React.ComponentProps<typeof EmptyMediaPrimitive>) {
  return (
    <EmptyMediaPrimitive
      variant={variant}
      className={withClass(className, "mb-2.5 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "data-[variant=icon]:size-[var(--empty-media-size,3rem)] data-[variant=icon]:rounded-[var(--empty-radius,13px)] data-[variant=icon]:bg-[var(--empty-face,var(--background))] data-[variant=icon]:text-[color:var(--empty-ink,var(--foreground))] data-[variant=icon]:[&_svg:not([class*='size-'])]:size-[22px]",
        "data-[variant=icon]:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
        "dark:data-[variant=icon]:bg-[var(--empty-face,var(--accent))] dark:data-[variant=icon]:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]")}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<typeof EmptyTitlePrimitive>) {
  return <EmptyTitlePrimitive className={withClass(className, "text-[length:var(--empty-font,15px)] leading-tight font-semibold tracking-tight")} {...props} />
}

function EmptyDescription({ className, ...props }: React.ComponentProps<typeof EmptyDescriptionPrimitive>) {
  return (
    <EmptyDescriptionPrimitive
      className={withClass(className, "text-[13px] leading-[1.55] text-[color:var(--empty-muted,var(--muted-foreground))] [&>a]:font-medium [&>a]:text-[color:var(--empty-ink,var(--foreground))] [&>a]:underline [&>a]:underline-offset-4")}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<typeof EmptyContentPrimitive>) {
  return (
    <EmptyContentPrimitive
      className={withClass(className, "flex w-full max-w-[320px] min-w-0 flex-wrap items-center justify-center gap-2 text-[13px]")}
      {...props}
    />
  )
}

export { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle }
