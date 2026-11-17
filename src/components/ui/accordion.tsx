"use client"

export * from "@/components/primitives/accordion"

/* Theming: set on a part or its ancestor; unset variables preserve the original theme.
   --accordion-border: Row dividers (default: --border).
   --accordion-radius: Trigger corners (default: 8px).
   --accordion-padding: Trigger vertical padding (default: 0.875rem).
   --accordion-ink: Trigger and active icon text (default: --foreground).
   --accordion-muted: Panel and resting icon text (default: --muted-foreground).
 */

/* Styled accordion: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Accordion as AccordionRoot,
  AccordionHeader as AccordionHeaderPart,
  AccordionItem as AccordionItemPart,
  AccordionPanel as AccordionPanelPart,
  AccordionTrigger as AccordionTriggerPart,
} from "@/components/primitives/accordion"
import { mapChildren, Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Accordion({ speed, className, ...props }: React.ComponentProps<typeof AccordionRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <AccordionRoot className={withClass("flex w-full flex-col", className)} {...props} />
    </Speed>
  )
}

/* Rows are separated by one hairline; the last row has none. */
function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionItemPart>) {
  return (
    <AccordionItemPart
      className={withClass("border-b border-[color:var(--accordion-border,var(--border))] last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionHeader({
  className,
  ...props
}: React.ComponentProps<typeof AccordionHeaderPart>) {
  return <AccordionHeaderPart className={withClass("m-0 flex", className)} {...props} />
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionTriggerPart>) {
  return (
    <AccordionTriggerPart
      className={withClass(
        cn(
          "group/accordion-trigger flex w-full cursor-pointer items-center gap-4 rounded-[var(--accordion-radius,8px)] py-[var(--accordion-padding,0.875rem)] text-left text-[14px] leading-5 font-medium text-[color:var(--accordion-ink,var(--foreground))] outline-none select-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "aria-disabled:cursor-default data-disabled:cursor-not-allowed data-disabled:opacity-40",
        ),
        className,
      )}
      {...props}
    >
      {(state) => (
        <>
          <span className="min-w-0 flex-1">
            {typeof children === "function" ? children(state) : children}
          </span>
          {/* The chevron sits on a small disc that answers hover and press, and turns half a circle when the row opens. */}
          <span
            aria-hidden
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-full text-[color:var(--accordion-muted,var(--muted-foreground))]",
              "[transition:background-color_calc(150ms*var(--kf-speed,1)),color_calc(150ms*var(--kf-speed,1)),scale_calc(220ms*var(--kf-speed,1))_var(--ease-pop)]",
              "group-hover/accordion-trigger:bg-foreground/[0.06] group-hover/accordion-trigger:text-[color:var(--accordion-ink,var(--foreground))]",
              "group-active/accordion-trigger:scale-90 group-active/accordion-trigger:bg-foreground/[0.1]",
              "group-data-open/accordion-trigger:text-[color:var(--accordion-ink,var(--foreground))]",
              "group-data-disabled/accordion-trigger:bg-transparent group-data-disabled/accordion-trigger:scale-100 group-data-disabled/accordion-trigger:text-[color:var(--accordion-muted,var(--muted-foreground))]",
              "motion-reduce:transition-none!",
            )}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 transition-[rotate] duration-[calc(480ms*var(--kf-speed,1))] ease-spring group-data-open/accordion-trigger:rotate-180 motion-reduce:transition-none!"
            >
              <path d="m4 6 4 4 4-4" />
            </svg>
          </span>
        </>
      )}
    </AccordionTriggerPart>
  )
}

/* The motion (height and the cascade of the content) comes from the primitive. Plain text is
   wrapped in a paragraph so it has an element to cascade; the padding sits on the children so
   the panel can close to zero. */
function AccordionPanel({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPanelPart>) {
  return (
    <AccordionPanelPart
      className={withClass("text-[13px] leading-[1.55] text-[color:var(--accordion-muted,var(--muted-foreground))] *:pr-10 [&>:last-child]:pb-4", className)}
      {...props}
    >
      {mapChildren(children, (content) =>
        React.Children.map(content, (child) =>
          typeof child === "string" || typeof child === "number" ? <p>{child}</p> : child,
        ),
      )}
    </AccordionPanelPart>
  )
}

export { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger }

/* UI SDK's helpers for this component, passed through. */
export { createAccordionController } from "@/components/primitives/accordion"
