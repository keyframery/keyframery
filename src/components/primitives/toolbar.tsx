"use client"

/* Animated drop-in for `@ui-sdk/react/toolbar`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.
   - Glide: one highlight springs from item to item under the pointer or keyboard focus, instead of
     each item lighting up on its own. It is the toolbar's `::before`; give it a colour and radius with
     `before:` classes. The default follows the text colour.
   - Press: items give under the pointer and spring back with a small pop.
   `ToolbarToggle` and `ToolbarToggleGroup` are extra: `@ui-sdk/react/toggle` parts with the same press. */

import { Toggle as TogglePart, ToggleGroup as ToggleGroupPart } from "@ui-sdk/react/toggle"
import {
  Toolbar as ToolbarRoot,
  ToolbarButton as ToolbarButtonPart,
  ToolbarLink as ToolbarLinkPart,
} from "@ui-sdk/react/toolbar"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/toolbar"

/* Everything the highlight can rest on. Inputs keep their own field look. */
const ITEM =
  '[data-slot="toolbar-button"],[data-slot="toolbar-link"],[data-slot="toggle"]'
const MARK = "data-kf-toolbar-hl"

/* Colours and shadows ease as the pointer arrives; the press springs back with a pop. */
const press = cn(
  "[transition:color_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop)]",
  "not-data-disabled:active:scale-[0.92] not-data-disabled:active:[transition-duration:calc(100ms*var(--kf-speed,1))]",
  "motion-reduce:[transition:none]!",
)

/* Moves the mark to `item`, or hides the highlight where it is (so it can glide on from there). */
function mark(root: HTMLElement, item: Element | null) {
  if (!item || item.hasAttribute("data-disabled")) {
    root.setAttribute("data-kf-idle", "")
    return
  }
  for (const old of root.querySelectorAll(`[${MARK}]`)) if (old !== item) old.removeAttribute(MARK)
  item.setAttribute(MARK, "")
  root.removeAttribute("data-kf-idle")
  /* The first time, the highlight appears in place; from then on it glides. */
  if (!root.hasAttribute("data-kf-glide")) setTimeout(() => root.setAttribute("data-kf-glide", ""), 40)
}

function itemFrom(root: HTMLElement, target: EventTarget | null) {
  const item = target instanceof Element ? target.closest(ITEM) : null
  return item && root.contains(item) ? item : null
}

function Toolbar({
  className,
  onPointerOver,
  onPointerLeave,
  onFocus,
  onBlur,
  onClick,
  ...props
}: React.ComponentProps<typeof ToolbarRoot>) {
  const hovering = React.useRef(false)
  return (
    <ToolbarRoot
      className={withClass(
        cn(
          "relative isolate [anchor-scope:--kf-toolbar-hl]",
          "[&_[data-kf-toolbar-hl]]:[anchor-name:--kf-toolbar-hl]",
          "before:pointer-events-none before:absolute before:-z-10 before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
          "before:[position-anchor:--kf-toolbar-hl] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
          "before:scale-100 before:opacity-100 before:transition-[opacity,scale] before:duration-[calc(200ms*var(--kf-speed,1))] before:ease-house",
          "data-kf-glide:before:[transition:top_calc(360ms*var(--kf-speed,1))_var(--ease-spring),right_calc(360ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(360ms*var(--kf-speed,1))_var(--ease-spring),left_calc(360ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house),scale_calc(200ms*var(--kf-speed,1))_var(--ease-house)]",
          "data-kf-idle:before:scale-[0.92] data-kf-idle:before:opacity-0 not-has-[[data-kf-toolbar-hl]]:before:opacity-0",
          "motion-reduce:before:[transition:none]!",
        ),
        className,
      )}
      onPointerOver={(event) => {
        onPointerOver?.(event)
        hovering.current = true
        const item = itemFrom(event.currentTarget, event.target)
        if (item) mark(event.currentTarget, item)
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        hovering.current = false
        const root = event.currentTarget
        mark(root, itemFrom(root, root.querySelector(":focus-visible")))
      }}
      onFocus={(event) => {
        onFocus?.(event)
        const target = event.target as Element
        if (target.matches(":focus-visible")) mark(event.currentTarget, itemFrom(event.currentTarget, target))
      }}
      onBlur={(event) => {
        onBlur?.(event)
        const root = event.currentTarget
        if (!hovering.current && !root.contains(event.relatedTarget as Node | null)) mark(root, null)
      }}
      onClick={(event) => {
        onClick?.(event)
        const item = itemFrom(event.currentTarget, event.target)
        if (item) mark(event.currentTarget, item)
      }}
      {...props}
    />
  )
}

function ToolbarButton({ className, ...props }: React.ComponentProps<typeof ToolbarButtonPart>) {
  return <ToolbarButtonPart className={withClass(press, className)} {...props} />
}

function ToolbarLink({ className, ...props }: React.ComponentProps<typeof ToolbarLinkPart>) {
  return <ToolbarLinkPart className={withClass(press, className)} {...props} />
}

/* A toggle joins the toolbar's arrow keys on its own. Pressed, its surface pops in. */
function ToolbarToggle({ className, ...props }: React.ComponentProps<typeof TogglePart>) {
  return <TogglePart className={withClass(press, className)} {...props} />
}

function ToolbarToggleGroup<T extends string = string>({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPart<T>>) {
  return <ToggleGroupPart className={className} {...props} />
}

export { Toolbar, ToolbarButton, ToolbarLink, ToolbarToggle, ToolbarToggleGroup }
