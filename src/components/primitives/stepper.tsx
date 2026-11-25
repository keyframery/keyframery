"use client"

/* Animated stepper, on UI SDK's core. UI SDK ships none, so the behaviour is defined in
   `@/components/core/stepper` with `definePrimitive` and rendered here. This file adds motion only.
   Colours, radii and spacing stay yours.

   - Draw: the connector to the next step fills from its start once that step is reached, so the line
     draws itself up to the current step (and back when someone returns).
   - Draw: a finished step's number gives way to a check that draws itself; the indicator pops.
   - Direction: a step's panel arrives from the side someone moved toward (from the right going on,
     from the left going back; from below and above in a vertical stepper), as the tab panels do. */

import type { StateOf } from "@ui-sdk/core"
import { type PartProps, usePart, usePrimitive } from "@ui-sdk/react/primitive"

import { stepper, type StepperOptions, type StepperStep as StepperStepData } from "@/components/core/stepper"
import { cn } from "@/lib/utils"

/* UI SDK parts take a class name or a function of the part's state. Keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const keyframes = "@keyframes kf-stepper-check{from{stroke-dashoffset:1}}"

type StepperProps = StepperOptions & Omit<PartProps<"div", StateOf<typeof stepper, "root">>, "defaultValue">

/* The stepper. Put a `StepperList` (it renders every step from `steps` unless you give it items) and
   any `StepperPanel`s inside. */
function Stepper({ steps, value, defaultValue, onValueChange, completed, interactive, linear, orientation, ...props }: StepperProps) {
  const handle = usePrimitive(stepper, { steps, value, defaultValue, onValueChange, completed, interactive, linear, orientation })
  const root = usePart(handle, "root", {}, props, "div")
  return (
    <>
      <style href="kf-stepper" precedence="default">
        {keyframes}
      </style>
      {root}
    </>
  )
}

/* The ordered list of steps. Its children can be a function of the steps; without children it
   renders each one bare (indicator, title, description, connector). */
function StepperList({ className, children, ...props }: PartProps<"ol", StateOf<typeof stepper, "list">>) {
  return usePart(
    stepper,
    "list",
    {},
    {
      ...props,
      className,
      children:
        children ??
        ((state) =>
          state.steps.map((step) => (
            <StepperItem key={step.value} value={step.value}>
              <StepperStep value={step.value}>
                <StepperIndicator value={step.value} />
                <span>
                  <StepperTitle>{step.label}</StepperTitle>{" "}
                  {step.description && <StepperDescription>{step.description}</StepperDescription>}
                </span>
              </StepperStep>
              <StepperConnector value={step.value} />
            </StepperItem>
          ))),
    },
    "ol",
  )
}

function StepperItem({ className, ...props }: { value: string } & PartProps<"li", StateOf<typeof stepper, "item">>) {
  return usePart(stepper, "item", { value: props.value }, { ...props, className }, "li")
}

/* The step: a button in an interactive stepper, a span in a progress strip. */
function StepperStep({ value, className, ...props }: { value: string } & PartProps<"button", StateOf<typeof stepper, "step">>) {
  return usePart(
    stepper,
    "step",
    { value },
    {
      ...props,
      className: withClass("transition-[scale] duration-[calc(240ms*var(--kf-speed,1))] ease-pop data-reachable:active:scale-[0.97] motion-reduce:transition-none!", className),
    },
    "button",
  )
}

/* The number, or once finished a check that draws itself. With no children it renders both and lets
   `data-state` choose. */
