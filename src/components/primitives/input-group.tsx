"use client"

/* Animated input group, on UI SDK's core. The behaviour is defined in `@/components/core/input-group`
   with `definePrimitive` and rendered here; the control is UI SDK's own Input or Textarea and the
   buttons UI SDK's Button. This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - The focus ring belongs to the group: it starts 10px out and closes in on a spring when the
     control takes focus, as on Keyframery's Input.
   - Pop: anything in the group marked `data-show="filled"` (a send or clear button) is away while the
     control is empty and pops in with the first character.
   - Roll: `InputGroupCount` rolls its digits up or down as the text grows and shrinks.
   The ring's 10px travel, the pop's shrink and turn, and the roll scale with --kf-flourish; at 0 the
   ring just fades in on the control and filled-only content fades. */

import type { StateOf } from "@ui-sdk/core"
import { Button as ButtonPart } from "@ui-sdk/react/button"
import { Input as InputPart } from "@ui-sdk/react/input"
import { createParts, type PartProps, usePart } from "@ui-sdk/react/primitive"
import { Textarea as TextareaPart } from "@ui-sdk/react/textarea"
import * as React from "react"

import { inputGroup } from "@/components/core/input-group"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const {
  Root: InputGroupRoot,
  Addon: InputGroupAddonPart,
  Text: InputGroupTextPart,
} = createParts(inputGroup, { root: "div", addon: "div", text: "span" })

/* The ring is the group's outline. Give it a strong colour at rest and a soft one while focused:
   `outline-ring data-focus-visible:outline-[3px] data-focus-visible:outline-ring/30`. */
const ringMotion = cn(
  "outline-offset-[calc(10px*var(--kf-flourish,1))] data-focus-visible:outline-offset-0",
  "[transition:outline-offset_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-width_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-color_0s_linear_calc(160ms*var(--kf-speed,1)),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
  "data-focus-visible:[transition:outline-offset_calc(900ms*var(--kf-speed,1))_var(--ease-spring),outline-width_calc(900ms*var(--kf-speed,1))_var(--ease-spring),outline-color_calc(700ms*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
  "motion-reduce:[transition:none]!",
)

/* Content that only belongs to a filled control: away (small, faded, out of the tab order) while empty,
   popping in with the first character. */
const filledOnly = cn(
  "[&_[data-show=filled]]:[transition:scale_calc(320ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(180ms*var(--kf-speed,1))_var(--ease-house),rotate_calc(320ms*var(--kf-speed,1))_var(--ease-pop),visibility_calc(180ms*var(--kf-speed,1))]",
  "not-data-filled:[&_[data-show=filled]]:invisible not-data-filled:[&_[data-show=filled]]:pointer-events-none not-data-filled:[&_[data-show=filled]]:scale-[calc(1-0.5*var(--kf-flourish,1))] not-data-filled:[&_[data-show=filled]]:opacity-0 not-data-filled:[&_[data-show=filled]]:rotate-[calc(-45deg*var(--kf-flourish,1))]",
  "not-data-filled:[&_[data-show=filled]]:[transition-duration:calc(140ms*var(--kf-speed,1))]",
  "motion-reduce:[&_[data-show=filled]]:[transition:none]!",
)

function InputGroup({ className, ...props }: React.ComponentProps<typeof InputGroupRoot>) {
  return <InputGroupRoot className={withClass(
    cn(
      "group/input-group relative", ringMotion, filledOnly,
    ),
    className,
  )} {...props} />
}

function InputGroupAddon({ className, ...props }: React.ComponentProps<typeof InputGroupAddonPart>) {
  return (
    <InputGroupAddonPart
      className={withClass(
        cn(
          "data-[align=inline-start]:order-first data-[align=inline-end]:order-last data-[align=block-start]:order-first data-[align=block-end]:order-last",
          "[&>svg]:[transition:color_calc(150ms*var(--kf-speed,1))_var(--ease-house)] motion-reduce:[&>svg]:[transition:none]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<typeof InputGroupTextPart>) {
  return <InputGroupTextPart className={className} {...props} />
}

/* Digits that roll: each one is a column of 0 to 9, moved to its value on a spring. Columns are keyed
   from the right, so the ones column stays put when a tens column arrives. */
function Roll({ value }: { value: number }) {
  const digits = String(Math.max(0, value)).split("")
  return (
    <span className="inline-flex h-[1lh] overflow-hidden tabular-nums" aria-hidden="true">
      {digits.map((digit, index) => (
        <span
          key={digits.length - index}
          style={{ "--d": Number(digit) } as React.CSSProperties}
          className="flex flex-col [translate:0_calc(var(--d)*-1lh)] [transition:translate_calc(500ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)] motion-reduce:[transition:none]! starting:opacity-0"
        >
          {Array.from({ length: 10 }, (_, d) => (
            <span key={d} className="h-[1lh]">
              {d}
            </span>
          ))}
        </span>
      ))}
    </span>
  )
}

/* How many characters the control holds (`show="used"`, the default) or has left under its
   `maxLength` (`show="left"`). With `maxLength` set, it shows "12/280" and is marked near the limit. */
function InputGroupCount({
  show,
  className,
  children,
  ...props
}: { show?: "used" | "left" } & PartProps<"span", StateOf<typeof inputGroup, "count">>) {
  return usePart(
    inputGroup,
    "count",
    { show },
    {
      ...props,
      className: withClass("inline-flex items-center tabular-nums", className),
      children:
        children ??
        ((state) => (
          <>
            <Roll value={state.value} />
            {state.max && show !== "left" ? <span aria-hidden="true">/{state.max}</span> : null}
            <span className="sr-only">
              {show === "left" ? `${state.value} characters left` : `${state.length} characters${state.max ? ` of ${state.max}` : ""}`}
            </span>
          </>
        )),
    },
    "span",
  )
}

/* UI SDK's Input, Textarea and Button, under the names shadcn/ui gives them in a group. */
function InputGroupInput(props: React.ComponentProps<typeof InputPart>) {
  return <InputPart {...props} />
}

function InputGroupTextarea(props: React.ComponentProps<typeof TextareaPart>) {
  return <TextareaPart {...props} />
}

function InputGroupButton({ type = "button", ...props }: React.ComponentProps<typeof ButtonPart>) {
  return <ButtonPart type={type} {...props} />
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupCount,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
}
