"use client"

export * from "@/components/primitives/input-group"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --input-group-face: Field surface; default: bg-background.
   --input-group-ink: Field text; default: text-foreground.
   --input-group-muted: Addon text; default: text-muted-foreground.
   --input-group-radius: Field corners; default: rounded-[10px].
   --input-group-font: Input size; default: text-[13px].
   --input-group-height: Input height; default: h-9.
   --input-group-inset-x: Side padding; default: px-3.
*/

/* Styled input group: the animated primitive plus the Keyframery look. The group is the field: the
   hairline, the ring and the background belong to it, and the Keyframery Input or Textarea inside gives
   up its own. Addons sit on either side of an input, or above and below a textarea. */

import * as React from "react"

import {
  InputGroup as InputGroupPrimitive,
  InputGroupAddon as InputGroupAddonPrimitive,
  InputGroupCount as InputGroupCountPrimitive,
  InputGroupText as InputGroupTextPrimitive,
} from "@/components/primitives/input-group"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function InputGroup({ speed, className, ...props }: React.ComponentProps<typeof InputGroupPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <InputGroupPrimitive
        className={withClass(
          cn(
            "flex min-h-9 w-full min-w-0 items-center rounded-[var(--input-group-radius,10px)] bg-[var(--input-group-face,var(--background))] text-[length:var(--input-group-font,13px)] text-[color:var(--input-group-ink,var(--foreground))]",
            "has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-end]]:flex-col data-multiline:flex-col",
            "outline-0 outline-ring data-focus-visible:outline-[3px] data-focus-visible:outline-ring/30",
            "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)]",
            "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)]",
            "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)]",
            "data-focus-visible:[--field-line:var(--ring)] dark:data-focus-visible:[--field-line:var(--ring)]",
            "data-invalid:outline-destructive data-invalid:data-focus-visible:outline-destructive/30 data-invalid:[--field-line:var(--destructive)] dark:data-invalid:[--field-line:var(--destructive)]",
            "data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)]",
            /* The control gives up its own field look to the group. */
            "*:data-[slot=input]:h-[var(--input-group-height,2.25rem)] *:data-[slot=input]:flex-1 *:data-[slot=input]:self-stretch *:data-[slot=input]:rounded-none! *:data-[slot=input]:bg-transparent! *:data-[slot=input]:[box-shadow:none]! *:data-[slot=input]:outline-0!",
            "*:data-[slot=textarea]:w-full *:data-[slot=textarea]:min-h-[64px] *:data-[slot=textarea]:rounded-none! *:data-[slot=textarea]:bg-transparent! *:data-[slot=textarea]:py-2.5 *:data-[slot=textarea]:[box-shadow:none]! *:data-[slot=textarea]:outline-0!",
            "has-[>[data-align=inline-start]]:*:data-[slot=input]:ps-1.5 has-[>[data-align=inline-end]]:*:data-[slot=input]:pe-1.5",
            "has-[>[data-align=block-start]]:*:data-[slot=textarea]:pt-1 has-[>[data-align=block-end]]:*:data-[slot=textarea]:pb-1",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

function InputGroupAddon({ className, ...props }: React.ComponentProps<typeof InputGroupAddonPrimitive>) {
  return (
    <InputGroupAddonPrimitive
      className={withClass(
        cn(
          "flex shrink-0 cursor-text items-center gap-2 text-[length:var(--input-group-font,13px)] leading-none text-[color:var(--input-group-muted,var(--muted-foreground))] select-none",
          "[&>svg]:size-4 [&>svg]:shrink-0 group-data-focused/input-group:[&>svg]:text-[color:var(--input-group-ink,var(--foreground))]",
          "group-data-disabled/input-group:opacity-50",
          "data-[align=inline-start]:ps-3 data-[align=inline-start]:has-[>button]:ps-1.5",
          "data-[align=inline-end]:pe-3 data-[align=inline-end]:has-[>button]:pe-1.5",
          "data-[align=block-start]:w-full data-[align=block-start]:px-[var(--input-group-inset-x,0.75rem)] data-[align=block-start]:pt-2.5",
          "data-[align=block-end]:w-full data-[align=block-end]:px-[var(--input-group-inset-x,0.75rem)] data-[align=block-end]:pb-2.5 data-[align=block-end]:has-[>button]:pe-2 data-[align=block-end]:has-[>button]:pb-2",
        ),
        className,
      )}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<typeof InputGroupTextPrimitive>) {
  return (
    <InputGroupTextPrimitive
      className={withClass("inline-flex items-center gap-1.5 whitespace-nowrap text-[color:var(--input-group-muted,var(--muted-foreground))] [&_svg]:size-4", className)}
      {...props}
    />
  )
}

function InputGroupCount({ className, ...props }: React.ComponentProps<typeof InputGroupCountPrimitive>) {
  return (
    <InputGroupCountPrimitive
      className={withClass(
        cn(
          "text-[12px] leading-4 text-[color:var(--input-group-muted,var(--muted-foreground))]",
          "[transition:color_calc(150ms*var(--kf-speed,1))_var(--ease-house)] data-near-limit:text-destructive motion-reduce:[transition:none]",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Keyframery's Input, for a group. */
function InputGroupInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return <Input className={withClass("min-w-0 text-[length:var(--input-group-font,var(--input-font,13px))] text-[color:var(--input-group-ink,var(--input-ink,var(--foreground)))]", className)} {...props} />
}

/* Keyframery's Textarea, for a group. It still grows with its text. */
function InputGroupTextarea({ className, ...props }: React.ComponentProps<typeof Textarea>) {
  return <Textarea className={withClass("resize-none text-[length:var(--input-group-font,var(--textarea-font,13px))] text-[color:var(--input-group-ink,var(--textarea-ink,var(--foreground)))]", className)} {...props} />
}

type InputGroupButtonSize = "xs" | "sm" | "icon-xs" | "icon-sm"

const buttonSizes: Record<InputGroupButtonSize, { size: "sm" | "icon-sm"; className: string }> = {
  xs: { size: "sm", className: "h-6 rounded-[7px] px-2 text-[12px]" },
  sm: { size: "sm", className: "" },
  "icon-xs": { size: "icon-sm", className: "size-6 rounded-[7px]" },
  "icon-sm": { size: "icon-sm", className: "" },
}

/* Keyframery's Button, sized for a group: `xs` (24px) by default, ghost unless you pick a variant. */
function InputGroupButton({
  size = "xs",
  variant = "ghost",
  className,
  type = "button",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> & { size?: InputGroupButtonSize }) {
  return (
    <Button
      type={type}
      variant={variant}
      size={buttonSizes[size].size}
      data-size={size}
      className={withClass(buttonSizes[size].className, className)}
      {...props}
    />
  )
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupCount, InputGroupInput, InputGroupText, InputGroupTextarea }
