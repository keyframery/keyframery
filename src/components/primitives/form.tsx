"use client"

/* An animated form, on UI SDK's core and UI SDK's Field. The form's own behaviour (running your
   `submit`, its status, server errors on the right fields) is defined in `@/components/core/form`
   with `definePrimitive` and rendered here. The fields are UI SDK's Field, through Keyframery's
   animated field primitive, under shadcn's names: FormItem (and FormField) is Field, FormLabel is
   FieldLabel, FormControl is FieldControl, FormDescription is FieldDescription and FormMessage is
   FieldError. This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - While the form submits, its fields settle back a little and come forward again after.
   - FormSubmit: Press; its label changes by Direction (up) to the pending label with a spinner,
     then to the success label as a check draws itself; refused, it comes back down to the start.
   - FormStatus opens its own height and rises in out of a blur, as a field's error does. */

import { createParts, type PartProps, usePart } from "@ui-sdk/react/primitive"
import type { StateOf } from "@ui-sdk/core"
import * as React from "react"

import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/primitives/field"
import { form } from "@/components/core/form"
import { cn } from "@/lib/utils"

const { Root: FormRoot } = createParts(form, { root: "form" })

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Form({ className, ...props }: React.ComponentProps<typeof FormRoot>) {
  return (
    <FormRoot
      className={withClass(
        cn(
          "[&_[data-slot=field]]:transition-[opacity,filter] [&_[data-slot=field]]:duration-[calc(320ms*var(--kf-speed,1))] [&_[data-slot=field]]:ease-house",
          "data-[status=submitting]:[&_[data-slot=field]]:opacity-55 data-[status=submitting]:[&_[data-slot=field]]:blur-[0.6px]",
          "motion-reduce:[&_[data-slot=field]]:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Each label sits in the same grid cell; the one for the current status is in place, the ones
   before it have risen out of the top and the ones after wait below. */
const label = cn(
  "col-start-1 row-start-1 inline-flex items-center justify-center gap-[inherit]",
  "transition-[opacity,translate,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-spring",
  "motion-reduce:transition-none!",
)

const hidden = "pointer-events-none opacity-0 blur-[3px]"

type FormSubmitProps = Omit<PartProps<"button", StateOf<typeof form, "submit">>, "type"> & {
  /** What the button says while the form submits. */
  pendingLabel?: React.ReactNode
  /** What the button says once the submission succeeds. */
  successLabel?: React.ReactNode
}

function FormSubmit({ className, children, pendingLabel = "Sending", successLabel = "Sent", ...props }: FormSubmitProps) {
  return usePart(
    form,
    "submit",
    {},
    {
      ...props,
      className: withClass(
        cn(
          "group/submit",
          "transition-[scale,background-color,color,box-shadow] duration-[calc(220ms*var(--kf-speed,1))] ease-pop",
          "not-aria-disabled:active:scale-[0.96] not-aria-disabled:active:duration-[calc(90ms*var(--kf-speed,1))] not-aria-disabled:active:ease-house",
          "motion-reduce:transition-none!",
        ),
        className,
      ),
      children: (state: { status: string }) => {
        const content = typeof children === "function" ? (children as (s: typeof state) => React.ReactNode)(state) : children
        const at = state.status === "submitting" ? 1 : state.status === "success" ? 2 : 0
        const place = (index: number) => (index === at ? "" : cn(hidden, index < at ? "-translate-y-3" : "translate-y-3"))
        return (
          <span className="grid gap-[inherit]">
            <span data-label="idle" aria-hidden={at !== 0 || undefined} className={cn(label, place(0))}>
              {content}
            </span>
            <span data-label="submitting" aria-hidden={at !== 1 || undefined} className={cn(label, place(1))}>
              <svg viewBox="0 0 16 16" fill="none" className="size-3.5 animate-[spin_calc(800ms*var(--kf-speed,1))_linear_infinite] motion-reduce:animate-none" aria-hidden>
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.75" />
                <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              {pendingLabel}
            </span>
            <span data-label="success" aria-hidden={at !== 2 || undefined} className={cn(label, place(2))}>
              {/* Draw: the check strokes itself in once the label is in place. */}
              <svg viewBox="0 0 16 16" fill="none" className="size-3.5" aria-hidden>
                <path
                  d="M3.5 8.5 6.5 11.5 12.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  className={cn(
                    "[stroke-dasharray:1] transition-[stroke-dashoffset] duration-[calc(320ms*var(--kf-speed,1))] ease-house",
                    at === 2 ? "[stroke-dashoffset:0] delay-[calc(140ms*var(--kf-speed,1))]" : "[stroke-dashoffset:1] duration-0",
                    "motion-reduce:transition-none!",
                  )}
                />
              </svg>
              {successLabel}
            </span>
          </span>
        )
      },
    },
    "button",
  )
}

/* One line about the whole submission. With no children it shows the message `submit` returned. */
function FormStatus({ className, children, ...props }: PartProps<"p", StateOf<typeof form, "status">>) {
  return usePart(
    form,
    "status",
    {},
    {
      ...props,
      className: withClass(
        cn(
          "overflow-hidden [interpolate-size:allow-keywords]",
          "[transition:height_calc(480ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(380ms*var(--kf-speed,1))_var(--ease-house),translate_calc(700ms*var(--kf-speed,1))_var(--ease-spring),filter_calc(480ms*var(--kf-speed,1))_var(--ease-house)]",
          "starting:h-0 starting:translate-y-3 starting:opacity-0 starting:blur-[4px]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      ),
      children: children ?? ((state) => state.message),
    },
    "p",
  )
}

/* shadcn's names for UI SDK's field parts. A field takes `name`, and its control and errors wire
   themselves; there is no separate controller to render. */
const FormItem = Field
const FormField = Field
const FormLabel = FieldLabel
const FormControl = FieldControl
const FormDescription = FieldDescription
const FormMessage = FieldError

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormStatus,
  FormSubmit,
}
export { useFieldControl } from "@/components/primitives/field"
