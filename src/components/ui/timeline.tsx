"use client"

/* Styled timeline: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Timeline as TimelineRoot,
  TimelineConnector as TimelineConnectorPart,
  TimelineDescription as TimelineDescriptionPart,
  TimelineItem as TimelineItemPart,
  TimelineMarker as TimelineMarkerPart,
  TimelineTime as TimelineTimePart,
  TimelineTitle as TimelineTitlePart,
  createTimelineController,
} from "@/components/primitives/timeline"
import { cn } from "@/lib/utils"

/* The events, one above the other, or side by side in a row of equal columns. */
function Timeline({ className, ...props }: React.ComponentProps<typeof TimelineRoot>) {
  return (
    <TimelineRoot
      className={cn(
        "flex flex-col text-[13px]",
        "data-[orientation=horizontal]:grid data-[orientation=horizontal]:grid-cols-[repeat(var(--timeline-count,1),minmax(0,1fr))]",
        "data-busy:opacity-70",
        className,
      )}
      {...props}
    />
  )
}

/* One event. The marker has its own column and the text sits beside it. The primitive
   cascades the events in when the timeline first appears. */
function TimelineItem({ className, ...props }: React.ComponentProps<typeof TimelineItemPart>) {
  return (
    <TimelineItemPart
      className={cn(
        "relative -mx-2 grid grid-cols-[20px_minmax(0,1fr)_auto] content-start gap-x-3 rounded-[10px] px-2 pt-1.5 pb-4 outline-none last:pb-1.5",
        "data-[orientation=horizontal]:mx-0 data-[orientation=horizontal]:grid-cols-[minmax(0,1fr)] data-[orientation=horizontal]:px-0 data-[orientation=horizontal]:pr-4 data-[orientation=horizontal]:pb-1.5",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    />
  )
}

/* The dot on the rail. A plain event is a small dot; an upcoming step is hollow; the
   current step is a primary key; a finished step turns the one success green, and the
   primitive pops it and draws its check. */
function TimelineMarker({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TimelineMarkerPart>) {
  return (
    <TimelineMarkerPart
      className={cn(
        "relative col-start-1 [--kf-draw:11] row-start-1 grid size-5 place-items-center self-start",
        "data-[orientation=horizontal]:mb-2.5",
        /* The dot itself, drawn behind any icon. */
        "before:absolute before:top-1/2 before:left-1/2 before:size-2 before:-translate-1/2 before:rounded-full before:bg-muted-foreground/45",
        "before:transition-[width,height,background-color,box-shadow] before:duration-[calc(200ms*var(--kf-speed,1))] before:ease-house",
        "data-upcoming:before:size-2.5 data-upcoming:before:bg-background data-upcoming:before:shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--foreground)_24%,transparent)]",
        "data-current:before:size-4 data-current:before:bg-primary",
        "data-current:before:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25),0_0_0_4px_color-mix(in_oklab,var(--primary)_10%,transparent)]",
        "dark:data-current:before:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5),0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]",
        "data-complete:before:size-4 data-complete:before:bg-[oklch(0.62_0.16_150)] data-complete:before:shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_1px_2px_rgb(0_0_0/0.2)]",
        /* The current step's centre. */
        "after:absolute after:top-1/2 after:left-1/2 after:size-0 after:-translate-1/2 after:rounded-full after:bg-primary-foreground after:transition-[width,height] after:duration-[calc(200ms*var(--kf-speed,1))]",
        "data-current:after:size-1.5",
        "[&_svg]:relative [&_svg]:size-3 [&_svg]:text-white",
        "motion-reduce:before:transition-none! motion-reduce:after:transition-none!",
        className,
      )}
      {...props}
    >
      {children ??
        ((state) =>
          state.status === "complete" && (
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m4.5 8.25 2.25 2.25 4.75-5" />
            </svg>
          ))}
    </TimelineMarkerPart>
  )
}

/* The hairline from this event's marker down to the next one. Past a finished step the
   primitive fills it, so the rail reads as travelled. The last event has none. */
function TimelineConnector({
  className,
  ...props
}: React.ComponentProps<typeof TimelineConnectorPart>) {
  return (
    <TimelineConnectorPart
      className={cn(
        "pointer-events-none absolute top-[30px] -bottom-1 left-[17.5px] w-px rounded-full bg-border",
        "after:bg-foreground/30",
        "data-[orientation=horizontal]:top-[15.5px] data-[orientation=horizontal]:right-1 data-[orientation=horizontal]:bottom-auto data-[orientation=horizontal]:left-6 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-auto",
        "in-data-last:hidden",
        className,
      )}
      {...props}
    />
  )
}

function TimelineTitle({ className, ...props }: React.ComponentProps<typeof TimelineTitlePart>) {
  return (
    <TimelineTitlePart
      className={cn(
        "col-start-2 row-start-1 min-w-0 self-center leading-5 font-medium text-foreground",
        "data-upcoming:text-muted-foreground data-current:font-semibold",
        "data-[orientation=horizontal]:col-start-1 data-[orientation=horizontal]:row-start-2",
        className,
      )}
      {...props}
    />
  )
}

function TimelineTime({ className, ...props }: React.ComponentProps<typeof TimelineTimePart>) {
  return (
    <TimelineTimePart
      className={cn(
        "col-start-3 row-start-1 self-center text-[12px] leading-5 whitespace-nowrap text-muted-foreground tabular-nums",
        "data-[orientation=horizontal]:col-start-1 data-[orientation=horizontal]:row-start-3",
        className,
      )}
      {...props}
    />
  )
}

function TimelineDescription({
  className,
  ...props
}: React.ComponentProps<typeof TimelineDescriptionPart>) {
  return (
    <TimelineDescriptionPart
      className={cn(
        "col-span-2 col-start-2 row-start-2 mt-0.5 text-[13px] leading-[18px] text-muted-foreground",
        "data-upcoming:text-muted-foreground/80",
        "data-[orientation=horizontal]:col-span-1 data-[orientation=horizontal]:col-start-1 data-[orientation=horizontal]:row-start-4",
        className,
      )}
      {...props}
    />
  )
}

export {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
  createTimelineController,
}
