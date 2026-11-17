"use client"

/* Animated drop-in for `@ui-sdk/react/date-picker`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Unfold: the calendar pops out of the field from the point the doc gives, on a spring.
   - Inside it, as the animated calendar: the chosen day's key glides between days (style it with
     `before:` and `after:` on CalendarGrid), and a new month comes in from the side it was reached from.
   - Press: the trigger, the month buttons, the days and the presets give under the pointer. */

import {
  CalendarDay as CalendarDayPart,
  CalendarGrid as CalendarGridPart,
  CalendarHeading,
  CalendarNext as CalendarNextPart,
  CalendarPrevious as CalendarPreviousPart,
  CalendarWeekdays,
  CalendarWeeks as CalendarWeeksPart,
  DatePicker as DatePickerRoot,
  DatePickerContent as DatePickerContentPart,
  DatePickerInput,
  DatePickerPreset as DatePickerPresetPart,
  DatePickerTrigger as DatePickerTriggerPart,
} from "@ui-sdk/react/date-picker"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/date-picker"

/* What the popup needs from the root: which way the months last turned, and how many show. */
const PickerContext = React.createContext<{
  shown: React.RefObject<string | null>
  direction: "next" | "previous" | "none"
  months: number
} | null>(null)

/* Notes which way the months turn. Opening or closing starts fresh, so a reopened calendar
   doesn't slide. */
