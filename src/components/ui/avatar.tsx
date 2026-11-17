"use client"

export * from "@/components/primitives/avatar"

/* Theming: set on a part or its ancestor; unset variables preserve the original theme.
   --avatar-size: Disc size by variant (default: 1.5rem / 2rem / 2.5rem (sm / md / lg)).
   --avatar-radius: Disc corners (default: calc(infinity * 1px)).
   --avatar-face: Fallback and count surface (default: --muted).
   --avatar-ink: Initials and count text (default: --muted-foreground).
   --avatar-ring: Group separator ring (default: --background (group)).
   --avatar-overlap: Negative group spacing (default: -0.25rem).
 */

/* Styled avatar: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Avatar as AvatarRoot,
  AvatarFallback as AvatarFallbackPart,
  AvatarGroup as AvatarGroupPrimitive,
  AvatarGroupCount as AvatarGroupCountPrimitive,
  AvatarImage as AvatarImagePart,
} from "@/components/primitives/avatar"

import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

type AvatarSize = "sm" | "md" | "lg"

const sizes: Record<AvatarSize, string> = {
  sm: "size-[var(--avatar-size,1.5rem)] text-[10px]",
  md: "size-[var(--avatar-size,2rem)] text-[11px]",
  lg: "size-[var(--avatar-size,2.5rem)] text-[13px]",
}

/* A disc with a hairline drawn above the image, so photos with light edges keep their shape.
   Inside a group, each avatar wears a ring in the surface colour (--avatar-ring). */
const disc = [
  "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[var(--avatar-radius,calc(infinity*1px))] bg-[var(--avatar-face,var(--muted))] align-middle leading-none select-none",
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]",
  "after:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)] dark:after:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]",
  "ring-[color:var(--avatar-ring,var(--background))] in-data-[slot=avatar-group]:ring-2",
]

function Avatar({
  speed,
  className,
  size = "md",
  ...props
}: React.ComponentProps<typeof AvatarRoot> & { size?: AvatarSize } & SpeedProps) {
  return (
    <Speed speed={speed}>
      <AvatarRoot
        data-size={size}
        className={withClass(
          cn(
            disc,
            sizes[size],
            /* When rendered as a button or link. */
            "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "[&:is(button,a)]:cursor-pointer",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

/* The photo fills the disc; its blur-in comes from the primitive. */
function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarImagePart>) {
  return (
    <AvatarImagePart
      className={withClass("absolute inset-0 size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarFallbackPart>) {
  return (
    <AvatarFallbackPart
      className={withClass("grid size-full place-items-center rounded-[inherit] font-semibold tracking-[0.01em] text-[color:var(--avatar-ink,var(--muted-foreground))] uppercase", className)}
      {...props}
    />
  )
}

/* Overlapping avatars. Set --avatar-ring to the surface they sit on (it defaults to the page background).
   Hover one and it rises while its neighbours make room (from the primitive). */
function AvatarGroup({ className, ...props }: React.ComponentProps<typeof AvatarGroupPrimitive>) {
  return (
    <AvatarGroupPrimitive
      className={cn(
        "*:not-first:ml-[var(--avatar-overlap,-0.25rem)]",
        className,
      )}
      {...props}
    />
  )
}

/* The "+3" that closes a group. */
function AvatarGroupCount({
  className,
  size = "md",
  ...props
}: React.ComponentProps<typeof AvatarGroupCountPrimitive> & { size?: AvatarSize }) {
  return (
    <AvatarGroupCountPrimitive
      className={cn(disc, sizes[size], "font-medium text-[color:var(--avatar-ink,var(--muted-foreground))] tabular-nums", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage }
