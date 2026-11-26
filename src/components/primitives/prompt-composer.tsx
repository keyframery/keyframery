"use client"

/* Animated prompt composer, on UI SDK's core. UI SDK ships no composer, so its root is defined in
   `@/components/core/prompt-composer` with `definePrimitive` and rendered here; the field is UI SDK's
   textarea with its trigger menu, the files are UI SDK's file input, the buttons are UI SDK buttons.
   This file adds motion only. Colours, radii, shadows and spacing stay yours (style `data-status`,
   `data-empty` and `data-dragging`).

   Feedback (always on):
   - Send and Stop: the arrow, the spinner and the stop square cross-fade in place with a small
     scale as the status changes. With flourish they also turn and blur through the swap and land
     with a pop.
   - Files: the row above the text opens to its height when the first file arrives and closes when
     the last one leaves (each file pops in and out by itself: the attachment primitive).
   - Dragging files over it: the drop layer fades in over the box.
   - The counter changes colour as it nears the limit.
   Flourish (scaled by --kf-flourish): the swap's turn, blur and pop; the drop layer's rise; the box
   leaning toward the files while they are over it. */

import { Button } from "@/components/primitives/button"
import { FileInputDropzone } from "@ui-sdk/react/file-input"
import { createParts } from "@ui-sdk/react/primitive"
import { Textarea } from "@ui-sdk/react/textarea"
import { TriggerMenuInput } from "@ui-sdk/react/trigger-menu"
import * as React from "react"

import { promptComposer } from "@/components/core/prompt-composer"
import { cn } from "@/lib/utils"

const parts = createParts(promptComposer, { root: "div", attachments: "div", toolbar: "div", drop: "div", count: "span" })

type ClassName<S> = string | ((state: S) => string | undefined) | undefined
function withClass<S>(base: string, className: ClassName<S>) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* The root. Everything that follows the status is styled from it (`group/prompt-composer`). */
function PromptComposer({ className, ...props }: React.ComponentProps<typeof parts.Root>) {
  return <parts.Root className={withClass("group/prompt-composer relative", className)} {...props} />
}

/* The box: a UI SDK drop zone, so files dropped on it or pasted into the text are attached.
   It leans toward files dragged over it. */
function PromptComposerDropzone({ className, ...props }: React.ComponentProps<typeof FileInputDropzone>) {
  return (
    <FileInputDropzone
      data-composer-part="box"
      className={withClass(
        cn(
          "group/prompt-composer-box relative isolate",
          "[transition:scale_calc(420ms*var(--kf-speed,1))_var(--ease-spring),box-shadow_calc(180ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(180ms*var(--kf-speed,1))_var(--ease-house)]",
          "data-dragging:scale-[calc(1+0.012*var(--kf-flourish,1))]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Shown over the box while files are dragged over it. Fades in; its content rises a little. */
function PromptComposerDrop({ className, ...props }: React.ComponentProps<typeof parts.Drop>) {
  return (
    <parts.Drop
      className={withClass(
        cn(
          "pointer-events-none absolute inset-0 z-20 opacity-0",
          "transition-opacity duration-[calc(160ms*var(--kf-speed,1))] ease-house",
          "group-data-dragging/prompt-composer-box:opacity-100 group-data-dragging/prompt-composer-box:duration-[calc(220ms*var(--kf-speed,1))]",
          "*:translate-y-[calc(0.375rem*var(--kf-flourish,1))] *:transition-[translate] *:duration-[calc(420ms*var(--kf-speed,1))] *:ease-spring",
          "group-data-dragging/prompt-composer-box:*:translate-y-0",
          "motion-reduce:transition-none! motion-reduce:*:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The row of files above the text. It opens to its height when the first file arrives and closes
   as the last one leaves, so the text below moves instead of jumping. Put the files inside. */
function PromptComposerAttachments({ className, children, ...props }: React.ComponentProps<typeof parts.Attachments>) {
  return (
    <parts.Attachments
      className={withClass(
        cn(
          "grid grid-rows-[0fr] [transition:grid-template-rows_calc(320ms*var(--kf-speed,1))_var(--ease-house)]",
          "has-[[data-slot=attachment]:not([data-removing])]:grid-rows-[1fr] has-[[data-slot=attachment]:not([data-removing])]:[transition-duration:calc(380ms*var(--kf-speed,1))]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    >
      {(state) => <div className="min-h-0 overflow-hidden">{typeof children === "function" ? children(state) : children}</div>}
    </parts.Attachments>
  )
}

const PromptComposerToolbar = parts.Toolbar

/* The text field: UI SDK's trigger menu input (so @ and / open suggestions at the caret) rendered as
   UI SDK's textarea (so it grows with its text and an agent can read and set it). */
function PromptComposerInput({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  const { value, defaultValue, onValueChange, autoResize = true, controller, ...rest } = props
  return (
    <TriggerMenuInput
      {...(rest as React.ComponentProps<typeof TriggerMenuInput>)}
      data-slot="prompt-composer-input"
      render={<Textarea autoResize={autoResize} value={value} defaultValue={defaultValue} onValueChange={onValueChange} controller={controller} />}
      className={withClass("transition-[color] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!", className as ClassName<unknown>)}
    />
  )
}

/* One glyph of the send button. All three are there; `--kf-glyph` (1 shown, 0 hidden) follows the
   root's `data-status`. A glyph leaves quickly and the next one arrives a beat later. */
const glyph = cn(
  "absolute inset-0 grid place-items-center",
  "opacity-(--kf-glyph) [scale:calc(1-(1-var(--kf-glyph))*(0.1+0.4*var(--kf-flourish,1)))] [rotate:calc((1-var(--kf-glyph))*-45deg*var(--kf-flourish,1))] [filter:blur(calc((1-var(--kf-glyph))*3px*var(--kf-flourish,1)))]",
  "[transition-property:opacity,scale,rotate,filter] [transition-timing-function:var(--ease-house),var(--ease-pop),var(--ease-spring),var(--ease-house)]",
  "[transition-duration:calc((140ms+var(--kf-glyph)*80ms)*var(--kf-speed,1)),calc((160ms+var(--kf-glyph)*260ms)*var(--kf-speed,1)),calc((160ms+var(--kf-glyph)*260ms)*var(--kf-speed,1)),calc((140ms+var(--kf-glyph)*100ms)*var(--kf-speed,1))]",
  "[transition-delay:calc(var(--kf-glyph)*60ms*var(--kf-speed,1))]",
  "motion-reduce:[transition:none]!",
)

function SendGlyphs() {
  return (
    <>
      <span
        data-slot="prompt-composer-send-icon"
        data-icon="send"
        className={cn(glyph, "[--kf-glyph:1] group-data-[status=submitted]/prompt-composer:[--kf-glyph:0] group-data-[status=streaming]/prompt-composer:[--kf-glyph:0]")}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 13V3.5M3.75 7.5 8 3.25l4.25 4.25" />
        </svg>
      </span>
      <span data-slot="prompt-composer-send-icon" data-icon="wait" className={cn(glyph, "[--kf-glyph:0] group-data-[status=submitted]/prompt-composer:[--kf-glyph:1]")}>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="animate-spin [animation-duration:calc(800ms*var(--kf-speed,1))] motion-reduce:[animation-duration:calc(2400ms*var(--kf-speed,1))]"
        >
          <circle cx="8" cy="8" r="5.25" opacity="0.3" />
          <path d="M8 2.75A5.25 5.25 0 0 1 13.25 8" />
        </svg>
      </span>
      <span data-slot="prompt-composer-send-icon" data-icon="stop" className={cn(glyph, "[--kf-glyph:0] group-data-[status=streaming]/prompt-composer:[--kf-glyph:1]")}>
        <svg viewBox="0 0 16 16" fill="currentColor">
          <rect x="4.25" y="4.25" width="7.5" height="7.5" rx="1.75" />
        </svg>
      </span>
    </>
  )
}

/* Send, which becomes Stop while a reply is on its way. A UI SDK button; with no children it shows
   the arrow, the spinner ("submitted") or the stop square ("streaming"), from the root's status. */
function PromptComposerSend({ className, children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button data-slot="prompt-composer-send" pendingIndicator={null} className={withClass("relative", className)} {...props}>
      {children ?? <SendGlyphs />}
    </Button>
  )
}

/* The count beside Send. Its colour eases as it nears the limit (`data-near`, `data-over`). */
function PromptComposerCount({ className, ...props }: React.ComponentProps<typeof parts.Count>) {
  return (
    <parts.Count
      className={withClass("transition-[color,opacity] duration-[calc(200ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!", className)}
      {...props}
    />
  )
}

export {
  PromptComposer,
  PromptComposerAttachments,
  PromptComposerCount,
  PromptComposerDrop,
  PromptComposerDropzone,
  PromptComposerInput,
  PromptComposerSend,
  PromptComposerToolbar,
}
export type { PromptComposerStatus, PromptComposerSubmitOn } from "@/components/core/prompt-composer"
