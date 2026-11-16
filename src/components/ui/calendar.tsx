"use client"

/* Styled calendar: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Calendar as CalendarPrimitive,
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
} from "@/components/primitives/calendar"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* A small key: the month buttons. The primitive springs them back after a press. */
const stepKey = cn(
  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[9px] bg-background text-muted-foreground outline-none select-none [&_svg]:size-4",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
  "dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "hover:text-foreground active:shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_1px_rgb(0_0_0/0.04)]",
  "dark:active:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.05),0_1px_2px_rgb(0_0_0/0.6)]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
  "data-disabled:pointer-events-none data-disabled:opacity-40",
)

/* The native month and year selects, as compact fields. */
const selectField = cn(
  "h-7 cursor-pointer appearance-none rounded-[8px] bg-background px-2 text-[13px] font-medium text-foreground outline-none",
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

/* The card. Without children it lays out the heading, the month keys and a grid per month. */
function Calendar({
  speed,
  className,
  children,
  ...props
}: React.ComponentProps<typeof CalendarPrimitive> & SpeedProps) {
  const months = Math.max(1, Math.floor(props.months ?? 1) || 1)
  return (
    <Speed speed={speed}>
      <CalendarPrimitive
        className={cn(
          "flex w-fit flex-col gap-2 rounded-[14px] bg-card p-3 text-card-foreground",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_6px_16px_-6px_rgb(0_0_0/0.1)]",
          "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_6px_16px_-6px_rgb(0_0_0/0.6)]",
          className,
        )}
        {...props}
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
      </CalendarPrimitive>
    </Speed>
  )
}

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
      className={cn(
        "order-first mr-auto pl-1.5 text-[15px] font-semibold tracking-tight tabular-nums",
        className,
      )}
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
    <CalendarPreviousPrimitive className={cn(stepKey, className)} {...props}>
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
    <CalendarNextPrimitive className={cn(stepKey, className)} {...props}>
      {children ?? <ChevronRightIcon />}
    </CalendarNextPrimitive>
  )
}

function CalendarMonthSelect({
  className,
  ...props
}: React.ComponentProps<typeof CalendarMonthSelectPrimitive>) {
  return <CalendarMonthSelectPrimitive className={cn(selectField, className)} {...props} />
}

function CalendarYearSelect({
  className,
  ...props
}: React.ComponentProps<typeof CalendarYearSelectPrimitive>) {
  return (
    <CalendarYearSelectPrimitive
      className={cn(selectField, "tabular-nums", className)}
      {...props}
    />
  )
}

/* One month. The primitive draws the chosen day's key here, as `before:` (the date or a range's
   start) and `after:` (a range's end), and glides it between days. This gives it the primary key look. */
const chosenKey = cn(
  "before:rounded-[9px] before:bg-primary after:rounded-[9px] after:bg-primary",
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
      className={cn(
        "border-separate border-spacing-x-0 border-spacing-y-0.5 data-disabled:opacity-50",
        chosenKey,
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
      className={cn(
        "h-7 w-8 p-0 text-center text-[11px] font-medium text-muted-foreground",
        className,
      )}
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
      className={cn(
        "relative size-8 cursor-pointer rounded-[9px] p-0 text-center align-middle text-[13px] leading-none font-medium text-foreground tabular-nums outline-none select-none",
        "transition-[color,background-color,scale] duration-[calc(200ms*var(--kf-speed,1))]",
        "not-data-selected:not-data-range-start:not-data-range-end:hover:bg-foreground/[0.06]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        /* Chosen: the number sits on the primary key. */
        "data-selected:not-data-range-middle:text-primary-foreground data-range-start:text-primary-foreground data-range-end:text-primary-foreground",
        "group-data-[mode=multiple]/calendar:data-selected:bg-primary",
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
        className,
      )}
      {...props}
    />
  )
}

export {
  Calendar,
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
}

/* UI SDK's helpers for this component, passed through. */
export { createCalendarController } from "@/components/primitives/calendar"
