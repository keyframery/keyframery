"use client"

export * from "@/components/primitives/listbox"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --listbox-surface: List frame (default: --background)
   --listbox-ink: Option text and check (default: --foreground)
   --listbox-highlight: Gliding highlight (default: --accent)
   --listbox-selected: Multiple-selection box (default: --primary)
   --listbox-radius: Frame corners (default: 12px)
   --listbox-item-radius: Option corners (default: 8px)
   --listbox-row-height: Minimum option height (default: 2rem)
*/

/* Styled listbox: the animated primitive plus the Keyframery look. */

import {
  createListboxController,
  type ListData,
  Listbox as ListboxRoot,
  ListboxGroup as ListboxGroupPart,
  ListboxGroupLabel as ListboxGroupLabelPart,
  ListboxItem as ListboxItemPart,
  ListboxItemIcon as ListboxItemIconPart,
  ListboxItemIndicator as ListboxItemIndicatorPart,
  type ListboxProps,
  ListboxSeparator as ListboxSeparatorPart,
} from "@/components/primitives/listbox"
import * as React from "react"

import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  )
}

/* The frame is a field that holds rows. It takes the field's focus ring while a row inside
   has keyboard focus. */
function Listbox<T = string, Multiple extends boolean | undefined = false>({
  speed,
  className,
  ...props
}: ListboxProps<T, Multiple> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <ListboxRoot<T, Multiple>
        {...({
          ...props,
          /* With no children, the root's `items` render as styled rows. */
          children:
            props.children ??
            (props.items ? (state: { items?: ListData<unknown> }) => <ListboxItems items={state.items} /> : undefined),
          className: withClass(
            cn(
              "group/listbox flex max-h-72 flex-col gap-px overflow-y-auto overscroll-contain rounded-[var(--listbox-radius,12px)] bg-[var(--listbox-surface,var(--background))] p-1.5 text-[13px] outline-none scroll-py-1.5",
              "data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:overflow-x-auto data-[orientation=horizontal]:overflow-y-hidden",
              "shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]",
              "transition-shadow duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none!",
              "before:rounded-[var(--listbox-item-radius,8px)] before:bg-[var(--listbox-highlight,var(--accent))]",
              "hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.16)]",
              "has-focus-visible:shadow-[0_0_0_1px_var(--ring)] has-focus-visible:ring-[3px] has-focus-visible:ring-ring/25 dark:has-focus-visible:shadow-[0_0_0_1px_var(--ring)]",
              "focus-visible:shadow-[0_0_0_1px_var(--ring)] focus-visible:ring-[3px] focus-visible:ring-ring/25 dark:focus-visible:shadow-[0_0_0_1px_var(--ring)]",
              "aria-invalid:shadow-[0_0_0_1px_var(--destructive)] dark:aria-invalid:shadow-[0_0_0_1px_var(--destructive)]",
              "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-readonly:bg-muted/40",
            ),
            className,
          ),
        } as ListboxProps<T, Multiple>)}
      />
    </Speed>
  )
}

