"use client"

/* Animated native select, on UI SDK's core. UI SDK ships a custom Select; this keeps the browser's own
   picker. The behaviour is defined in `@/components/core/native-select` with `definePrimitive` and
   rendered here. This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Direction: the chosen option's label is drawn over the select (whose own text is transparent),
     so a new choice can rise in from below with a blur while the old one leaves upward.
   - The chevron dips once on each change.
   - Press: the whole field gives a little under the pointer and pops back.
   - The focus ring closes in on a spring, as on Keyframery's Input.
   The label's rise, the chevron's dip, the press and the ring's close-in scale with --kf-flourish;
   at 0 the new label simply replaces the old and the ring fades on. */

import { createParts, type PartProps, usePart } from "@ui-sdk/react/primitive"
import type { StateOf } from "@ui-sdk/core"
import * as React from "react"

import { nativeSelect, type NativeSelectOptions } from "@/components/core/native-select"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const {
  Root: NativeSelectRoot,
  Control: NativeSelectControlPart,
  Icon: NativeSelectIconPart,
  Option: NativeSelectOptionPart,
  Optgroup: NativeSelectOptGroupPart,
} = createParts(nativeSelect, {
  root: "div",
  control: "select",
  icon: "span",
  option: "option",
  optgroup: "optgroup",
})

const keyframes =
  "@keyframes kf-native-select-in{from{opacity:0;translate:0 .75em;filter:blur(3px)}}" +
  "@keyframes kf-native-select-out{to{opacity:0;translate:0 -.75em;filter:blur(3px)}}" +
  "@keyframes kf-native-select-dip{40%{translate:0 3px}}"

/* The focus ring is the outline: it starts 10px out and closes in on a spring (Keyframery's Input recipe). */
const ringMotion = cn(
  "outline-offset-[calc(10px*var(--kf-flourish,1))] focus-visible:outline-offset-0",
  "[transition:outline-offset_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-width_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-color_0s_linear_calc(160ms*var(--kf-speed,1)),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
  "focus-visible:[transition:outline-offset_calc((150ms+750ms*var(--kf-flourish,1))*var(--kf-speed,1))_var(--ease-spring),outline-width_calc((150ms+750ms*var(--kf-flourish,1))*var(--kf-speed,1))_var(--ease-spring),outline-color_calc((150ms+550ms*var(--kf-flourish,1))*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
  "motion-reduce:[transition:none]!",
)

/* The <select> itself. Its own text is transparent: the value part draws the label. Options get the
   system's colours back, so the menu stays readable where the browser styles it. */
function NativeSelectControl({ className, ...props }: React.ComponentProps<typeof NativeSelectControlPart>) {
  return (
    <NativeSelectControlPart
      className={withClass(
        cn(
          "w-full min-w-0 appearance-none text-transparent", ringMotion,
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The chosen option's label, over the select. Each change replays: the old label rises out, the new
   one rises in. Before the first change it simply sits there. */
function NativeSelectValue({
  className,
  ...props
}: PartProps<"span", StateOf<typeof nativeSelect, "value">>) {
  return usePart(
    nativeSelect,
    "value",
    {},
    {
      ...props,
      className: withClass("pointer-events-none absolute inset-0 grid items-center overflow-hidden *:[grid-area:1/1] *:truncate", className),
      children: (state) => (
        <>
          {state.changes > 0 && state.previous ? (
            <span
              key={`out-${state.changes}`}
              data-slot="native-select-value-previous"
              className="animate-[kf-native-select-out_calc(220ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_forwards] motion-reduce:hidden"
            >
              {state.previous}
            </span>
          ) : null}
          <span
            key={`in-${state.changes}`}
            className={cn(
              state.changes > 0 &&
                "animate-[kf-native-select-in_calc(480ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_both] motion-reduce:animate-none",
            )}
          >
            {state.label}
          </span>
        </>
      ),
    },
    "span",
  )
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4.5 6.25 3.5 3.5 3.5-3.5" />
    </svg>
  )
}

/* The chevron. It dips once each time the value changes. */
function NativeSelectIcon({ className, children, ...props }: React.ComponentProps<typeof NativeSelectIconPart>) {
  return (
    <NativeSelectIconPart className={withClass("pointer-events-none absolute grid place-items-center", className)} {...props}>
      {children ?? <ChevronDown />}
    </NativeSelectIconPart>
  )
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<typeof NativeSelectOptionPart>) {
  return <NativeSelectOptionPart className={withClass("bg-[Canvas] text-[CanvasText]", className)} {...props} />
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<typeof NativeSelectOptGroupPart>) {
  return <NativeSelectOptGroupPart className={withClass("bg-[Canvas] text-[CanvasText]", className)} {...props} />
}

type NativeSelectProps = NativeSelectOptions &
  Omit<React.ComponentProps<typeof NativeSelectControlPart>, keyof NativeSelectOptions> & {
    /** Class names for the wrapper that holds the select, its label and the chevron. */
    wrapperClassName?: string
    /** Class names for the label drawn over the select. */
    valueClassName?: string
    /** Class names for the chevron. */
    iconClassName?: string
    /** Your own chevron. */
    icon?: React.ReactNode
  }

/* The whole field: wrapper, select, label and chevron. Props for the <select> (`name`, `id`,
   `aria-label`, `required`, `className`) go to the select. */
function NativeSelect({
  value,
  defaultValue,
  onValueChange,
  size,
  disabled,
  invalid,
  wrapperClassName,
  valueClassName,
  iconClassName,
  icon,
  ...props
}: NativeSelectProps) {
  return (
    <NativeSelectRoot
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      size={size}
      disabled={disabled}
      invalid={invalid}
      className={cn(
        "group/native-select relative isolate",
        "[transition:scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop)] not-data-disabled:has-[select:active]:scale-[calc(1-0.015*var(--kf-flourish,1))] not-data-disabled:has-[select:active]:[transition-duration:calc(100ms*var(--kf-speed,1))]",
        "motion-reduce:[transition:none]!",
        wrapperClassName,
      )}
    >
      <style href="kf-native-select" precedence="default">
        {keyframes}
      </style>
      <NativeSelectControl {...props} />
      <NativeSelectValue className={valueClassName} />
      <NativeSelectIcon className={iconClassName}>
        {(state) =>
          icon ?? (
            <span
              key={state.changes}
              className={cn(
                "grid place-items-center",
                state.changes > 0 &&
                  "animate-[kf-native-select-dip_calc(420ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)] motion-reduce:animate-none",
              )}
            >
              <ChevronDown />
            </span>
          )
        }
      </NativeSelectIcon>
    </NativeSelectRoot>
  )
}

export { NativeSelect, NativeSelectControl, NativeSelectIcon, NativeSelectOptGroup, NativeSelectOption, NativeSelectRoot, NativeSelectValue }
