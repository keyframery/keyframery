"use client"

export * from "@/components/primitives/stepper"

/* Styled stepper: the animated primitive plus the Keyframery look. Round indicators joined by
   hairline connectors that fill in the accent as steps are reached; the current step's indicator is
   a key ringed in the accent, a finished one is filled with a drawn check, an error one turns the
   destructive colour with a mark. Below 28rem wide (a container query) a horizontal stepper keeps
   only the current step's title.

   Theming: set these CSS variables on the stepper or anything around it. Each falls back to the
   theme's own token, so nothing changes until you set one.
     --stepper-accent   finished and current steps, and the filled connector  (default: --primary)
     --stepper-track    the connector before it fills, and upcoming steps' rim  (default: --border)
     --stepper-ink      titles of reached steps                               (default: --foreground)
     --stepper-muted    upcoming titles, numbers and descriptions             (default: --muted-foreground)
     --stepper-error    a step in error                                       (default: --destructive)
     --stepper-size     the indicators' diameter                              (default: 1.75rem) */

import * as React from "react"

import {
  Stepper as StepperPrimitive,
  StepperConnector as StepperConnectorPrimitive,
  StepperDescription as StepperDescriptionPrimitive,
  StepperIndicator as StepperIndicatorPrimitive,
  StepperItem as StepperItemPrimitive,
  StepperList as StepperListPrimitive,
  StepperPanel as StepperPanelPrimitive,
  StepperStep as StepperStepPrimitive,
  StepperTitle as StepperTitlePrimitive,
} from "@/components/primitives/stepper"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK parts take a class name or a function of the part's state. Keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Stepper({ speed, className, ...props }: React.ComponentProps<typeof StepperPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <StepperPrimitive className={withClass("group/stepper @container/stepper flex w-full min-w-0 flex-col gap-6", className)} {...props} />
    </Speed>
  )
}

function StepperItem({ className, ...props }: React.ComponentProps<typeof StepperItemPrimitive>) {
  return (
    <StepperItemPrimitive
      className={withClass(
        cn(
          "group/item relative flex min-w-0",
          /* Horizontal: equal columns; the indicator on top with the line running from it to the next
             step, the words underneath. */
          "data-[orientation=horizontal]:flex-1 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:pr-3 data-[orientation=horizontal]:data-last:w-max data-[orientation=horizontal]:data-last:max-w-[40%] data-[orientation=horizontal]:data-last:flex-none data-[orientation=horizontal]:data-last:pr-2",
          /* Vertical: the line hangs under the indicator, down to the next step. */
          "data-[orientation=vertical]:flex-col data-[orientation=vertical]:pb-6 data-[orientation=vertical]:data-last:pb-0",
        ),
        className,
      )}
      {...props}
    />
  )
}

