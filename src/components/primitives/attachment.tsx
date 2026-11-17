"use client"

/* Animated file attachments, on UI SDK's core. UI SDK ships no attachment, so the behaviour is
   defined in `@/components/core/attachment` with `definePrimitive` and rendered here; the actions
   are UI SDK buttons. This file adds motion only. Colours, radii, shadows and spacing stay yours
   (style `data-status`, `data-size` and `data-orientation`).

   - Pop: a new attachment grows in from 80% with a blur that clears, settling with `ease-pop`.
   - Leave: `remove()` shrinks and fades it, then closes the gap it leaves, so the attachments
     after it slide over instead of jumping. Give the group's gap as `--attachment-gap`; in a
     column, set `--attachment-collapse-x: 0` and `--attachment-collapse-y: 1` so it closes upward.
   - The upload line fills on a spring as `progress` rises, and fades once the upload is done.
   - An image sits dimmed and soft while it uploads and clears when it is done. */

import { createParts, type PartProps } from "@ui-sdk/react/primitive"
import * as React from "react"

import { attachment, attachmentGroup } from "@/components/core/attachment"
import { Button } from "@/components/primitives/button"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const {
  Root: AttachmentRoot,
  Media: AttachmentMediaPart,
  Content: AttachmentContentPart,
  Title: AttachmentTitlePart,
  Description: AttachmentDescriptionPart,
  Progress: AttachmentProgressPart,
  Actions: AttachmentActionsPart,
  Trigger: AttachmentTriggerPart,
} = createParts(attachment, {
  root: "div",
  media: "div",
  content: "div",
  title: "span",
  description: "span",
  progress: "span",
  actions: "div",
  trigger: "button",
})
const { Root: AttachmentGroupRoot } = createParts(attachmentGroup, { root: "div" })

function Attachment({ className, ...props }: React.ComponentProps<typeof AttachmentRoot>) {
  return (
    <AttachmentRoot
      className={withClass(
        cn(
          "group/attachment origin-center",
          "[transition:scale_calc(520ms*var(--kf-speed,1))_var(--ease-pop),translate_calc(520ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(220ms*var(--kf-speed,1))_var(--ease-house),filter_calc(300ms*var(--kf-speed,1))_var(--ease-house)]",
          "data-starting-style:scale-[0.8] data-starting-style:translate-y-1.5 data-starting-style:opacity-0 data-starting-style:blur-[6px] data-starting-style:transition-none",
          /* Leave: shrink and fade, then give its room back. */
          "data-ending-style:scale-[0.86] data-ending-style:opacity-0 data-ending-style:blur-[4px]",
          "data-ending-style:[margin-inline-end:calc((var(--attachment-width,0px)+var(--attachment-gap,0px))*-1*var(--attachment-collapse-x,1))]",
          "data-ending-style:[margin-block-end:calc((var(--attachment-height,0px)+var(--attachment-gap,0px))*-1*var(--attachment-collapse-y,0))]",
          "data-ending-style:[transition:scale_calc(200ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(180ms*var(--kf-speed,1))_var(--ease-house),filter_calc(180ms*var(--kf-speed,1))_var(--ease-house),margin-inline-end_calc(320ms*var(--kf-speed,1))_var(--ease-house)_calc(90ms*var(--kf-speed,1)),margin-block-end_calc(320ms*var(--kf-speed,1))_var(--ease-house)_calc(90ms*var(--kf-speed,1))]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* An image dims and softens while its file uploads, and clears when it is done. */
function AttachmentMedia({ className, ...props }: React.ComponentProps<typeof AttachmentMediaPart>) {
  return (
    <AttachmentMediaPart
      className={withClass(
        cn(
          "data-[variant=image]:[&_img]:transition-[opacity,filter] data-[variant=image]:[&_img]:duration-[calc(420ms*var(--kf-speed,1))] data-[variant=image]:[&_img]:ease-house",
          "group-data-[status=uploading]/attachment:data-[variant=image]:[&_img]:opacity-60 group-data-[status=uploading]/attachment:data-[variant=image]:[&_img]:blur-[2px]",
          "group-data-[status=processing]/attachment:data-[variant=image]:[&_img]:opacity-75",
          "motion-reduce:[&_img]:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function AttachmentContent(props: React.ComponentProps<typeof AttachmentContentPart>) {
  return <AttachmentContentPart {...props} />
}

function AttachmentTitle(props: React.ComponentProps<typeof AttachmentTitlePart>) {
  return <AttachmentTitlePart {...props} />
}

function AttachmentDescription(props: React.ComponentProps<typeof AttachmentDescriptionPart>) {
  return <AttachmentDescriptionPart {...props} />
}

/* The upload line: fills on a spring to `progress`, fades once the upload is over. */
function AttachmentProgress({ className, ...props }: React.ComponentProps<typeof AttachmentProgressPart>) {
  return (
    <AttachmentProgressPart
      className={withClass(
        cn(
          "origin-left rtl:origin-right [scale:var(--attachment-progress,0)_1]",
          "[transition:scale_calc(620ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(260ms*var(--kf-speed,1))_var(--ease-house)_calc(200ms*var(--kf-speed,1))]",
          "opacity-0 group-data-[status=uploading]/attachment:opacity-100",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function AttachmentActions(props: React.ComponentProps<typeof AttachmentActionsPart>) {
  return <AttachmentActionsPart {...props} />
}

/* One action: a UI SDK button. Mark it `data-action="remove"` to remove the attachment with it,
   or use `AttachmentRemove`. */
function AttachmentAction(props: React.ComponentProps<typeof Button>) {
  return <Button data-slot="attachment-action" {...props} />
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m4.5 4.5 7 7m0-7-7 7" />
    </svg>
  )
}

/* The remove action: plays the attachment's exit, then calls its `onRemove`. */
function AttachmentRemove({ children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <AttachmentAction data-action="remove" aria-label="Remove" {...props}>
      {children ?? <XIcon />}
    </AttachmentAction>
  )
}

function AttachmentTrigger(props: PartProps<"button">) {
  return <AttachmentTriggerPart {...props} />
}

function AttachmentGroup({ className, ...props }: React.ComponentProps<typeof AttachmentGroupRoot>) {
  return <AttachmentGroupRoot className={className} {...props} />
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
