"use client"

/* Styled field: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Field as FieldRoot,
  FieldControl as FieldControlPrimitive,
  FieldDescription as FieldDescriptionPart,
  FieldError as FieldErrorPrimitive,
  FieldGroup as FieldGroupPart,
  FieldLabel as FieldLabelPart,
  FieldLegend as FieldLegendPart,
  FieldSet as FieldSetPart,
  useFieldControl,
} from "@/components/primitives/field"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* The field look, for a native control rendered through FieldControl. The hairline's
   colour is one variable, so hover, focus and invalid each change a single value. The ring
   is the outline; the primitive makes it close in on a spring. */
const fieldBox =
  "h-9 w-full min-w-0 rounded-[10px] bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground/70 " +
  "outline-0 outline-ring aria-invalid:outline-destructive focus-visible:outline-[3px] focus-visible:outline-ring/30 aria-invalid:focus-visible:outline-destructive/30 " +
  "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)] " +
  "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)] " +
  "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)] " +
  "focus-visible:[--field-line:var(--ring)] dark:focus-visible:[--field-line:var(--ring)] " +
  "aria-invalid:[--field-line:var(--destructive)] dark:aria-invalid:[--field-line:var(--destructive)] " +
  "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:[--field-line:rgb(0_0_0/0.06)] dark:disabled:[--field-line:rgb(255_255_255/0.06)]"

function Field({ speed, className, ...props }: React.ComponentProps<typeof FieldRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <FieldRoot className={cn("flex min-w-0 flex-col gap-1.5", className)} {...props} />
    </Speed>
  )
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof FieldLabelPart>) {
  return (
    <FieldLabelPart
      className={cn(
        "w-fit text-[13px] leading-4 font-medium text-foreground",
        "transition-opacity duration-[calc(150ms*var(--kf-speed,1))] data-disabled:opacity-50 motion-reduce:transition-none!",
        className,
      )}
      {...props}
    />
  )
}

function FieldControl({ className, ...props }: React.ComponentProps<typeof FieldControlPrimitive>) {
  return <FieldControlPrimitive className={cn(fieldBox, className)} {...props} />
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<typeof FieldDescriptionPart>) {
  return (
    <FieldDescriptionPart
      className={cn(
        "text-[12px] leading-4 text-muted-foreground",
        "transition-opacity duration-[calc(150ms*var(--kf-speed,1))] data-disabled:opacity-50 motion-reduce:transition-none!",
        className,
      )}
      {...props}
    />
  )
}

/* The primitive opens its height and lifts it in; it also starts with the field's gap taken
   back, so nothing below jumps. */
function FieldError({ className, ...props }: React.ComponentProps<typeof FieldErrorPrimitive>) {
  return (
    <FieldErrorPrimitive
      className={cn("text-[12px] leading-4 font-medium text-destructive starting:-mt-1.5", className)}
      {...props}
    />
  )
}

function FieldSet({ className, ...props }: React.ComponentProps<typeof FieldSetPart>) {
  return (
    <FieldSetPart
      className={cn(
        "m-0 flex min-w-0 flex-col gap-4 border-0 p-0",
        /* A description right under the legend sits close to it. */
        "*:data-[slot=field-description]:-mt-2.5 *:data-[slot=field-description]:text-[13px] *:data-[slot=field-description]:leading-5",
        className,
      )}
      {...props}
    />
  )
}

function FieldLegend({ className, ...props }: React.ComponentProps<typeof FieldLegendPart>) {
  return (
    <FieldLegendPart
      className={cn(
        /* Floated, a legend lays out like any other child, so the set's gap applies to it. */
        "float-left w-full p-0 text-[15px] leading-5 font-semibold tracking-tight text-foreground",
        "transition-opacity duration-[calc(150ms*var(--kf-speed,1))] data-disabled:opacity-50 motion-reduce:transition-none!",
        className,
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<typeof FieldGroupPart>) {
  return <FieldGroupPart className={cn("flex min-w-0 flex-col gap-4", className)} {...props} />
}

export {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  useFieldControl,
}
