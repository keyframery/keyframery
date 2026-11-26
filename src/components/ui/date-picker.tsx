"use client"

export * from "@/components/primitives/date-picker"

/* Theming: set on a part or its ancestor; unset variables preserve the original theme.
   --date-picker-face: Field, month keys and popup surface (default: --background / --accent (dark keys) / --popover).
   --date-picker-ink: Input and calendar text (default: --foreground / --popover-foreground).
   --date-picker-accent: Selected day keys (default: --primary).
   --date-picker-radius: Popup corners (default: 14px).
   --date-picker-height: Field height (default: 2.25rem).
   --date-picker-day-size: Day cell size and weekday width (default: 2rem).
 */

/* Styled date picker: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  CalendarDay as CalendarDayPrimitive,
  CalendarGrid as CalendarGridPrimitive,
  CalendarHeading as CalendarHeadingPrimitive,
  CalendarMonthSelect as CalendarMonthSelectPrimitive,
  CalendarNext as CalendarNextPrimitive,
  CalendarPrevious as CalendarPreviousPrimitive,
  CalendarWeekday as CalendarWeekdayPrimitive,
  CalendarWeekdays as CalendarWeekdaysPrimitive,
  CalendarWeeks as CalendarWeeksPrimitive,
  CalendarYearSelect as CalendarYearSelectPrimitive,
  DatePicker as DatePickerPrimitive,
  DatePickerClear as DatePickerClearPrimitive,
  DatePickerContent as DatePickerContentPrimitive,
  DatePickerHint as DatePickerHintPrimitive,
  DatePickerInput as DatePickerInputPrimitive,
  DatePickerPreset as DatePickerPresetPrimitive,
  DatePickerTrigger as DatePickerTriggerPrimitive,
  createDatePickerController,
} from "@/components/primitives/date-picker"
import { Speed, type SpeedProps, useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* What the popup needs from the root: how many months show, and the field box to line up with. */
const PickerContext = React.createContext<{
  months: number
  field: HTMLElement | null
  setField: (element: HTMLElement | null) => void
} | null>(null)

/* The field look, as in Input: one hairline variable that hover, focus and invalid change. */
const fieldBox =
  "rounded-[10px] bg-[var(--date-picker-face,var(--background))] text-[13px] " +
  "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)] " +
  "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)] " +
  "transition-[box-shadow,background-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none! " +
  "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)]"

/* A small key: the month buttons. The primitive springs them back after a press. */
const stepKey = cn(
  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[9px] bg-[var(--date-picker-face,var(--background))] text-muted-foreground outline-none select-none [&_svg]:size-4",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
  "dark:bg-[var(--date-picker-face,var(--accent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "hover:text-[color:var(--date-picker-ink,var(--foreground))] active:shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_1px_rgb(0_0_0/0.04)]",
  "dark:active:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.05),0_1px_2px_rgb(0_0_0/0.6)]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
  "data-disabled:pointer-events-none data-disabled:opacity-40",
)

/* The native month and year selects, as compact fields. */
const selectField = cn(
  "h-7 cursor-pointer appearance-none rounded-[8px] bg-[var(--date-picker-face,var(--background))] px-2 text-[13px] font-medium text-[color:var(--date-picker-ink,var(--foreground))] outline-none",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.16)]",
  "transition-shadow duration-[calc(150ms*var(--kf-speed,1))] focus-visible:shadow-[0_0_0_1px_var(--ring)] focus-visible:ring-[3px] focus-visible:ring-ring/25",
  "dark:focus-visible:shadow-[0_0_0_1px_var(--ring)]",
  "data-disabled:pointer-events-none data-disabled:opacity-40 motion-reduce:transition-none!",
)

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9.5 3.5 5 8l4.5 4.5" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6.5 3.5 11 8l-4.5 4.5" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
      <path d="M2.5 6.75h11M5.5 2v2.5M10.5 2v2.5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m4.5 4.5 7 7m0-7-7 7" />
    </svg>
  )
}