function StepperStep({ className, ...props }: React.ComponentProps<typeof StepperStepPrimitive>) {
  return (
    <StepperStepPrimitive
      className={withClass(
        cn(
          "-m-1 flex min-w-0 shrink-0 items-center gap-3 rounded-[10px] p-1 text-left outline-none select-none",
          "group-data-[orientation=vertical]/item:items-start",
          "group-data-[orientation=horizontal]/item:max-w-full group-data-last/item:max-w-none group-data-[orientation=horizontal]/item:flex-col group-data-[orientation=horizontal]/item:items-start group-data-[orientation=horizontal]/item:gap-2.5",
          "focus-visible:ring-2 focus-visible:ring-ring",
          "data-reachable:cursor-pointer aria-disabled:cursor-default",
          "data-reachable:not-aria-[current=step]:hover:[&_[data-slot=stepper-indicator]]:shadow-[inset_0_0_0_1.5px_var(--stepper-accent,var(--primary))]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function StepperIndicator({ className, ...props }: React.ComponentProps<typeof StepperIndicatorPrimitive>) {
  return (
    <StepperIndicatorPrimitive
      className={withClass(
        cn(
          "size-[var(--stepper-size,1.75rem)] shrink-0 rounded-full text-[12px] leading-none font-medium",
          /* Upcoming: a quiet rim. */
          "bg-background text-[color:var(--stepper-muted,var(--muted-foreground))] shadow-[inset_0_0_0_1px_var(--stepper-track,var(--border))] dark:bg-transparent",
          /* Current: a key ringed in the accent, popping a touch larger (the pop scales with --kf-flourish). */
          "data-[state=current]:scale-[calc(1+0.05*var(--kf-flourish,1))] data-[state=current]:text-[color:var(--stepper-ink,var(--foreground))] data-[state=current]:shadow-[inset_0_0_0_1.5px_var(--stepper-accent,var(--primary)),0_0_0_4px_color-mix(in_oklab,var(--stepper-accent,var(--primary))_12%,transparent)]",
          /* Complete: filled, with the check. */
          "data-[state=complete]:bg-[var(--stepper-accent,var(--primary))] data-[state=complete]:text-primary-foreground data-[state=complete]:shadow-none",
          /* Error. */
          "data-[state=error]:bg-[color-mix(in_oklab,var(--stepper-error,var(--destructive))_12%,transparent)] data-[state=error]:text-[color:var(--stepper-error,var(--destructive))] data-[state=error]:shadow-[inset_0_0_0_1.5px_var(--stepper-error,var(--destructive))]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function StepperTitle({ className, ...props }: React.ComponentProps<typeof StepperTitlePrimitive>) {
  return (
    <StepperTitlePrimitive
      className={withClass(
        cn(
          "truncate text-[13px] leading-[1.35] font-medium @max-md/stepper:overflow-visible @max-md/stepper:text-clip text-[color:var(--stepper-ink,var(--foreground))] transition-colors duration-[calc(200ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
          "group-data-[state=upcoming]/item:text-[color:var(--stepper-muted,var(--muted-foreground))] group-data-[state=error]/item:text-[color:var(--stepper-error,var(--destructive))]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function StepperDescription({ className, ...props }: React.ComponentProps<typeof StepperDescriptionPrimitive>) {
  return (
    <StepperDescriptionPrimitive
      className={withClass("truncate text-[12px] leading-[1.35] text-[color:var(--stepper-muted,var(--muted-foreground))]", className)}
      {...props}
    />
  )
}

function StepperConnector({ className, ...props }: React.ComponentProps<typeof StepperConnectorPrimitive>) {
  return (
    <StepperConnectorPrimitive
      className={withClass(
        cn(
          "rounded-full bg-[var(--stepper-track,var(--border))] after:rounded-full after:bg-[var(--stepper-accent,var(--primary))]",
          "data-[orientation=horizontal]:absolute data-[orientation=horizontal]:top-[calc(var(--stepper-size,1.75rem)/2-0.75px)] data-[orientation=horizontal]:right-[10px] data-[orientation=horizontal]:left-[calc(var(--stepper-size,1.75rem)+10px)] @max-md/stepper:data-[orientation=horizontal]:right-[4px] @max-md/stepper:data-[orientation=horizontal]:left-[calc(var(--stepper-size,1.75rem)+4px)] data-[orientation=horizontal]:h-[1.5px]",
          "data-[orientation=vertical]:absolute data-[orientation=vertical]:top-[calc(var(--stepper-size,1.75rem)+6px)] data-[orientation=vertical]:bottom-[6px] data-[orientation=vertical]:left-[calc(var(--stepper-size,1.75rem)/2-0.75px)] data-[orientation=vertical]:w-[1.5px]",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The steps from `steps`, with titles and descriptions. Pass children to lay them out yourself. */
function StepperList({ className, children, ...props }: React.ComponentProps<typeof StepperListPrimitive>) {
  return (
    <StepperListPrimitive
      className={withClass(
        cn("flex w-full min-w-0 data-[orientation=horizontal]:items-start data-[orientation=vertical]:flex-col"),
        className,
      )}
      {...props}
    >
      {children ??
        ((state) =>
          state.steps.map((step) => (
            <StepperItem key={step.value} value={step.value}>
              <StepperStep value={step.value}>
                <StepperIndicator value={step.value} />
                <span
                  className={cn(
                    "flex min-w-0 max-w-full flex-col gap-0.5 group-data-last/item:max-w-none",
                    /* Narrow and horizontal: only the current step keeps its words. */
                    "@max-md/stepper:group-data-[orientation=horizontal]/stepper:not-group-data-[state=current]/item:sr-only",
                    "group-data-[orientation=vertical]/item:pt-[calc((var(--stepper-size,1.75rem)-18px)/2)]",
                  )}
                >
                  <StepperTitle>{step.label}</StepperTitle>{" "}
                  {step.description && (
                    <StepperDescription className="@max-md/stepper:group-data-[orientation=horizontal]/stepper:hidden">{step.description}</StepperDescription>
                  )}
                </span>
              </StepperStep>
              <StepperConnector value={step.value} />
            </StepperItem>
          )))}
    </StepperListPrimitive>
  )
}

function StepperPanel({ className, ...props }: React.ComponentProps<typeof StepperPanelPrimitive>) {
  return <StepperPanelPrimitive className={withClass("min-w-0 outline-none", className)} {...props} />
}

export { Stepper, StepperConnector, StepperDescription, StepperIndicator, StepperItem, StepperList, StepperPanel, StepperStep, StepperTitle }
