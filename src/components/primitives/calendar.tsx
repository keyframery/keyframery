"use client"

/* Animated drop-in for `@ui-sdk/react/calendar`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Glide: the chosen day's key is one surface per grid that glides from day to day, drawn by the grid
     and placed with CSS anchors. In a range there are two, one for each end, and the end key follows the
     pointer while a range is being picked. Style them with `before:` (the date, or a range's start) and
     `after:` (a range's end) on CalendarGrid.
   - Direction: a new month's weeks come in from the side the months turned to, with a blur.
   - Press: days and the month buttons give under the pointer and spring back. */

import {
  Calendar as CalendarRoot,
  CalendarDay as CalendarDayPart,
  CalendarGrid as CalendarGridPart,
  CalendarHeading,
  CalendarNext as CalendarNextPart,
  CalendarPrevious as CalendarPreviousPart,
  CalendarWeekdays,
  CalendarWeeks as CalendarWeeksPart,
} from "@ui-sdk/react/calendar"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/calendar"

/* The month the first grid showed when it last rendered, so a month change can tell whether it
   went forward or back. Without the animated Calendar around them the weeks simply fade in. */
const ShownMonthContext = React.createContext<React.RefObject<string | null> | null>(null)

/* Marks the way the months last turned as `data-direction="next" | "previous"`. */
function Calendar({
  className,
  children,
  onMonthChange,
  ...props
}: React.ComponentProps<typeof CalendarRoot>) {
  const shown = React.useRef<string | null>(null)
  const [direction, setDirection] = React.useState<"next" | "previous" | "none">("none")
  const months = Math.max(1, Math.floor(props.months ?? 1) || 1)
  return (
    <ShownMonthContext.Provider value={shown}>
      <CalendarRoot
        data-direction={direction}
        className={withClass("group/calendar", className)}
        onMonthChange={(month, details) => {
          setDirection(shown.current && month < shown.current ? "previous" : "next")
          onMonthChange?.(month, details)
        }}
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
      </CalendarRoot>
    </ShownMonthContext.Provider>
  )
}

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
  const shown = React.useContext(ShownMonthContext)
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
          "group-data-[mode=multiple]/calendar:before:hidden group-data-[mode=multiple]/calendar:after:hidden",
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
        "group-data-[direction=none]/calendar:starting:opacity-100 group-data-[direction=none]/calendar:starting:blur-none",
        "group-data-[direction=next]/calendar:starting:translate-x-7 group-data-[direction=previous]/calendar:starting:-translate-x-7",
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

export { Calendar, CalendarDay, CalendarGrid, CalendarNext, CalendarPrevious, CalendarWeeks }
