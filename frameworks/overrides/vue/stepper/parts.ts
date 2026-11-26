/* Classes for the stepper's parts: the React primitive's motion, then the ui layer's look. */
import type { InjectionKey } from "vue"
import { cn } from "@/lib/utils"

const keyframes = "@keyframes kf-stepper-check{from{stroke-dashoffset:1}}"
if (typeof document !== "undefined" && !document.getElementById("kf-stepper")) {
  const s = document.createElement("style")
  s.id = "kf-stepper"
  s.textContent = keyframes
  document.head.append(s)
}

export const stepperClass = "group/stepper @container/stepper flex w-full min-w-0 flex-col gap-6"

export const listClass = cn("flex w-full min-w-0 data-[orientation=horizontal]:items-start data-[orientation=vertical]:flex-col")

export const itemClass = cn(
  "group/item relative flex min-w-0",
  /* Horizontal: equal columns; the indicator on top with the line running from it to the next step,
     the words underneath. */
  "data-[orientation=horizontal]:flex-1 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:pr-3 data-[orientation=horizontal]:data-last:w-max data-[orientation=horizontal]:data-last:max-w-[40%] data-[orientation=horizontal]:data-last:flex-none data-[orientation=horizontal]:data-last:pr-2",
  /* Vertical: the line hangs under the indicator, down to the next step. */
  "data-[orientation=vertical]:flex-col data-[orientation=vertical]:pb-6 data-[orientation=vertical]:data-last:pb-0",
)

export const stepClass = cn(
  "transition-[scale] duration-[calc(240ms*var(--kf-speed,1))] ease-pop data-reachable:active:scale-[calc(1-0.03*var(--kf-flourish,1))] motion-reduce:transition-none!",
  cn(
    "-m-1 flex min-w-0 shrink-0 items-center gap-3 rounded-[10px] p-1 text-left outline-none select-none",
    "group-data-[orientation=vertical]/item:items-start",
    "group-data-[orientation=horizontal]/item:max-w-full group-data-last/item:max-w-none group-data-[orientation=horizontal]/item:flex-col group-data-[orientation=horizontal]/item:items-start group-data-[orientation=horizontal]/item:gap-2.5",
    "focus-visible:ring-2 focus-visible:ring-ring",
    "data-reachable:cursor-pointer aria-disabled:cursor-default",
    "data-reachable:not-aria-[current=step]:hover:[&_[data-slot=stepper-indicator]]:shadow-[inset_0_0_0_1.5px_var(--stepper-accent,var(--primary))]",
  ),
)

export const indicatorClass = cn(
  cn(
    "relative grid place-items-center *:[grid-area:1/1]",
    "transition-[background-color,color,box-shadow,scale] duration-[calc(420ms*var(--kf-speed,1))] ease-pop",
    "data-[state=current]:animate-none data-[state=complete]:[&_[data-check]]:opacity-100",
    "motion-reduce:transition-none!",
  ),
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
)

/* The number: shrinks and blurs away once the step is done (or in error). */
export const numberClass = "tabular-nums transition-[opacity,scale,filter] duration-[calc(260ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!"
export const numberGoneClass = "scale-[calc(1-0.5*var(--kf-flourish,1))] opacity-0 blur-[calc(2px*var(--kf-flourish,1))]"
export const checkPathClass =
  "[stroke-dasharray:1] animate-[kf-stepper-check_calc(320ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_calc(120ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards] motion-reduce:animate-none"

export const titleClass = cn(
  "truncate text-[13px] leading-[1.35] font-medium @max-md/stepper:overflow-visible @max-md/stepper:text-clip text-[color:var(--stepper-ink,var(--foreground))] transition-colors duration-[calc(200ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
  "group-data-[state=upcoming]/item:text-[color:var(--stepper-muted,var(--muted-foreground))] group-data-[state=error]/item:text-[color:var(--stepper-error,var(--destructive))]",
)

export const descriptionClass = "truncate text-[12px] leading-[1.35] text-[color:var(--stepper-muted,var(--muted-foreground))]"

export const connectorClass = cn(
  cn(
    "relative overflow-hidden after:absolute after:inset-0 after:content-['']",
    "after:origin-left rtl:after:origin-right after:scale-x-0 data-[orientation=vertical]:after:origin-top data-[orientation=vertical]:after:scale-x-100 data-[orientation=vertical]:after:scale-y-0",
    "after:transition-[scale] after:duration-[calc(300ms*var(--kf-speed,1))] after:ease-house",
    "data-filled:after:scale-x-100 data-[orientation=vertical]:data-filled:after:scale-y-100 data-filled:after:duration-[calc(560ms*var(--kf-speed,1))]",
    "motion-reduce:after:transition-none!",
  ),
  cn(
    "rounded-full bg-[var(--stepper-track,var(--border))] after:rounded-full after:bg-[var(--stepper-accent,var(--primary))]",
    "data-[orientation=horizontal]:absolute data-[orientation=horizontal]:top-[calc(var(--stepper-size,1.75rem)/2-0.75px)] data-[orientation=horizontal]:right-[10px] data-[orientation=horizontal]:left-[calc(var(--stepper-size,1.75rem)+10px)] @max-md/stepper:data-[orientation=horizontal]:right-[4px] @max-md/stepper:data-[orientation=horizontal]:left-[calc(var(--stepper-size,1.75rem)+4px)] data-[orientation=horizontal]:h-[1.5px]",
    "data-[orientation=vertical]:absolute data-[orientation=vertical]:top-[calc(var(--stepper-size,1.75rem)+6px)] data-[orientation=vertical]:bottom-[6px] data-[orientation=vertical]:left-[calc(var(--stepper-size,1.75rem)/2-0.75px)] data-[orientation=vertical]:w-[1.5px]",
  ),
)

export const panelClass = cn(
  cn(
    "transition-[opacity,translate,filter] duration-[calc(460ms*var(--kf-speed,1))] ease-spring",
    "starting:opacity-0 starting:blur-[calc(6px*var(--kf-flourish,1))]",
    "data-[direction=forward]:starting:translate-x-[calc(2rem*var(--kf-flourish,1))] data-[direction=backward]:starting:-translate-x-[calc(2rem*var(--kf-flourish,1))]",
    "data-[orientation=vertical]:data-[direction=forward]:starting:translate-x-0 data-[orientation=vertical]:data-[direction=forward]:starting:translate-y-[calc(1.5rem*var(--kf-flourish,1))]",
    "data-[orientation=vertical]:data-[direction=backward]:starting:translate-x-0 data-[orientation=vertical]:data-[direction=backward]:starting:-translate-y-[calc(1.5rem*var(--kf-flourish,1))]",
    "motion-reduce:transition-none!",
  ),
  "min-w-0 outline-none",
)

/* The words beside an indicator in the default list. Narrow and horizontal: only the current step
   keeps its words. */
export const wordsClass = cn(
  "flex min-w-0 max-w-full flex-col gap-0.5 group-data-last/item:max-w-none",
  "@max-md/stepper:group-data-[orientation=horizontal]/stepper:not-group-data-[state=current]/item:sr-only",
  "group-data-[orientation=vertical]/item:pt-[calc((var(--stepper-size,1.75rem)-18px)/2)]",
)
export const listDescriptionClass = "@max-md/stepper:group-data-[orientation=horizontal]/stepper:hidden"

/* An item's value, for the indicator and connector inside it that are given none (React's
   `from: "item"` props). */
export const itemValueKey: InjectionKey<() => string> = Symbol("kf-stepper-item")