/* The root. The popup lines up with the field box, so the root shares it with the popup. */
function DatePicker({
  speed,
  className,
  children,
  months = 1,
  ...props
}: React.ComponentProps<typeof DatePickerPrimitive> & SpeedProps) {
  const [field, setField] = React.useState<HTMLElement | null>(null)
  const count = Math.max(1, Math.floor(months) || 1)
  return (
    <Speed speed={speed}>
      <PickerContext.Provider value={{ months: count, field, setField }}>
        <DatePickerPrimitive
          className={withClass("group/picker flex w-full flex-col gap-1.5", className)}
          months={months}
          {...props}
        >
          {children ?? (
            <>
              <DatePickerField>
                <DatePickerInput />
                {props.mode === "range" && (
                  <>
                    <span aria-hidden className="px-1 text-muted-foreground/70">–</span>
                    <DatePickerInput end />
                  </>
                )}
                <DatePickerTrigger />
              </DatePickerField>
              <DatePickerContent />
            </>
          )}
        </DatePickerPrimitive>
      </PickerContext.Provider>
    </Speed>
  )
}

/* The field: the typed date and the calendar key sit inside one box, and the ring
   follows the input's focus or the open calendar. The popup lines up with this box. */
function DatePickerField({ className, ...props }: React.ComponentProps<"div">) {
  const picker = React.useContext(PickerContext)
  return (
    <div
      ref={picker?.setField}
      data-slot="date-picker-field"
      className={cn(
        fieldBox,
        "flex h-[var(--date-picker-height,2.25rem)] w-full min-w-0 cursor-text items-center gap-1 pr-1 pl-3 text-muted-foreground",
        "has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/25 has-[input:focus-visible]:[--field-line:var(--ring)] dark:has-[input:focus-visible]:[--field-line:var(--ring)]",
        "group-data-open/picker:[--field-line:var(--ring)] dark:group-data-open/picker:[--field-line:var(--ring)] group-data-open/picker:ring-[3px] group-data-open/picker:ring-ring/25",
        "group-data-invalid/picker:ring-destructive/25! group-data-invalid/picker:[--field-line:var(--destructive)]!",
        "group-data-disabled/picker:cursor-not-allowed group-data-disabled/picker:bg-muted group-data-disabled/picker:[--field-line:rgb(0_0_0/0.06)] dark:group-data-disabled/picker:[--field-line:rgb(255_255_255/0.06)]",
        "group-data-readonly/picker:bg-muted/50",
        className,
      )}
      {...props}
    />
  )
}

