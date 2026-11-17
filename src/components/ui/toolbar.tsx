"use client"

export * from "@/components/primitives/toolbar"

/* Styled toolbar: the animated primitive plus the Keyframery look. */

/* Theming: inherit these optional variables; unset values retain the original light/dark tokens.
   --toolbar-face: Toolbar sheet (default: --popover).
   --toolbar-ink: Item text (default: --muted-foreground; --foreground active; --popover-foreground on sheet).
   --toolbar-accent: Gliding highlight (default: --accent; 70% in dark).
   --toolbar-key: Pressed toggle and input surface (default: --background; --accent for pressed toggle in dark).
   --toolbar-radius: Toolbar corners (default: 12px).
   --toolbar-item-radius: Item and highlight corners (default: 8px).
   --toolbar-height: Item height and minimum width (default: 1.75rem).
   --toolbar-gap: Space between items (default: 0.125rem).
 */

import * as React from "react"

import {
  Toolbar as ToolbarRoot,
  ToolbarButton as ToolbarButtonPart,
  ToolbarGroup as ToolbarGroupPart,
  ToolbarInput as ToolbarInputPart,
  ToolbarLink as ToolbarLinkPart,
  ToolbarSeparator as ToolbarSeparatorPart,
  ToolbarToggle as TogglePart,
  ToolbarToggleGroup as ToggleGroupPart,
} from "@/components/primitives/toolbar"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* One box for everything you can press in the bar: buttons, links and toggles. */
const item = cn(
  "relative inline-flex h-[var(--toolbar-height,1.75rem)] min-w-[var(--toolbar-height,1.75rem)] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--toolbar-item-radius,8px)] px-1.5",
  "text-[13px] leading-none font-medium whitespace-nowrap text-[color:var(--toolbar-ink,var(--muted-foreground))] outline-none select-none",
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  "not-data-disabled:hover:text-[color:var(--toolbar-ink,var(--foreground))] data-kf-toolbar-hl:not-data-disabled:text-[color:var(--toolbar-ink,var(--foreground))]",
  "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
  "data-disabled:cursor-not-allowed data-disabled:opacity-40",
)

const row =
  "flex items-center gap-[var(--toolbar-gap,0.125rem)] data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch"

function Toolbar({
  speed,
  className,
  ...props
}: React.ComponentProps<typeof ToolbarRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <ToolbarRoot
        className={withClass(
          cn(
            row,
            "w-fit rounded-[var(--toolbar-radius,12px)] bg-[var(--toolbar-face,var(--popover))] p-1 text-[color:var(--toolbar-ink,var(--popover-foreground))]",
            /* The gliding highlight. */
            "before:rounded-[var(--toolbar-item-radius,8px)] before:bg-[var(--toolbar-accent,var(--accent))] dark:before:bg-[color-mix(in_oklab,var(--toolbar-accent,var(--accent))_70%,transparent)]",
            "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
            "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

function ToolbarButton({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarButtonPart>) {
  return (
    <ToolbarButtonPart
      className={withClass(item, className)}
      {...props}
    />
  )
}

function ToolbarLink({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarLinkPart>) {
  return (
    <ToolbarLinkPart
      className={withClass(
        cn(
          item, "px-2",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* A toggle joins the bar's arrow keys on its own. Pressed, it becomes a key. */
function ToolbarToggle({
  className,
  ...props
}: React.ComponentProps<typeof TogglePart>) {
  return (
    <TogglePart
      className={withClass(
        cn(
          item,
          "data-pressed:bg-[var(--toolbar-key,var(--background))] data-pressed:text-[color:var(--toolbar-ink,var(--foreground))]",
          "data-pressed:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
          "dark:data-pressed:bg-[var(--toolbar-key,var(--accent))] dark:data-pressed:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ToolbarToggleGroup<T extends string = string>({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPart<T>>) {
  return <ToggleGroupPart className={withClass(row, className)} {...props} />
}

function ToolbarGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarGroupPart>) {
  return <ToolbarGroupPart className={withClass(row, className)} {...props} />
}

function ToolbarInput({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarInputPart>) {
  return (
    <ToolbarInputPart
      className={withClass(
        cn(
          "h-[var(--toolbar-height,1.75rem)] min-w-0 rounded-[var(--toolbar-item-radius,8px)] bg-[var(--toolbar-key,var(--background))] px-2 text-[13px] text-[color:var(--toolbar-ink,var(--foreground))] outline-none placeholder:text-[color:var(--toolbar-ink,var(--muted-foreground))]",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]",
          "transition-shadow duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none!",
          "not-data-disabled:hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)] dark:not-data-disabled:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.18)]",
          "focus-visible:shadow-[0_0_0_1px_var(--ring)] focus-visible:ring-[3px] focus-visible:ring-ring/25",
          "dark:focus-visible:shadow-[0_0_0_1px_var(--ring)]",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The line runs across the bar, so it stands upright in a horizontal one. */
function ToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarSeparatorPart>) {
  return (
    <ToolbarSeparatorPart
      className={withClass(
        cn(
          "shrink-0 bg-border",
          "data-[orientation=vertical]:mx-1 data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-px",
          "data-[orientation=horizontal]:my-1 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-4 data-[orientation=horizontal]:self-center",
        ),
        className,
      )}
      {...props}
    />
  )
}

export {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggle,
  ToolbarToggleGroup,
}

/* UI SDK's helpers for this component, passed through. */
export { createToolbarController } from "@/components/primitives/toolbar"
