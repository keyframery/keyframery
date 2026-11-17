"use client"

export * from "@/components/primitives/attachment"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --attachment-face: File surface; default: bg-background.
   --attachment-ink: File text; default: text-foreground.
   --attachment-muted: File details; default: text-muted-foreground.
   --attachment-radius: File corners; default: rounded-[12px].
   --attachment-font: Filename size; default: text-[13px].
   --attachment-media-size: Preview size; default: size-10.
   --attachment-gap: File gap; default: gap-2.5.
   --attachment-padding: File padding; default: p-1.5.
*/

/* Styled file attachments: the animated primitive plus the Keyframery look. A file sits on a small
   sheet with its picture or icon in a well; not sent yet, the hairline is dashed; uploading, a thin
   line fills along the foot; on error the hairline and icon turn destructive. The actions are
   Keyframery buttons, so an attachment sits well beside a file input. */

import * as React from "react"

import {
  Attachment as AttachmentPrimitive,
  AttachmentActions as AttachmentActionsPrimitive,
  AttachmentContent as AttachmentContentPrimitive,
  AttachmentDescription as AttachmentDescriptionPrimitive,
  AttachmentGroup as AttachmentGroupPrimitive,
  AttachmentMedia as AttachmentMediaPrimitive,
  AttachmentProgress as AttachmentProgressPrimitive,
  AttachmentTitle as AttachmentTitlePrimitive,
  AttachmentTrigger as AttachmentTriggerPrimitive,
} from "@/components/primitives/attachment"
import { Button } from "@/components/ui/button"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Attachment({ speed, className, children, ...props }: React.ComponentProps<typeof AttachmentPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <AttachmentPrimitive
        className={withClass(
          cn(
            "relative isolate flex w-fit max-w-full min-w-0 shrink-0 overflow-hidden rounded-[var(--attachment-radius,12px)] bg-[var(--attachment-face,var(--background))] text-[color:var(--attachment-ink,var(--foreground))]",
            "shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.05)] dark:bg-[var(--attachment-face,color-mix(in_oklab,var(--accent)_40%,transparent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
            "has-[>[data-slot=attachment-trigger]:hover]:bg-[color-mix(in_oklab,var(--background),var(--foreground)_3%)]",
            "has-[>[data-slot=attachment-trigger]:focus-visible]:ring-2 has-[>[data-slot=attachment-trigger]:focus-visible]:ring-ring has-[>[data-slot=attachment-trigger]:focus-visible]:ring-offset-2 has-[>[data-slot=attachment-trigger]:focus-visible]:ring-offset-background",
            /* Not sent yet: a dashed line instead of the hairline. */
            "data-[status=idle]:bg-transparent data-[status=idle]:shadow-none data-[status=idle]:outline data-[status=idle]:outline-1 data-[status=idle]:-outline-offset-1 data-[status=idle]:outline-dashed data-[status=idle]:outline-foreground/20",
            "data-[status=error]:shadow-[0_0_0_1px_color-mix(in_oklab,var(--destructive)_45%,transparent),0_1px_2px_rgb(0_0_0/0.05)]",
            /* Sizes and the two shapes. */
            "data-[orientation=horizontal]:min-w-44 data-[orientation=horizontal]:items-center",
            "data-[orientation=horizontal]:data-[size=default]:gap-[var(--attachment-gap,0.625rem)] data-[orientation=horizontal]:data-[size=default]:p-[var(--attachment-padding,0.375rem)] data-[orientation=horizontal]:data-[size=default]:pe-2",
            "data-[orientation=horizontal]:data-[size=sm]:gap-2 data-[orientation=horizontal]:data-[size=sm]:p-1 data-[orientation=horizontal]:data-[size=sm]:pe-1.5",
            "data-[size=xs]:min-w-0 data-[size=xs]:gap-1.5 data-[size=xs]:rounded-[9px] data-[size=xs]:p-1 data-[size=xs]:pe-1.5",
            "data-[orientation=vertical]:w-40 data-[orientation=vertical]:data-[size=sm]:w-34 data-[orientation=vertical]:data-[size=xs]:w-28 data-[orientation=vertical]:flex-col data-[orientation=vertical]:gap-2 data-[orientation=vertical]:p-[var(--attachment-padding,0.375rem)] data-[orientation=vertical]:pb-2",
          ),
          className,
        )}
        {...props}
      >
        {children}
      </AttachmentPrimitive>
    </Speed>
  )
}