/* A row. No background of its own: the primitive's highlight glides under it. */
function ListboxItem<T = string>({
  className,
  ...props
}: React.ComponentProps<typeof ListboxItemPart<T>>) {
  return (
    <ListboxItemPart<T>
      className={withClass(
        cn(
          "group/item relative flex min-h-[var(--listbox-row-height,2rem)] shrink-0 cursor-default items-center gap-2 rounded-[var(--listbox-item-radius,8px)] px-2 py-1.5 leading-4 text-[color:var(--listbox-ink,var(--foreground))] outline-none select-none",
          "data-disabled:cursor-not-allowed data-disabled:text-muted-foreground/60",
          "group-data-readonly/listbox:cursor-default",
          "[[data-has-icons]_&:not([data-has-icon])]:ps-8",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The selection mark. A single list shows a check; a multiple list a small box that fills.
   The primitive draws the check and pops the mark in. */
function ListboxItemIndicator({
  className,
  children,
  keepMounted = true,
  ...props
}: React.ComponentProps<typeof ListboxItemIndicatorPart>) {
  return (
    <ListboxItemIndicatorPart
      keepMounted={keepMounted}
      className={withClass(
        cn(
          "ms-auto grid size-4 shrink-0 place-items-center text-[color:var(--listbox-ink,var(--foreground))] [&_svg]:size-4",
          /* Multiple: a small box, empty until chosen. */
          "group-aria-multiselectable/listbox:rounded-[5px] group-aria-multiselectable/listbox:text-primary-foreground group-aria-multiselectable/listbox:[&_svg]:size-3",
          "group-aria-multiselectable/listbox:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.18)] dark:group-aria-multiselectable/listbox:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2)]",
          "group-aria-multiselectable/listbox:transition-[background-color,box-shadow] group-aria-multiselectable/listbox:duration-[calc(150ms*var(--kf-speed,1))]",
          "group-aria-multiselectable/listbox:data-selected:bg-[var(--listbox-selected,var(--primary))] group-aria-multiselectable/listbox:data-selected:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.2)]",
          "dark:group-aria-multiselectable/listbox:data-selected:shadow-[inset_0_1px_0_rgb(255_255_255/0.6)]",
          "group-aria-multiselectable/listbox:[&_svg]:[stroke-width:2] group-data-disabled/item:opacity-50",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    >
      {children ?? <CheckIcon />}
    </ListboxItemIndicatorPart>
  )
}

function ListboxItemIcon({
  className,
  ...props
}: React.ComponentProps<typeof ListboxItemIconPart>) {
  return (
    <ListboxItemIconPart
      className={withClass(
        cn(
          "grid size-4 shrink-0 place-items-center text-muted-foreground transition-colors duration-[calc(150ms*var(--kf-speed,1))] [&_svg]:size-4",
          "group-data-highlighted/item:text-current group-data-highlighted/item:duration-0 group-data-selected/item:text-[color:var(--listbox-ink,var(--foreground))]",
          "rtl:data-mirror:-scale-x-100 motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ListboxGroup({
  className,
  ...props
}: React.ComponentProps<typeof ListboxGroupPart>) {
  return <ListboxGroupPart className={withClass("flex flex-col gap-px", className)} {...props} />
}

function ListboxGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof ListboxGroupLabelPart>) {
  return (
    <ListboxGroupLabelPart
      className={withClass(
        cn(
          "px-2 pt-1.5 pb-1 text-[11px] leading-4 font-medium text-muted-foreground select-none",
          "[[data-has-icons]_&]:ps-8",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ListboxSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ListboxSeparatorPart>) {
  return (
    <ListboxSeparatorPart
      className={withClass(
        cn(
          "-mx-1.5 my-1 h-px shrink-0 bg-border",
          "group-data-[orientation=horizontal]/listbox:mx-1 group-data-[orientation=horizontal]/listbox:my-0 group-data-[orientation=horizontal]/listbox:h-auto group-data-[orientation=horizontal]/listbox:w-px",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Renders items passed as data with the styled parts above. */
function ListboxItems({ items }: { items?: ListData<unknown> }) {
  return (items ?? []).map((entry, index) => {
    if (typeof entry === "string") {
      return (
        <ListboxItem key={entry} value={entry}>
          {entry}
          <ListboxItemIndicator />
        </ListboxItem>
      )
    }
    if ("type" in entry && entry.type === "separator") {
      return <ListboxSeparator key={`separator-${index}`} />
    }
    if ("type" in entry && entry.type === "group") {
      return (
        <ListboxGroup key={`group-${entry.label ?? index}`}>
          {entry.label && <ListboxGroupLabel>{entry.label}</ListboxGroupLabel>}
          <ListboxItems items={entry.items} />
        </ListboxGroup>
      )
    }
    const { value, label, disabled } = entry
    return (
      <ListboxItem<unknown>
        key={typeof value === "string" ? value : index}
        value={value}
        label={label}
        disabled={disabled}
      >
        {label}
        <ListboxItemIndicator />
      </ListboxItem>
    )
  })
}

export type { ListData } from "@/components/primitives/listbox"
export {
  createListboxController,
  Listbox,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxItemIcon,
  ListboxItemIndicator,
  ListboxItems,
  ListboxSeparator,
}
