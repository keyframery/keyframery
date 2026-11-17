"use client"

export * from "@/components/primitives/toast"

/* Styled toast: the animated primitive plus the Keyframery look. */

/* Theming: inherit these optional variables; unset values retain the original light/dark tokens.
   --toast-face: Toast sheet and action surfaces (default: --popover; --background on action; --accent on action in dark).
   --toast-ink: Title and description text (default: --foreground; --muted-foreground for description; --popover-foreground on sheet).
   --toast-accent: Status icon colour (default: success green; --destructive for error; --foreground for info/warning).
   --toast-radius: Toast corners (default: 14px).
   --toast-padding: Toast padding (default: 0.75rem).
   --toast-gap: Space between toast contents (default: 0.75rem).
   --toast-width: Region width (default: 360px).
   --toast-action-height: Action button height (default: 1.75rem).
 */

import {
  Toast as ToastPrimitive,
  ToastAction as ToastActionPart,
  ToastClose as ToastClosePart,
  ToastDescription as ToastDescriptionPart,
  ToastRegion as ToastRegionPrimitive,
  ToastTitle as ToastTitlePart,
  createToaster,
  toast,
  type ToastData,
  type ToastType,
} from "@/components/primitives/toast"
import * as React from "react"

import { type SpeedProps, withSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Every toast renders this unless the region is given children of its own. */
function defaultRenderToast(item: ToastData<React.ReactNode>) {
  return (
    <Toast>
      <ToastIcon type={item.type} />
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
        <ToastTitle />
        <ToastDescription />
      </div>
      {item.action && <ToastAction />}
      {item.dismissible !== false && <ToastClose />}
    </Toast>
  )
}

/* The region: the primitive pins it and sizes it for the stack; this adds a focus ring. */
function ToastRegion({
  speed,
  style,
  className,
  children = defaultRenderToast,
  ...props
}: React.ComponentProps<typeof ToastRegionPrimitive> & SpeedProps) {
  return (
    <ToastRegionPrimitive
      className={withClass(
        cn(
          "group/region w-[var(--toast-width,360px)] outline-none",
          "focus-visible:rounded-[16px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        ),
        className,
      )}
      {...props}
      style={withSpeed(style, speed)}
    >
      {children}
    </ToastRegionPrimitive>
  )
}

/* A toast is a sheet. The primitive stacks it, brings it in on a spring and swipes it away. */
function Toast({ className, ...props }: React.ComponentProps<typeof ToastPrimitive>) {
  return (
    <ToastPrimitive
      className={withClass(
        cn(
          "group/toast flex items-start gap-[var(--toast-gap,0.75rem)] rounded-[var(--toast-radius,14px)] bg-[var(--toast-face,var(--popover))] p-[var(--toast-padding,0.75rem)] pr-[calc(var(--toast-padding,0.75rem)-2px)] text-[color:var(--toast-ink,var(--popover-foreground))] outline-none",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
          "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: React.ComponentProps<typeof ToastTitlePart>) {
  return (
    <ToastTitlePart
      className={withClass("text-[13px] leading-[18px] font-medium text-[color:var(--toast-ink,var(--foreground))]", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastDescriptionPart>) {
  return (
    <ToastDescriptionPart
      className={withClass("text-[12px] leading-[17px] text-[color:var(--toast-ink,var(--muted-foreground))]", className)}
      {...props}
    />
  )
}

/* The action is a small key, like Undo. */
function ToastAction({ className, ...props }: React.ComponentProps<typeof ToastActionPart>) {
  return (
    <ToastActionPart
      className={withClass(
        cn(
          "inline-flex h-[var(--toast-action-height,1.75rem)] shrink-0 cursor-pointer items-center self-center rounded-[8px] bg-[var(--toast-face,var(--background))] px-2.5 text-[12px] leading-none font-medium text-[color:var(--toast-ink,var(--foreground))] outline-none",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
          "dark:bg-[var(--toast-face,var(--accent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
          "hover:bg-[var(--toast-face,var(--accent))] dark:hover:bg-[var(--toast-face,var(--muted))]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
          "data-pending:pointer-events-none data-pending:opacity-60",
          "disabled:pointer-events-none disabled:opacity-50",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ToastClosePart>) {
  return (
    <ToastClosePart
      aria-label="Dismiss"
      className={withClass(
        cn(
          "grid size-6 shrink-0 cursor-pointer place-items-center self-start rounded-[7px] text-muted-foreground outline-none",
          "hover:bg-foreground/[0.06] hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring",
          "data-pending:pointer-events-none data-pending:opacity-50",
          "[&_svg]:size-3.5",
        ),
        className,
      )}
      {...props}
    >
      {children ?? (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m4.5 4.5 7 7m0-7-7 7" />
        </svg>
      )}
    </ToastClosePart>
  )
}

/* A small mark by type. As the toast arrives its tile pops in and its mark draws itself. */
const draw =
  "[stroke-dasharray:1] [stroke-dashoffset:0] transition-[stroke-dashoffset] delay-[calc(260ms*var(--kf-speed,1))] duration-[calc(260ms*var(--kf-speed,1))] ease-house group-data-starting-style/toast:[stroke-dashoffset:1] group-data-starting-style/toast:transition-none motion-reduce:transition-none!"

function ToastIcon({
  type = "default",
  className,
  ...props
}: React.ComponentProps<"span"> & { type?: ToastType }) {
  if (type === "default") return null
  const svg = {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  return (
    <span data-slot="toast-icon" data-type={type} className={cn("group/icon mt-px shrink-0", className)} {...props}>
      <span
        className={cn(
          "grid size-[18px] place-items-center rounded-full [&_svg]:size-3.5",
          "transition-[scale] delay-[calc(100ms*var(--kf-speed,1))] duration-[calc(480ms*var(--kf-speed,1))] ease-pop group-data-starting-style/toast:scale-[0.5] group-data-starting-style/toast:transition-none motion-reduce:transition-none!",
          "group-data-[type=success]/icon:bg-[color-mix(in_oklab,var(--toast-accent,oklch(0.62_0.16_150))_14%,transparent)] group-data-[type=success]/icon:text-[color:var(--toast-accent,oklch(0.62_0.16_150))]",
          "group-data-[type=error]/icon:bg-[color-mix(in_oklab,var(--toast-accent,var(--destructive))_12%,transparent)] group-data-[type=error]/icon:text-[color:var(--toast-accent,var(--destructive))]",
          "group-data-[type=info]/icon:bg-muted group-data-[type=info]/icon:text-[color:var(--toast-accent,var(--foreground))]",
          "group-data-[type=warning]/icon:bg-muted group-data-[type=warning]/icon:text-[color:var(--toast-accent,var(--foreground))]",
          "group-data-[type=loading]/icon:text-muted-foreground",
        )}
      >
        {type === "success" && (
          <svg {...svg}>
            <path d="m4.5 8.25 2.25 2.25 4.75-5" pathLength={1} className={draw} />
          </svg>
        )}
        {(type === "error" || type === "warning") && (
          <svg {...svg}>
            <path d="M8 4.75v3.75" pathLength={1} className={draw} />
            <path d="M8 11.25v.01" />
          </svg>
        )}
        {type === "info" && (
          <svg {...svg}>
            <path d="M8 7.5v3.75" pathLength={1} className={draw} />
            <path d="M8 4.75v.01" />
          </svg>
        )}
        {type === "loading" && (
          <svg {...svg} strokeWidth={1.5} className="animate-spin motion-reduce:animate-none!">
            <path d="M8 2.5a5.5 5.5 0 1 1-5.5 5.5" />
          </svg>
        )}
      </span>
    </span>
  )
}

export {
  createToaster,
  toast,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastIcon,
  ToastRegion,
  ToastTitle,
}
