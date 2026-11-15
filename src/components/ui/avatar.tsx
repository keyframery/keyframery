"use client"

/* Styled avatar: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Avatar as AvatarRoot,
  AvatarFallback as AvatarFallbackPart,
  AvatarGroup as AvatarGroupPrimitive,
  AvatarGroupCount as AvatarGroupCountPrimitive,
  AvatarImage as AvatarImagePart,
} from "@/components/primitives/avatar"

import { cn } from "@/lib/utils"

type AvatarSize = "sm" | "md" | "lg"

const sizes: Record<AvatarSize, string> = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-[11px]",
  lg: "size-10 text-[13px]",
}

/* A disc with a hairline drawn above the image, so photos with light edges keep their shape.
   Inside a group, each avatar wears a ring in the surface colour (--avatar-ring). */
const disc = [
  "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-muted align-middle leading-none select-none",
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]",
  "after:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)] dark:after:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]",
  "ring-(color:--avatar-ring) in-data-[slot=avatar-group]:ring-2",
]

function Avatar({
  className,
  size = "md",
  ...props
}: React.ComponentProps<typeof AvatarRoot> & { size?: AvatarSize }) {
  return (
    <AvatarRoot
      data-size={size}
      className={cn(
        disc,
        sizes[size],
        /* When rendered as a button or link. */
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "[&:is(button,a)]:cursor-pointer",
        className,
      )}
      {...props}
    />
  )
}

/* The photo fills the disc; its blur-in comes from the primitive. */
function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarImagePart>) {
  return (
    <AvatarImagePart
      className={cn(
        "absolute inset-0 size-full object-cover",
        className,
      )}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarFallbackPart>) {
  return (
    <AvatarFallbackPart
      className={cn(
        "grid size-full place-items-center rounded-[inherit] font-semibold tracking-[0.01em] text-muted-foreground uppercase",
        className,
      )}
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
        "[--avatar-ring:var(--background)] *:not-first:-ml-1",
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
      className={cn(disc, sizes[size], "font-medium text-muted-foreground tabular-nums", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage }
