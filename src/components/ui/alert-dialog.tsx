"use client"

/* Styled alert dialog: the animated primitive plus the Keyframery look. */

import {
  AlertDialog as AlertDialogRoot,
  AlertDialogBackdrop as AlertDialogBackdropPart,
  AlertDialogClose as AlertDialogClosePart,
  AlertDialogContent as AlertDialogContentPart,
  AlertDialogDescription as AlertDialogDescriptionPart,
  AlertDialogShortcut as AlertDialogShortcutPart,
  AlertDialogTitle as AlertDialogTitlePart,
  AlertDialogTrigger as AlertDialogTriggerPart,
} from "@/components/primitives/alert-dialog"
import * as React from "react"

import { Speed, type SpeedProps, useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

type AlertDialogCloseVariant = "default" | "primary" | "destructive"


const keyBase = cn(
  "group/key relative inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] px-3 text-[13px] leading-none font-medium whitespace-nowrap outline-none select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  /* The primitive presses the key; colour and shadow ride the same 200ms pop. */
  "transition-[color,background-color,box-shadow,opacity,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-pending:cursor-progress",
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

const closeVariants: Record<AlertDialogCloseVariant, string> = {
  default: keySurface,
  primary: cn(
    "bg-primary text-primary-foreground",
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]",
    "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]",
    "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--primary),var(--background)_14%)]",
    "not-data-disabled:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_0_1px_rgb(0_0_0/0.3)]",
  ),
  /* The answer that cannot be undone: a solid red key. */
  destructive: cn(
    "bg-destructive text-background dark:bg-[color-mix(in_oklab,var(--destructive),var(--background)_24%)] dark:text-foreground",
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_1px_2px_rgb(0_0_0/0.2)]",
    "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_1px_2px_rgb(0_0_0/0.5)]",
    "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--destructive),var(--foreground)_10%)]",
    "dark:not-data-disabled:hover:bg-[color-mix(in_oklab,var(--destructive),var(--background)_14%)]",
    "not-data-disabled:active:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_0_1px_rgb(0_0_0/0.3)]",
  ),
}

const swap = "transition-[opacity,scale,filter] duration-[calc(200ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!"

function AlertDialog({ speed, ...props }: React.ComponentProps<typeof AlertDialogRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <AlertDialogRoot {...props} />
    </Speed>
  )
}

/* A key by default, in red for `variant="destructive"`. Pass `render` to use your own button. */
function AlertDialogTrigger({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogTriggerPart> & {
  variant?: "default" | "destructive"
}) {
  return (
    <AlertDialogTriggerPart
      data-variant={variant}
      className={cn(
        !props.render && [
          keyBase,
          keySurface,
          variant === "destructive" && [
            "text-destructive",
            "not-data-disabled:hover:bg-[color-mix(in_oklab,var(--background),var(--destructive)_7%)]",
            "dark:not-data-disabled:hover:bg-[color-mix(in_oklab,var(--accent),var(--destructive)_14%)]",
          ],
        ],
        props.render && "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogBackdrop({
  className,
  style,
  ...props
}: React.ComponentProps<typeof AlertDialogBackdropPart>) {
  return (
    <AlertDialogBackdropPart
      className={cn(
        "fixed inset-0 bg-black/25 dark:bg-black/55",
        className,
      )}
      {...props} style={useSpeedStyle(style)}
    />
  )
}

/* The same sheet as the dialog. The primitive unfolds it from below and cascades its sections in. */
function AlertDialogContent({
  className,
  style,
  ...props
}: React.ComponentProps<typeof AlertDialogContentPart>) {
  return (
    <AlertDialogContentPart
      className={cn(
        "fixed inset-0 m-auto h-fit max-h-[calc(100dvh-32px)] w-[min(400px,calc(100vw-32px))] max-w-none overflow-y-auto overscroll-contain",
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

/* A round tile for the icon that says what is at stake. It is the first section to cascade in,
   and it pops: it starts small and overshoots a little as it lands. */
function AlertDialogMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <>
      <style href="kf-pop" precedence="default">
        {"@keyframes kf-pop{from{scale:0.4}}"}
      </style>
      <div
        data-slot="alert-dialog-media"
        aria-hidden
        className={cn(
          "mb-4 grid size-10 place-items-center rounded-full bg-destructive/10 text-destructive dark:bg-destructive/15 [&_svg]:size-5",
          "animate-[kf-cascade_calc(420ms*var(--kf-speed,1))_var(--ease-spring)_backwards,kf-pop_calc(560ms*var(--kf-speed,1))_var(--ease-pop)_backwards]!",
          "motion-reduce:animate-none!",
          className,
        )}
        {...props}
      />
    </>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-1", className)} {...props} />
  )
}

/* The answers: Cancel first, the action last, each half the width. */
function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("mt-5 grid auto-cols-fr grid-flow-col gap-2 *:w-full", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogTitlePart>) {
  return (
    <AlertDialogTitlePart
      className={cn("text-[15px] leading-5 font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogDescriptionPart>) {
  return (
    <AlertDialogDescriptionPart
      className={cn("text-[13px] leading-5 text-muted-foreground", className)}
      {...props}
    />
  )
}

/* A key for each answer. While its action runs, the label gives its place to a spinner,
   so the key keeps its width. */
function AlertDialogClose({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogClosePart> & { variant?: AlertDialogCloseVariant }) {
  return (
    <AlertDialogClosePart
      data-variant={variant}
      className={cn(!props.render && [keyBase, closeVariants[variant]], className)}
      {...props}
    >
      {props.render || typeof children === "function" ? (
        children
      ) : (
        <span className="inline-grid place-items-center *:[grid-area:1/1]">
          <span
            className={cn(
              "inline-flex items-center gap-1.5",
              swap,
              "group-data-pending/key:scale-95 group-data-pending/key:opacity-0 group-data-pending/key:blur-[2px]",
            )}
          >
            {children}
          </span>
          <span
            aria-hidden
            className={cn(
              "grid scale-50 place-items-center opacity-0 blur-[2px]",
              swap,
              "group-data-pending/key:scale-100 group-data-pending/key:opacity-100 group-data-pending/key:blur-none",
            )}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="size-4 animate-spin [animation-duration:calc(700ms*var(--kf-speed,1))] [animation-play-state:paused] group-data-pending/key:[animation-play-state:running] motion-reduce:[animation-duration:calc(1600ms*var(--kf-speed,1))]"
            >
              <circle cx="8" cy="8" r="5.75" opacity="0.28" />
              <path d="M8 2.25A5.75 5.75 0 0 1 13.75 8" />
            </svg>
          </span>
        </span>
      )}
    </AlertDialogClosePart>
  )
}

function AlertDialogShortcut({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogShortcutPart>) {
  return (
    <AlertDialogShortcutPart
      className={cn(
        "ms-1 text-[12px] leading-none tracking-[0.04em] text-muted-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogShortcut,
  AlertDialogTitle,
  AlertDialogTrigger,
}