function DatePickerInput({
  className,
  ...props
}: React.ComponentProps<typeof DatePickerInputPrimitive>) {
  return (
    <DatePickerInputPrimitive
      className={withClass(
        cn(
          "h-full w-full min-w-0 flex-1 bg-transparent text-[13px] text-[color:var(--date-picker-ink,var(--foreground))] tabular-nums outline-none placeholder:text-muted-foreground/70",
          "data-disabled:cursor-not-allowed data-disabled:text-muted-foreground",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The calendar key at the end of the field. It stays lit while the calendar is open. */
function DatePickerTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DatePickerTriggerPrimitive>) {
  return (
    <DatePickerTriggerPrimitive
      className={withClass(
        cn(
          "grid size-7 shrink-0 cursor-pointer place-items-center rounded-[7px] text-muted-foreground outline-none [&_svg]:size-4",
          "transition-[color,background-color,scale] duration-[calc(200ms*var(--kf-speed,1))]",
          "hover:bg-foreground/[0.06] hover:text-[color:var(--date-picker-ink,var(--foreground))]",
          "data-open:bg-accent data-open:text-[color:var(--date-picker-ink,var(--foreground))]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          "data-disabled:pointer-events-none data-disabled:opacity-50",
        ),
        className,
      )}
      {...props}
    >
      {children ?? <CalendarIcon />}
    </DatePickerTriggerPrimitive>
  )
}

function DatePickerHint({
  className,
  ...props
}: React.ComponentProps<typeof DatePickerHintPrimitive>) {
  return (
    <DatePickerHintPrimitive
      className={withClass("px-0.5 text-[12px] text-muted-foreground tabular-nums group-data-invalid/picker:text-destructive", className)}
      {...props}
    />
  )
}

/* Clears the date. It shrinks away while there's nothing to clear. */
function DatePickerClear({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DatePickerClearPrimitive>) {
  return (
    <DatePickerClearPrimitive
      className={withClass(
        cn(
          "grid size-6 shrink-0 cursor-pointer place-items-center rounded-[7px] text-muted-foreground outline-none [&_svg]:size-3.5",
          "transition-[color,background-color,opacity,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house",
          "hover:bg-foreground/[0.06] hover:text-[color:var(--date-picker-ink,var(--foreground))] active:scale-[calc(1-0.1*var(--kf-flourish,1))]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          "data-empty:pointer-events-none data-empty:scale-[calc(0.95-0.2*var(--kf-flourish,1))] data-empty:opacity-0",
          "data-disabled:pointer-events-none data-disabled:opacity-0 motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    >
      {children ?? <XIcon />}
    </DatePickerClearPrimitive>
  )
}

/* A shortcut like "This weekend". The chosen one reads as a pressed key. */
function DatePickerPreset({
  className,
  ...props
}: React.ComponentProps<typeof DatePickerPresetPrimitive>) {
  return (
    <DatePickerPresetPrimitive
      className={withClass(
        cn(
          "inline-flex h-7 cursor-pointer items-center rounded-[8px] px-2.5 text-[12px] leading-none font-medium whitespace-nowrap text-muted-foreground outline-none select-none",
          "transition-[color,background-color,box-shadow,scale] duration-[calc(200ms*var(--kf-speed,1))]",
          "hover:bg-foreground/[0.05] hover:text-[color:var(--date-picker-ink,var(--foreground))]",
          "data-selected:bg-[var(--date-picker-face,var(--background))] data-selected:text-[color:var(--date-picker-ink,var(--foreground))] data-selected:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
          "dark:data-selected:bg-accent dark:data-selected:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
          "data-disabled:pointer-events-none data-disabled:opacity-40",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The sheet. The primitive unfolds it out of the field. Without children it lays out a styled calendar. */
function DatePickerContent({
  className,
  children,
  sideOffset = 6,
  collisionPadding = 12,
  anchor,
  style,
  ...props
}: React.ComponentProps<typeof DatePickerContentPrimitive>) {
  const picker = React.useContext(PickerContext)
  const months = picker?.months ?? 1
  return (
    <DatePickerContentPrimitive
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      anchor={anchor ?? picker?.field ?? undefined}
      className={withClass(
        cn(
          "z-50 flex w-max flex-col gap-2 rounded-[var(--date-picker-radius,14px)] bg-[var(--date-picker-face,var(--popover))] p-3 text-[color:var(--date-picker-ink,var(--popover-foreground))] outline-none",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
          "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
          /* As a sheet on small touch screens: full width, square at the bottom edge. */
          "data-[presentation=sheet]:w-full data-[presentation=sheet]:items-center data-[presentation=sheet]:rounded-b-none data-[presentation=sheet]:pb-6",
        ),
        className,
      )}
      {...props} style={useSpeedStyle(style)}
    >
      {children ?? (
        <>
          <CalendarHeader>
            <CalendarPrevious />
            <CalendarHeading />
            <CalendarNext />
          </CalendarHeader>
          <div className="flex gap-4">
            {Array.from({ length: months }, (_, offset) => (
              <CalendarGrid key={offset} offset={offset} />
            ))}
          </div>
        </>
      )}
    </DatePickerContentPrimitive>
  )
}

/* The calendar parts, as Calendar styles them, for inside the popup. */

/* The row above the grid. The heading sits first, the month keys after it. */
function CalendarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="calendar-header"
      className={cn("flex h-7 items-center gap-1.5", className)}
      {...props}
    />
  )
}

function CalendarHeading({
  className,
  ...props
}: React.ComponentProps<typeof CalendarHeadingPrimitive>) {
  return (
    <CalendarHeadingPrimitive
      className={withClass("order-first mr-auto pl-1.5 text-[15px] font-semibold tracking-tight tabular-nums", className)}
      {...props}
    />
  )
}

function CalendarPrevious({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CalendarPreviousPrimitive>) {
  return (
    <CalendarPreviousPrimitive className={withClass(stepKey, className)} {...props}>
      {children ?? <ChevronLeftIcon />}
    </CalendarPreviousPrimitive>
  )
}

function CalendarNext({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CalendarNextPrimitive>) {
  return (
    <CalendarNextPrimitive className={withClass(stepKey, className)} {...props}>
      {children ?? <ChevronRightIcon />}
    </CalendarNextPrimitive>
  )
}

function CalendarMonthSelect({
  className,
  ...props
}: React.ComponentProps<typeof CalendarMonthSelectPrimitive>) {
  return <CalendarMonthSelectPrimitive className={withClass(selectField, className)} {...props} />
}

function CalendarYearSelect({
  className,
  ...props
}: React.ComponentProps<typeof CalendarYearSelectPrimitive>) {
  return (
    <CalendarYearSelectPrimitive
      className={withClass(
        cn(
          selectField, "tabular-nums",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* One month. The primitive draws the chosen day's key here, as `before:` (the date or a range's
   start) and `after:` (a range's end), and glides it between days. This gives it the primary key look. */
const chosenKey = cn(
  "before:rounded-[9px] before:bg-[var(--date-picker-accent,var(--primary))] after:rounded-[9px] after:bg-[var(--date-picker-accent,var(--primary))]",
  "before:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] after:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]",
  "dark:before:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)] dark:after:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]",
)

function CalendarGrid({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CalendarGridPrimitive>) {
  return (
    <CalendarGridPrimitive
      className={withClass(
        cn(
          "border-separate border-spacing-x-0 border-spacing-y-0.5 data-disabled:opacity-50",
          chosenKey,
        ),
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <CalendarWeekdays />
          <CalendarWeeks />
        </>
      )}
    </CalendarGridPrimitive>
  )
}

function CalendarWeekdays({
  children,
  ...props
}: React.ComponentProps<typeof CalendarWeekdaysPrimitive>) {
  return (
    <CalendarWeekdaysPrimitive {...props}>
      {children ?? ((index) => <CalendarWeekday index={index} />)}
    </CalendarWeekdaysPrimitive>
  )
}

function CalendarWeekday({
  className,
  ...props
}: React.ComponentProps<typeof CalendarWeekdayPrimitive>) {
  return (
    <CalendarWeekdayPrimitive
      className={withClass("h-7 w-[var(--date-picker-day-size,2rem)] p-0 text-center text-[11px] font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function CalendarWeeks({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CalendarWeeksPrimitive>) {
  return (
    <CalendarWeeksPrimitive
      className={className}
      {...props}
    >
      {children ?? ((cell) => <CalendarDay value={cell.date} />)}
    </CalendarWeeksPrimitive>
  )
}

/* A day. The chosen key is drawn under it by the grid, so a chosen day only turns its number
   to the key's text colour. A range is a soft band between the two keys, rounded where a week wraps. */
function CalendarDay({
  className,
  ...props
}: React.ComponentProps<typeof CalendarDayPrimitive>) {
  return (
    <CalendarDayPrimitive
      className={withClass(
        cn(
          "relative size-[var(--date-picker-day-size,2rem)] cursor-pointer rounded-[9px] p-0 text-center align-middle text-[13px] leading-none font-medium text-[color:var(--date-picker-ink,var(--foreground))] tabular-nums outline-none select-none",
          "transition-[color,background-color,scale] duration-[calc(200ms*var(--kf-speed,1))]",
          "not-data-selected:not-data-range-start:not-data-range-end:hover:bg-foreground/[0.06]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          /* Chosen: the number sits on the primary key. */
          "data-selected:not-data-range-middle:text-primary-foreground data-range-start:text-primary-foreground data-range-end:text-primary-foreground",
          /* Today: a small dot under the number. */
          "data-today:font-semibold data-today:after:absolute data-today:after:bottom-[3px] data-today:after:left-1/2 data-today:after:size-1 data-today:after:-translate-x-1/2 data-today:after:rounded-full data-today:after:bg-foreground",
          "data-selected:not-data-range-middle:after:bg-primary-foreground data-range-start:after:bg-primary-foreground data-range-end:after:bg-primary-foreground",
          /* A range: the band between the keys. */
          "data-range-middle:rounded-none data-range-middle:bg-accent data-range-middle:text-accent-foreground data-range-middle:first:rounded-l-[9px] data-range-middle:last:rounded-r-[9px]",
          "data-preview:not-data-range-start:not-data-range-end:rounded-none data-preview:not-data-range-start:not-data-range-end:bg-accent/70 data-preview:first:rounded-l-[9px] data-preview:last:rounded-r-[9px]",
          "data-outside:text-muted-foreground/55",
          "data-disabled:cursor-default data-disabled:text-muted-foreground/45 data-disabled:hover:bg-transparent",
          "data-unavailable:line-through",
          "motion-reduce:transition-none!",
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
  CalendarHeader,
  CalendarHeading,
  CalendarMonthSelect,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  CalendarYearSelect,
  DatePicker,
  DatePickerClear,
  DatePickerContent,
  DatePickerField,
  DatePickerHint,
  DatePickerInput,
  DatePickerPreset,
  DatePickerTrigger,
  createDatePickerController,
}
