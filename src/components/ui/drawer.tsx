"use client"

export * from "@/components/primitives/drawer"

/* Theming: set on a part or its ancestor; unset variables preserve the original theme.
   --drawer-face: Drawer sheet and overscroll strip (default: --popover).
   --drawer-ink: Drawer body text (default: --popover-foreground).
   --drawer-accent: Primary action and hover mix (default: --primary).
   --drawer-width: Sheet maximum width (default: 480px top/bottom; 380px left/right).
   --drawer-radius: Free-edge corners (default: 18px).
   --drawer-gap: Footer key spacing (default: 0.5rem).
 */

/* Styled drawer: the animated primitive plus the Keyframery look. */

import {
  Drawer as DrawerRoot,
  DrawerBackdrop as DrawerBackdropPart,
  DrawerClose as DrawerClosePart,
  DrawerContent as DrawerContentPart,
  DrawerDescription as DrawerDescriptionPart,
  DrawerHandle as DrawerHandlePart,
  DrawerOutlet as DrawerOutletPart,
  DrawerShortcut as DrawerShortcutPart,
  DrawerTitle as DrawerTitlePart,
  DrawerTrigger as DrawerTriggerPart,
} from "@/components/primitives/drawer"
import * as React from "react"

import { Speed, type SpeedProps, useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

type DrawerCloseVariant = "default" | "primary"

const keyBase = cn(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 leading-none font-medium whitespace-nowrap outline-none select-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  /* The primitive presses the key; colour and shadow ride the same 200ms pop. */
  "transition-[color,background-color,box-shadow,opacity,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-pending:cursor-progress data-pending:opacity-70",
  "motion-reduce:transition-none!",
)

const keySurface = cn(
  "bg-background text-foreground dark:bg-accent",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--background),var(--foreground)_3%)]",
  "dark:not-data-disabled:hover:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_7%)]",
  "not-data-disabled:hover:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_1px_rgb(0_0_0/0.05),0_4px_8px_-2px_rgb(0_0_0/0.12)]",
  "dark:not-data-disabled:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.12),inset_0_1px_0_rgb(255_255_255/0.1),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "not-data-disabled:active:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_1px_rgb(0_0_0/0.04),0_1px_2px_-1px_rgb(0_0_0/0.06)]",
  "dark:not-data-disabled:active:shadow-[0_0_0_1px_rgb(255_255_255/0.09),inset_0_1px_0_rgb(255_255_255/0.04),0_1px_2px_-1px_rgb(0_0_0/0.6)]",
)

const primarySurface = cn(
  "bg-[var(--drawer-accent,var(--primary))] text-primary-foreground",
  "shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]",
  "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]",
  "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--drawer-accent,var(--primary)),var(--background)_14%)]",
  "not-data-disabled:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_0_1px_rgb(0_0_0/0.3)]",
)

/* The pill you grab. While the sheet is dragged it stretches wide and darkens on a spring,
   and closes up again when let go. */
const grip = cn(
  "mx-auto block h-1 w-9 shrink-0 rounded-full bg-foreground/15",
  "transition-[width,background-color] duration-[calc(380ms*var(--kf-speed,1))] ease-spring",
  "group-data-dragging/drawer:w-16 group-data-dragging/drawer:bg-foreground/35",
  "group-data-[side=left]/drawer:hidden group-data-[side=right]/drawer:hidden",
  "motion-reduce:transition-none!",
)

function Drawer({ speed, ...props }: React.ComponentProps<typeof DrawerRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <DrawerRoot {...props} />
    </Speed>
  )
}