function DatePicker({
  children,
  onMonthChange,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DatePickerRoot>) {
  const shown = React.useRef<string | null>(null)
  const [direction, setDirection] = React.useState<"next" | "previous" | "none">("none")
  const months = Math.max(1, Math.floor(props.months ?? 1) || 1)
  return (
    <PickerContext.Provider value={{ shown, direction, months }}>
      <DatePickerRoot
        onMonthChange={(month, details) => {
          setDirection(shown.current && month < shown.current ? "previous" : "next")
          onMonthChange?.(month, details)
        }}
        onOpenChange={(open, details) => {
          setDirection("none")
          onOpenChange?.(open, details)
        }}
        {...props}
      >
        {children ?? (
          <>
            <DatePickerInput />
            {props.mode === "range" && <DatePickerInput end />}
            <DatePickerTrigger />
            <DatePickerContent />
          </>
        )}
      </DatePickerRoot>
    </PickerContext.Provider>
  )
}

function DatePickerTrigger({ className, ...props }: React.ComponentProps<typeof DatePickerTriggerPart>) {
  return (
    <DatePickerTriggerPart
      className={withClass("transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.9] data-disabled:active:scale-100 motion-reduce:transition-none!", className)}
      {...props}
    />
  )
}

function DatePickerPreset({ className, ...props }: React.ComponentProps<typeof DatePickerPresetPart>) {
  return (
    <DatePickerPresetPart
      className={withClass("transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] data-disabled:active:scale-100 motion-reduce:transition-none!", className)}
      {...props}
    />
  )
}

/* Unfold: from 0.86 and a 6px blur, 8px toward the field, growing from the point the doc gives;
   in on a spring, out quickly to 0.96. Without children it lays out a calendar. */
function DatePickerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DatePickerContentPart>) {
  const picker = React.useContext(PickerContext)
  const months = picker?.months ?? 1
  return (
    <DatePickerContentPart
      data-direction={picker?.direction ?? "none"}
      className={withClass(
        cn(
          "group/picker-content origin-(--transform-origin)",
          "transition-[opacity,scale,translate,filter] duration-[calc(380ms*var(--kf-speed,1))] ease-spring",
          "data-starting-style:scale-[0.86] data-starting-style:opacity-0 data-starting-style:blur-[6px]",
          "data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:blur-[6px] data-ending-style:duration-[calc(150ms*var(--kf-speed,1))] data-ending-style:ease-house",
          "data-[side=bottom]:data-starting-style:-translate-y-2 data-[side=top]:data-starting-style:translate-y-2",
          "data-[side=left]:data-starting-style:translate-x-2 data-[side=right]:data-starting-style:-translate-x-2",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <CalendarPrevious />
          <CalendarHeading />
          <CalendarNext />
          {Array.from({ length: months }, (_, offset) => (
            <CalendarGrid key={offset} offset={offset} />
          ))}
        </>
      )}
    </DatePickerContentPart>
  )
}

/* The calendar parts, animated as in the calendar primitive. */

const pressable =
  "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.92] data-disabled:active:scale-100 motion-reduce:transition-none!"

function CalendarPrevious({ className, ...props }: React.ComponentProps<typeof CalendarPreviousPart>) {
  return <CalendarPreviousPart className={withClass(pressable, className)} {...props} />
}

function CalendarNext({ className, ...props }: React.ComponentProps<typeof CalendarNextPart>) {
  return <CalendarNextPart className={withClass(pressable, className)} {...props} />
}

/* One month. Its rows are keyed by the month, so a new month arrives as new rows.
   The keys: neutral surfaces that follow the text colour until you give them your own. They glide
   on a spring, and fade in late when a month that holds the chosen day arrives, so they land
   after the weeks have slid in. In "multiple" mode there is no single key to glide. */
function CalendarGrid({
  className,
  children,
  offset = 0,
  ...props
}: React.ComponentProps<typeof CalendarGridPart>) {
  const shown = React.useContext(PickerContext)?.shown ?? null
  return (
    <CalendarGridPart
      offset={offset}
      className={withClass(
        cn(
          "relative isolate [anchor-scope:--kf-day-a,--kf-day-b]",
          "before:pointer-events-none before:absolute before:-z-10 before:opacity-0 before:content-[''] before:[position-anchor:--kf-day-a]",
          "before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
          "before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
          "before:[transition:top_calc(300ms*var(--kf-speed,1))_var(--ease-spring),right_calc(300ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(300ms*var(--kf-speed,1))_var(--ease-spring),left_calc(300ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(220ms*var(--kf-speed,1))_var(--ease-house)_calc(180ms*var(--kf-speed,1))]",
          "motion-reduce:before:[transition:none]!",
          "after:pointer-events-none after:absolute after:-z-10 after:opacity-0 after:content-[''] after:[position-anchor:--kf-day-b]",
          "after:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
          "after:top-[anchor(top)] after:right-[anchor(right)] after:bottom-[anchor(bottom)] after:left-[anchor(left)]",
          "after:[transition:top_calc(300ms*var(--kf-speed,1))_var(--ease-spring),right_calc(300ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(300ms*var(--kf-speed,1))_var(--ease-spring),left_calc(300ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(220ms*var(--kf-speed,1))_var(--ease-house)_calc(180ms*var(--kf-speed,1))]",
          "motion-reduce:after:[transition:none]!",
          "has-[[data-slot=calendar-day][data-selected]:not([data-range-middle]),[data-slot=calendar-day][data-range-start]]:before:opacity-100",
          "has-[[data-slot=calendar-day][data-range-end]]:after:opacity-100",
        ),
        className,
      )}
      {...props}
    >
      {(grid) => {
        if (shown && offset === 0) shown.current = grid.month
        return (
          <React.Fragment key={grid.month}>
            {typeof children === "function"
              ? children(grid)
              : (children ?? (
                  <>
                    <CalendarWeekdays />
                    <CalendarWeeks />
                  </>
                ))}
          </React.Fragment>
        )
      }}
    </CalendarGridPart>
  )
}

/* Direction: the new weeks come 28px from the side the months turned to, blurred, on a spring. */
function CalendarWeeks({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CalendarWeeksPart>) {
  return (
    <CalendarWeeksPart
      className={cn(
        "transition-[opacity,filter,translate] duration-[calc(460ms*var(--kf-speed,1))] ease-spring",
        "starting:opacity-0 starting:blur-[6px]",
        "group-data-[direction=none]/picker-content:starting:opacity-100 group-data-[direction=none]/picker-content:starting:blur-none",
        "group-data-[direction=next]/picker-content:starting:translate-x-7 group-data-[direction=previous]/picker-content:starting:-translate-x-7",
        "motion-reduce:transition-none!",
        className,
      )}
      {...props}
    >
      {children ?? ((cell) => <CalendarDay value={cell.date} />)}
    </CalendarWeeksPart>
  )
}

/* Names itself as the anchor the grid's keys follow, and gives under the pointer. */
function CalendarDay({ className, ...props }: React.ComponentProps<typeof CalendarDayPart>) {
  return (
    <CalendarDayPart
      className={withClass(
        cn(
          "data-selected:not-data-range-middle:not-data-range-end:[anchor-name:--kf-day-a] data-range-start:[anchor-name:--kf-day-a]",
          "data-range-end:[anchor-name:--kf-day-b] data-range-start:data-range-end:[anchor-name:--kf-day-a,--kf-day-b]",
          "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.9] data-disabled:active:scale-100 motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export {
  CalendarDay,
  CalendarGrid,
  CalendarNext,
  CalendarPrevious,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerPreset,
  DatePickerTrigger,
}
