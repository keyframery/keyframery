"use client"

/* Styled dialog: the animated primitive plus the Keyframery look. */

import {
  Dialog as DialogRoot,
  DialogBackdrop as DialogBackdropPart,
  DialogClose as DialogClosePart,
  DialogContent as DialogContentPart,
  DialogDescription as DialogDescriptionPart,
  DialogShortcut as DialogShortcutPart,
  DialogTitle as DialogTitlePart,
  DialogTrigger as DialogTriggerPart,
} from "@/components/primitives/dialog"
import * as React from "react"

import { Speed, type SpeedProps, useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

type DialogCloseVariant = "default" | "primary" | "destructive" | "icon"

/* A key: the thing you press. Shared by the trigger and the close buttons. */
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

const closeVariants: Record<DialogCloseVariant, string> = {
  default: cn(keySurface, "h-8 rounded-[9px] px-3 text-[13px] [&_svg]:size-4"),
  primary: cn(
    "h-8 rounded-[9px] px-3 text-[13px] [&_svg]:size-4",
    "bg-primary text-primary-foreground",
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]",
    "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]",
    "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--primary),var(--background)_14%)]",
    "not-data-disabled:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_0_1px_rgb(0_0_0/0.3)]",
  ),
  destructive: cn(
    "h-8 rounded-[9px] px-3 text-[13px] [&_svg]:size-4",
    "bg-destructive text-background dark:bg-[color-mix(in_oklab,var(--destructive),var(--background)_24%)] dark:text-foreground",
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_1px_2px_rgb(0_0_0/0.2)]",
    "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_1px_2px_rgb(0_0_0/0.5)]",
    "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--destructive),var(--foreground)_10%)]",
    "dark:not-data-disabled:hover:bg-[color-mix(in_oklab,var(--destructive),var(--background)_14%)]",
    "not-data-disabled:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_0_1px_rgb(0_0_0/0.3)]",
  ),
  /* The small corner key that closes the dialog. */
  icon: cn(
    keySurface,
    "absolute top-3.5 right-3.5 size-7 rounded-[8px] text-muted-foreground not-data-disabled:hover:text-foreground [&_svg]:size-3.5",
  ),
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
    </svg>
  )
}

function Dialog({ speed, ...props }: React.ComponentProps<typeof DialogRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <DialogRoot {...props} />
    </Speed>
  )
}

/* A key by default. Pass `render` to use a button of your own instead. */
function DialogTrigger({
  className,
  ...props
}: React.ComponentProps<typeof DialogTriggerPart>) {
  return (
    <DialogTriggerPart
      className={cn(
        !props.render && [keyBase, keySurface, "h-8 rounded-[9px] px-3 text-[13px] [&_svg]:size-4"],
        props.render && "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  )
}

/* The page dims behind the dialog. The primitive blurs it in and out. */
function DialogBackdrop({
  className,
  style,
  ...props
}: React.ComponentProps<typeof DialogBackdropPart>) {
  return (
    <DialogBackdropPart
      className={cn("fixed inset-0 bg-black/25 dark:bg-black/55", className)}
      {...props} style={useSpeedStyle(style)}
    />
  )
}

/* The sheet. The primitive unfolds it from below and cascades its sections in. */
function DialogContent({
  className,
  style,
  ...props
}: React.ComponentProps<typeof DialogContentPart>) {
  return (
    <DialogContentPart
      className={cn(
        "fixed inset-0 m-auto h-fit max-h-[calc(100dvh-32px)] w-[min(440px,calc(100vw-32px))] max-w-none overflow-y-auto overscroll-contain",
        "border-0 p-5 outline-none backdrop:bg-transparent",
        "rounded-[18px] bg-popover text-popover-foreground",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_24px_56px_-12px_rgb(0_0_0/0.28)]",
        "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_24px_56px_-12px_rgb(0_0_0/0.8)]",
        className,
      )}
      {...props} style={useSpeedStyle(style)}
    />
  )
}

/* Title and description stacked, with room for the corner close key. */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1 pr-9", className)}
      {...props}
    />
  )
}

/* The answers, right-aligned at the foot of the sheet. */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("mt-5 flex items-center justify-end gap-2", className)}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitlePart>) {
  return (
    <DialogTitlePart
      className={cn("text-[15px] leading-5 font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescriptionPart>) {
  return (
    <DialogDescriptionPart
      className={cn("text-[13px] leading-5 text-muted-foreground", className)}
      {...props}
    />
  )
}

/* A key. `variant="icon"` is the small corner key with an X, and needs no children. */
function DialogClose({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<typeof DialogClosePart> & { variant?: DialogCloseVariant }) {
  return (
    <DialogClosePart
      data-variant={variant}
      aria-label={variant === "icon" && !children ? "Close" : undefined}
      className={cn(!props.render && [keyBase, closeVariants[variant]], className)}
      {...props}
    >
      {variant === "icon" && !children ? <XIcon /> : children}
    </DialogClosePart>
  )
}

function DialogShortcut({
  className,
  ...props
}: React.ComponentProps<typeof DialogShortcutPart>) {
  return (
    <DialogShortcutPart
      className={cn(
        "ms-1 text-[12px] leading-none tracking-[0.04em] text-muted-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogShortcut,
  DialogTitle,
  DialogTrigger,
}

/* UI SDK's helpers for this component, passed through. */
export { createDialogController } from "@/components/primitives/dialog"