/* The picture or the file-type icon, in a well. */
function AttachmentMedia({ className, ...props }: React.ComponentProps<typeof AttachmentMediaPrimitive>) {
  return (
    <AttachmentMediaPrimitive
      className={withClass(
        cn(
          "relative flex aspect-square size-[var(--attachment-media-size,2.5rem)] shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-muted text-[color:var(--attachment-muted,var(--muted-foreground))]",
          "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05)]",
          "group-data-[orientation=horizontal]/attachment:group-data-[size=sm]/attachment:size-8 group-data-[size=sm]/attachment:rounded-[7px]",
          "group-data-[orientation=horizontal]/attachment:group-data-[size=xs]/attachment:size-6 group-data-[size=xs]/attachment:rounded-[6px]",
          "group-data-[orientation=vertical]/attachment:size-auto group-data-[orientation=vertical]/attachment:w-full",
          "group-data-[status=error]/attachment:bg-destructive/10 group-data-[status=error]/attachment:text-destructive",
          "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 group-data-[orientation=vertical]/attachment:[&_svg:not([class*='size-'])]:size-6 group-data-[size=xs]/attachment:[&_svg:not([class*='size-'])]:size-3.5",
          "data-[variant=image]:[&_img]:size-full data-[variant=image]:[&_img]:object-cover",
        ),
        className,
      )}
      {...props}
    />
  )
}

function AttachmentContent({ className, ...props }: React.ComponentProps<typeof AttachmentContentPrimitive>) {
  return (
    <AttachmentContentPrimitive
      className={withClass("flex max-w-full min-w-0 flex-1 flex-col gap-1 group-data-[orientation=vertical]/attachment:px-1", className)}
      {...props}
    />
  )
}

function AttachmentTitle({ className, ...props }: React.ComponentProps<typeof AttachmentTitlePrimitive>) {
  return (
    <AttachmentTitlePrimitive
      className={withClass(
        cn(
          "block max-w-full min-w-0 truncate text-[length:var(--attachment-font,13px)] leading-none font-medium",
          "group-data-[size=xs]/attachment:text-[12px]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function AttachmentDescription({ className, ...props }: React.ComponentProps<typeof AttachmentDescriptionPrimitive>) {
  return (
    <AttachmentDescriptionPrimitive
      className={withClass(
        cn(
          "block max-w-full min-w-0 truncate text-[11.5px] leading-none text-[color:var(--attachment-muted,var(--muted-foreground))] tabular-nums",
          "group-data-[status=error]/attachment:text-destructive group-data-[size=xs]/attachment:hidden",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The upload line along the foot. Put it anywhere inside the attachment. */
function AttachmentProgress({ className, ...props }: React.ComponentProps<typeof AttachmentProgressPrimitive>) {
  return (
    <AttachmentProgressPrimitive
      className={withClass("pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-foreground/70", className)}
      {...props}
    />
  )
}

function AttachmentActions({ className, ...props }: React.ComponentProps<typeof AttachmentActionsPrimitive>) {
  return (
    <AttachmentActionsPrimitive
      className={withClass(
        cn(
          "relative z-20 flex shrink-0 items-center gap-0.5",
          "group-data-[orientation=vertical]/attachment:absolute group-data-[orientation=vertical]/attachment:top-2.5 group-data-[orientation=vertical]/attachment:right-2.5",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* A Keyframery button, ghost and small unless you say otherwise. On a picture tile it sits on a
   key so it reads over the image. */
function AttachmentAction({
  variant,
  size = "icon-sm",
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="attachment-action"
      variant={variant ?? "ghost"}
      size={size}
      className={withClass(
        cn(
          "text-[color:var(--attachment-muted,var(--muted-foreground))] hover:text-[color:var(--attachment-ink,var(--foreground))]",
          "group-data-[orientation=vertical]/attachment:bg-background/90 group-data-[orientation=vertical]/attachment:text-[color:var(--attachment-ink,var(--foreground))] group-data-[orientation=vertical]/attachment:backdrop-blur-sm",
          "group-data-[orientation=vertical]/attachment:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.2)]",
          "group-data-[size=xs]/attachment:size-5 group-data-[size=xs]/attachment:rounded-[6px]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m4.5 4.5 7 7m0-7-7 7" />
    </svg>
  )
}

/* The remove action: the attachment leaves, then calls its `onRemove`. */
function AttachmentRemove({ children, ...props }: React.ComponentProps<typeof AttachmentAction>) {
  return (
    <AttachmentAction data-action="remove" aria-label="Remove" {...props}>
      {children ?? <XIcon />}
    </AttachmentAction>
  )
}

/* A button over the whole attachment, to open or preview the file. */
function AttachmentTrigger({ className, ...props }: React.ComponentProps<typeof AttachmentTriggerPrimitive>) {
  return <AttachmentTriggerPrimitive className={withClass("absolute inset-0 z-10 cursor-pointer rounded-[inherit] outline-none", className)} {...props} />
}

/* A row that scrolls sideways when the files do not fit. */
function AttachmentGroup({ speed, className, ...props }: React.ComponentProps<typeof AttachmentGroupPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <AttachmentGroupPrimitive
        className={withClass(
          cn(
            "flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain p-1 [--attachment-gap:0.5rem] [scrollbar-width:none]",
            "*:data-[slot=attachment]:flex-none",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

export {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentProgress,
  AttachmentRemove,
  AttachmentTitle,
  AttachmentTrigger,
}