/* A key by default. Pass `render` to use a button of your own instead. */
function DrawerTrigger({
  className,
  ...props
}: React.ComponentProps<typeof DrawerTriggerPart>) {
  return (
    <DrawerTriggerPart
      className={withClass(
        cn(
          !props.render && [keyBase, keySurface, "h-8 rounded-[9px] px-3 text-[13px] [&_svg]:size-4"],
          props.render && "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The drawer sets this layer's opacity from how far the sheet is open, so the dim and the
   blur behind it follow a drag frame by frame. Only its colour and blur are set here. */
function DrawerBackdrop({
  className,
  style,
  ...props
}: React.ComponentProps<typeof DrawerBackdropPart>) {
  return (
    <DrawerBackdropPart
      className={withClass(
        cn(
          "fixed inset-0 bg-black/30 backdrop-blur-[3px] dark:bg-black/60",
          "data-interactive:backdrop-blur-none",
        ),
        className,
      )}
      {...props} style={useSpeedStyle(style)}
    />
  )
}

/* The sheet. The drawer owns its position and translate; this gives it a size, a surface
   and corners for whichever edge it comes from. */
function DrawerContent({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<typeof DrawerContentPart>) {
  return (
    <DrawerContentPart
      className={withClass(
        cn(
          "group/drawer flex flex-col border-0 bg-[var(--drawer-face,var(--popover))] text-[color:var(--drawer-ink,var(--popover-foreground))] outline-none",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_-8px_32px_-8px_rgb(0_0_0/0.18)]",
          "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_-8px_32px_-8px_rgb(0_0_0/0.7)]",
          /* Bottom and top: a centred sheet, rounded on its free edge. A strip below the edge
             covers the gap when it is pulled past its rest. */
          "data-[side=bottom]:mx-auto data-[side=bottom]:max-h-[calc(100dvh-48px)] data-[side=bottom]:w-full data-[side=bottom]:max-w-[var(--drawer-width,480px)] data-[side=bottom]:rounded-t-[var(--drawer-radius,18px)] data-[side=bottom]:pb-[max(20px,env(safe-area-inset-bottom))]",
          "data-[side=bottom]:after:absolute data-[side=bottom]:after:inset-x-0 data-[side=bottom]:after:top-full data-[side=bottom]:after:h-24 data-[side=bottom]:after:bg-[var(--drawer-face,var(--popover))]",
          "data-[side=top]:mx-auto data-[side=top]:max-h-[calc(100dvh-48px)] data-[side=top]:w-full data-[side=top]:max-w-[var(--drawer-width,480px)] data-[side=top]:rounded-b-[var(--drawer-radius,18px)]",
          "data-[side=left]:h-full data-[side=left]:w-[min(var(--drawer-width,380px),calc(100vw-48px))] data-[side=left]:rounded-r-[var(--drawer-radius,18px)]",
          "data-[side=right]:h-full data-[side=right]:w-[min(var(--drawer-width,380px),calc(100vw-48px))] data-[side=right]:rounded-l-[var(--drawer-radius,18px)]",
          /* A sheet opened from this one rises over it: this one steps back. */
          "origin-top scale-[calc(1-var(--drawer-stack,0)*0.04)]",
          "data-dragging:cursor-grabbing",
        ),
        className,
      )}
      {...props} style={useSpeedStyle(style)}
    >
      {children}
    </DrawerContentPart>
  )
}

/* A decorative grip for a sheet with one resting point. */
function DrawerGrip({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="drawer-grip" aria-hidden className={cn("pt-2.5 pb-1", className)} {...props}>
      <span className={grip} />
    </div>
  )
}

/* The grip as a button, for sheets with several snap points: a press moves to the next
   one, arrow keys, Home and End choose one. Give it an aria-label. */
function DrawerHandle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerHandlePart>) {
  return (
    <DrawerHandlePart
      className={withClass(
        cn(
          "group/handle mx-auto mt-1 block cursor-grab rounded-full px-4 pt-1.5 pb-2 outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring",
          "hover:[&>span]:bg-foreground/25",
        ),
        className,
      )}
      {...props}
    >
      <span className={grip} />
    </DrawerHandlePart>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="drawer-header" className={cn("flex flex-col gap-1 px-5 pt-3", className)} {...props} />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-[var(--drawer-gap,0.5rem)] px-5 pt-4", className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerTitlePart>) {
  return (
    <DrawerTitlePart
      className={withClass("text-[15px] leading-5 font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerDescriptionPart>) {
  return (
    <DrawerDescriptionPart
      className={withClass("text-[13px] leading-5 text-muted-foreground", className)}
      {...props}
    />
  )
}

/* A full-width key by default. Pass `render` for a button of your own. */
function DrawerClose({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DrawerClosePart> & { variant?: DrawerCloseVariant }) {
  return (
    <DrawerClosePart
      data-variant={variant}
      className={withClass(
        cn(
          !props.render && [
            keyBase,
            "h-9 rounded-[10px] px-4 text-[14px] [&_svg]:size-4",
            variant === "primary" ? primarySurface : keySurface,
          ],
          props.render && "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ),
        className,
      )}
      {...props}
    />
  )
}

function DrawerShortcut({
  className,
  ...props
}: React.ComponentProps<typeof DrawerShortcutPart>) {
  return (
    <DrawerShortcutPart
      className={withClass("ms-1 text-[12px] leading-none tracking-[0.04em] text-muted-foreground tabular-nums", className)}
      {...props}
    />
  )
}

/* Something on the page that follows the sheet, like the app behind it scaling back. Its
   `keyframes` run from closed to fully open. */
function DrawerOutlet({
  className,
  ...props
}: React.ComponentProps<typeof DrawerOutletPart>) {
  return <DrawerOutletPart className={withClass("origin-top", className)} {...props} />
}

export {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerGrip,
  DrawerHandle,
  DrawerHeader,
  DrawerOutlet,
  DrawerShortcut,
  DrawerTitle,
  DrawerTrigger,
}

/* UI SDK's helpers for this component, passed through. */
export { createDrawerController, sheetPhysics } from "@/components/primitives/drawer"
