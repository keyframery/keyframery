"use client"

export * from "@/components/primitives/form"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --form-face: Submit surface; default: bg-primary.
   --form-ink: Submit label; default: text-primary-foreground.
   --form-muted: Status colour; default: text-muted-foreground.
   --form-radius: Submit corners; default: rounded-[10px].
   --form-font: Submit size; default: text-[13px].
   --form-gap: Form section gap; default: gap-4.
   --form-height: Submit height; default: h-9.
   --form-inset-x: Submit padding; default: px-4.
*/

/* Styled form: the animated primitive plus the Keyframery look. The fields are Keyframery's styled
   Field (`@/components/ui/field`), so a form item looks and moves exactly like a field; shadcn's
   part names point at them. The submit button is a primary key that turns the success green when
   the submission lands. */

import * as React from "react"

import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  useFieldControl,
} from "@/components/ui/field"
import {
  Form as FormPrimitive,
  FormStatus as FormStatusPrimitive,
  FormSubmit as FormSubmitPrimitive,
} from "@/components/primitives/form"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Form({ speed, className, ...props }: React.ComponentProps<typeof FormPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <FormPrimitive className={withClass("flex min-w-0 flex-col gap-[var(--form-gap,1rem)]", className)} {...props} />
    </Speed>
  )
}

function FormSubmit({ className, ...props }: React.ComponentProps<typeof FormSubmitPrimitive>) {
  return (
    <FormSubmitPrimitive
      className={withClass(
        cn(
          "inline-flex h-[var(--form-height,2.25rem)] cursor-pointer items-center justify-center gap-1.5 rounded-[var(--form-radius,10px)] px-[var(--form-inset-x,1rem)] text-[length:var(--form-font,13px)] leading-none font-medium whitespace-nowrap outline-none select-none",
          "bg-[var(--form-face,var(--primary))] text-[color:var(--form-ink,var(--primary-foreground))] shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]",
          "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]",
          "not-aria-disabled:hover:bg-[color-mix(in_oklab,var(--primary),var(--background)_10%)]",
          "aria-disabled:cursor-progress",
          /* The one payoff colour, for the moment it lands. */
          "data-[status=success]:bg-[oklch(0.62_0.16_150)] data-[status=success]:text-white data-[status=success]:hover:bg-[oklch(0.62_0.16_150)]",
          "dark:data-[status=success]:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_1px_2px_rgb(0_0_0/0.5)]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ),
        className,
      )}
      {...props}
    />
  )
}

function FormStatus({ className, ...props }: React.ComponentProps<typeof FormStatusPrimitive>) {
  return (
    <FormStatusPrimitive
      className={withClass(
        cn(
          "text-[12.5px] leading-[1.45] text-[color:var(--form-muted,var(--muted-foreground))]",
          "data-[status=error]:font-medium data-[status=error]:text-destructive",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* shadcn's names for the field parts. FormItem and FormField are the same part: a field takes the
   `name` its control submits under, and wires its label, description and errors itself. */
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
  useFieldControl,
}