function StepperIndicator({ value, className, children, ...props }: { value?: string } & PartProps<"span", StateOf<typeof stepper, "indicator">>) {
  return usePart(
    stepper,
    "indicator",
    (value === undefined ? {} : { value }) as { value: string },
    {
      ...props,
      className: withClass(
        cn(
          "relative grid place-items-center *:[grid-area:1/1]",
          "transition-[background-color,color,box-shadow,scale] duration-[calc(420ms*var(--kf-speed,1))] ease-pop",
          "data-[state=current]:animate-none data-[state=complete]:[&_[data-check]]:opacity-100",
          "motion-reduce:transition-none!",
        ),
        className,
      ),
      children:
        children ??
        ((state) => (
          <>
            <span
              className={cn(
                "tabular-nums transition-[opacity,scale,filter] duration-[calc(260ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
                state.state === "complete" || state.state === "error" ? "scale-50 opacity-0 blur-[2px]" : "",
              )}
            >
              {state.index + 1}
            </span>
            {state.state === "complete" && (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-3.5">
                <path
                  d="M3.5 8.5 6.5 11.5 12.5 4.75"
                  pathLength={1}
                  className="[stroke-dasharray:1] animate-[kf-stepper-check_calc(320ms*var(--kf-speed,1))_var(--ease-house)_calc(120ms*var(--kf-speed,1))_backwards] motion-reduce:animate-none"
                />
              </svg>
            )}
            {state.state === "error" && (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="size-3.5">
                <path d="M8 4.5v4.25" />
                <path d="M8 11.5h.01" />
              </svg>
            )}
          </>
        )),
    },
    "span",
  )
}

function StepperTitle({ className, ...props }: PartProps<"span">) {
  return usePart(stepper, "title", {}, { ...props, className }, "span")
}

function StepperDescription({ className, ...props }: PartProps<"span">) {
  return usePart(stepper, "description", {}, { ...props, className }, "span")
}

/* The line to the next step. Its `::after` is the fill: give it a colour and it draws itself from
   the start (left, or the top in a vertical stepper) once the next step is reached. */
function StepperConnector({ value, className, ...props }: { value?: string } & PartProps<"span", StateOf<typeof stepper, "connector">>) {
  return usePart(
    stepper,
    "connector",
    (value === undefined ? {} : { value }) as { value: string },
    {
      ...props,
      className: withClass(
        cn(
          "relative overflow-hidden after:absolute after:inset-0 after:content-['']",
          "after:origin-left rtl:after:origin-right after:scale-x-0 data-[orientation=vertical]:after:origin-top data-[orientation=vertical]:after:scale-x-100 data-[orientation=vertical]:after:scale-y-0",
          "after:transition-[scale] after:duration-[calc(300ms*var(--kf-speed,1))] after:ease-house",
          "data-filled:after:scale-x-100 data-[orientation=vertical]:data-filled:after:scale-y-100 data-filled:after:duration-[calc(560ms*var(--kf-speed,1))]",
          "motion-reduce:after:transition-none!",
        ),
        className,
      ),
    },
    "span",
  )
}

/* A step's content, shown while it is current. It arrives from the side someone moved toward. */
function StepperPanel({ value, className, ...props }: { value: string } & PartProps<"div", StateOf<typeof stepper, "panel">>) {
  return usePart(
    stepper,
    "panel",
    { value },
    {
      ...props,
      className: withClass(
        cn(
          "transition-[opacity,translate,filter] duration-[calc(460ms*var(--kf-speed,1))] ease-spring",
          "starting:opacity-0 starting:blur-[6px]",
          "data-[direction=forward]:starting:translate-x-8 data-[direction=backward]:starting:-translate-x-8",
          "data-[orientation=vertical]:data-[direction=forward]:starting:translate-x-0 data-[orientation=vertical]:data-[direction=forward]:starting:translate-y-6",
          "data-[orientation=vertical]:data-[direction=backward]:starting:translate-x-0 data-[orientation=vertical]:data-[direction=backward]:starting:-translate-y-6",
          "motion-reduce:transition-none!",
        ),
        className,
      ),
    },
    "div",
  )
}

export {
  Stepper,
  StepperConnector,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperPanel,
  StepperStep,
  StepperTitle,
}
export type { StepperOptions, StepperStepData }
