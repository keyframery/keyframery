"use client"

export * from "@/components/primitives/combobox"

/* Theming: set on a part or its ancestor; unset variables preserve the original theme.
   --combobox-face: Input, chips and popup surfaces (default: --background / --accent (dark chips) / --popover).
   --combobox-ink: Label, input, checks and popup text (default: --foreground / --popover-foreground).
   --combobox-accent: Highlighted option surface (default: --accent).
   --combobox-radius: Popup corners (default: 14px).
   --combobox-height: Input and chips minimum height (default: 2.25rem).
 */

/* Styled combobox: the animated primitive plus the Keyframery look. */

import {
  Combobox as ComboboxRoot,
  ComboboxArrow as ComboboxArrowPart,
  ComboboxChip as ComboboxChipPart,
  ComboboxChipRemove as ComboboxChipRemovePart,
  ComboboxChips as ComboboxChipsPart,
  ComboboxChipsOverflow as ComboboxChipsOverflowPart,
  ComboboxClear as ComboboxClearPart,
  ComboboxContent as ComboboxContentPart,
  ComboboxCreate as ComboboxCreatePart,
  ComboboxEmpty as ComboboxEmptyPart,
  ComboboxGroup as ComboboxGroupPart,
  ComboboxGroupLabel as ComboboxGroupLabelPart,
  ComboboxInput as ComboboxInputPart,
  ComboboxItem as ComboboxItemPart,
  ComboboxItemIcon as ComboboxItemIconPart,
  ComboboxItemIndicator as ComboboxItemIndicatorPart,
  ComboboxItemText as ComboboxItemTextPart,
  ComboboxLabel as ComboboxLabelPart,
  type ComboboxProps,
  ComboboxList as ComboboxListPart,
  ComboboxSelectAll as ComboboxSelectAllPart,
  ComboboxSeparator as ComboboxSeparatorPart,
  ComboboxStatus as ComboboxStatusPart,
  ComboboxTrigger as ComboboxTriggerPart,
  ComboboxValue as ComboboxValuePart,
  ComboboxValueIcon as ComboboxValueIconPart,
  createComboboxController,
  type ListData,
} from "@/components/primitives/combobox"
import * as React from "react"

import { Speed, type SpeedProps, useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* A row in the list. Shared by items, the select-all row and the create row. */
const row =
  "group/item relative flex min-h-8 cursor-default items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[13px] leading-[1.3] outline-none select-none data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-40"

const key =
  "bg-[var(--combobox-face,var(--background))] shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] dark:bg-[var(--combobox-face,var(--accent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]"

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 6 4 4 4-4" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4.5 4.5 7 7m0-7-7 7" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3.5 8.5 3 3 6-7" pathLength={1} />
    </svg>
  )
}

function Combobox<T = string, Multiple extends boolean | undefined = false>(
  { speed, ...props }: ComboboxProps<T, Multiple> & SpeedProps,
) {
  return (
    <Speed speed={speed}>
      <ComboboxRoot<T, Multiple> {...(props as ComboboxProps<T, Multiple>)} />
    </Speed>
  )
}

function ComboboxLabel({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxLabelPart>) {
  return (
    <ComboboxLabelPart
      className={withClass("text-[13px] leading-none font-medium text-[color:var(--combobox-ink,var(--foreground))] data-disabled:opacity-50", className)}
      {...props}
    />
  )
}

/* The row that holds the input (or the chips) with the clear button and the trigger laid over
   its right edge. A leading svg sits over its left edge. */
function ComboboxControl({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="combobox-control"
      className={cn(
        "group/control relative flex w-full items-center",
        "[&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-2.5 [&>svg]:left-3 [&>svg]:size-4 [&>svg]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

function ComboboxInput({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxInputPart>) {
  return (
    <ComboboxInputPart
      className={withClass(
        cn(
          "h-[var(--combobox-height,2.25rem)] w-full min-w-0 rounded-[10px] bg-[var(--combobox-face,var(--background))] px-3 text-[13px] text-[color:var(--combobox-ink,var(--foreground))] outline-none placeholder:text-muted-foreground",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]",
          "transition-shadow duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none!",
          "hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.16)]",
          "focus-visible:shadow-[0_0_0_1px_var(--ring)] focus-visible:ring-[3px] focus-visible:ring-ring/25 dark:focus-visible:shadow-[0_0_0_1px_var(--ring)]",
          "aria-invalid:shadow-[0_0_0_1px_var(--destructive)] aria-invalid:focus-visible:ring-destructive/25 dark:aria-invalid:shadow-[0_0_0_1px_var(--destructive)]",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          /* Room for what the control lays over it. */
          "group-has-[>svg]/control:pl-9",
          "group-has-[[data-slot=combobox-trigger]]/control:pr-9 group-has-[[data-slot=combobox-clear]]/control:pr-9",
          "group-has-[[data-slot=combobox-trigger]]/control:group-has-[[data-slot=combobox-clear]]/control:pr-16",
          /* Inside chips, the chips are the field and the input is bare text. */
          "in-data-[slot=combobox-chips]:h-7 in-data-[slot=combobox-chips]:w-auto in-data-[slot=combobox-chips]:min-w-20 in-data-[slot=combobox-chips]:flex-1 in-data-[slot=combobox-chips]:rounded-none in-data-[slot=combobox-chips]:bg-transparent in-data-[slot=combobox-chips]:px-1.5 in-data-[slot=combobox-chips]:shadow-none! in-data-[slot=combobox-chips]:ring-0! in-data-[slot=combobox-chips]:pr-1.5!",
        ),
        className,
      )}
      {...props}
    />
  )
}

const controlButton =
  "absolute top-1 grid size-7 cursor-pointer place-items-center rounded-[7px] text-muted-foreground outline-none hover:bg-foreground/[0.06] hover:text-[color:var(--combobox-ink,var(--foreground))] focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-40 [&_svg]:size-4"

function ComboboxTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxTriggerPart>) {
  return (
    <ComboboxTriggerPart
      className={withClass(
        cn(
          controlButton,
          "right-1",
        ),
        className,
      )}
      {...props}
    >
      {children ?? <ChevronIcon />}
    </ComboboxTriggerPart>
  )
}

function ComboboxClear({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxClearPart>) {
  return (
    <ComboboxClearPart
      className={withClass(
        cn(
          controlButton,
          "right-1 group-has-[[data-slot=combobox-trigger]]/control:right-8 [&_svg]:size-3.5",
        ),
        className,
      )}
      {...props}
    >
      {children ?? <XIcon />}
    </ComboboxClearPart>
  )
}

function ComboboxContent({
  className,
  children,
  sideOffset = 6,
  style,
  ...props
}: React.ComponentProps<typeof ComboboxContentPart>) {
  return (
    <ComboboxContentPart
      sideOffset={sideOffset}
      className={withClass(
        cn(
          "group/content flex w-(--anchor-width) min-w-[200px] flex-col rounded-[var(--combobox-radius,14px)] bg-[var(--combobox-face,var(--popover))] text-[color:var(--combobox-ink,var(--popover-foreground))] outline-none",
          "[--list-height:var(--available-height)]",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
          "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
        ),
        className,
      )}
      {...props} style={useSpeedStyle(style)}
    >
      {children ?? <ComboboxList />}
    </ComboboxContentPart>
  )
}

function ComboboxArrow({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxArrowPart>) {
  return (
    <ComboboxArrowPart
      className={withClass("size-2.5 rotate-45 rounded-[2px] bg-[var(--combobox-face,var(--popover))]", className)}
      {...props}
    />
  )
}

function ComboboxList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxListPart>) {
  return (
    <ComboboxListPart
      className={withClass(
        cn(
          "max-h-[min(calc(var(--list-height,100vh)-8px),18rem)] scroll-py-1.5 overflow-y-auto overscroll-contain rounded-[var(--combobox-radius,14px)] p-1.5 outline-none",
          "group-has-[[data-slot=combobox-empty][data-empty]]/content:hidden",
          /* The gliding highlight, in the row's shape and colour. */
          "before:rounded-[8px] before:bg-[var(--combobox-accent,var(--accent))]",
        ),
        className,
      )}
      {...props}
    >
      {children ?? ((state) => <ComboboxItems items={state.items} />)}
    </ComboboxListPart>
  )
}

function ComboboxItem<T = string>({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxItemPart<T>>) {
  return <ComboboxItemPart<T> className={withClass(row, className)} {...props} />
}

/* The matched part of the label reads stronger, the rest steps back. */
function ComboboxItemText({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxItemTextPart>) {
  return (
    <ComboboxItemTextPart
      className={withClass("min-w-0 flex-1 truncate data-matched:text-muted-foreground [&_mark]:bg-transparent [&_mark]:font-medium [&_mark]:text-[color:var(--combobox-ink,var(--foreground))]", className)}
      {...props}
    />
  )
}

/* The check. It stays mounted, so it draws itself when its item is selected and when the
   list opens on a selected item. */
function ComboboxItemIndicator({
  className,
  children,
  keepMounted = true,
  ...props
}: React.ComponentProps<typeof ComboboxItemIndicatorPart>) {
  return (
    <ComboboxItemIndicatorPart
      keepMounted={keepMounted}
      className={withClass(
        cn(
          "ml-auto grid size-4 shrink-0 place-items-center text-[color:var(--combobox-ink,var(--foreground))] [&_svg]:size-4",
          "[&_path]:transition-[stroke-dashoffset] [&_path]:delay-[calc(100ms*var(--kf-speed,1)*var(--kf-flourish,1))] [&_path]:duration-[calc(260ms*var(--kf-speed,1)*var(--kf-flourish,1))] [&_path]:ease-house [&_path]:[stroke-dasharray:1_2] [&_path]:[stroke-dashoffset:1.2]",
          "data-selected:[&_path]:[stroke-dashoffset:0] group-data-starting-style/content:[&_path]:[stroke-dashoffset:1.2]!",
          "motion-reduce:[&_path]:transition-none",
        ),
        className,
      )}
      {...props}
    >
      {children ?? <CheckIcon />}
    </ComboboxItemIndicatorPart>
  )
}

function ComboboxItemIcon({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxItemIconPart>) {
  return (
    <ComboboxItemIconPart
      className={withClass("grid size-4 shrink-0 place-items-center text-muted-foreground group-data-highlighted/item:text-[color:var(--combobox-ink,var(--foreground))] data-mirror:rtl:-scale-x-100 [&_svg]:size-4", className)}
      {...props}
    />
  )
}

function ComboboxValueIcon({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxValueIconPart>) {
  return (
    <ComboboxValueIconPart
      className={withClass("pointer-events-none absolute top-2.5 left-3 grid size-4 place-items-center text-muted-foreground [&_svg]:size-4", className)}
      {...props}
    />
  )
}

function ComboboxGroup({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxGroupPart>) {
  return <ComboboxGroupPart className={withClass("flex flex-col", className)} {...props} />
}

function ComboboxGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxGroupLabelPart>) {
  return (
    <ComboboxGroupLabelPart
      className={withClass("px-2.5 pt-2 pb-1.5 text-[11px] leading-none font-medium text-muted-foreground select-none", className)}
      {...props}
    />
  )
}

function ComboboxSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxSeparatorPart>) {
  return (
    <ComboboxSeparatorPart
      className={withClass("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  )
}

function ComboboxEmpty({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxEmptyPart>) {
  return (
    <ComboboxEmptyPart
      className={withClass("hidden px-3 py-6 text-center text-[13px] text-muted-foreground data-empty:block data-loading:block", className)}
      {...props}
    />
  )
}

function ComboboxStatus({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxStatusPart>) {
  return (
    <ComboboxStatusPart
      className={withClass("px-4 pt-3 pb-1 text-[12px] text-muted-foreground empty:hidden", className)}
      {...props}
    />
  )
}

function ComboboxCreate({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxCreatePart>) {
  return (
    <ComboboxCreatePart
      className={withClass(
        cn(
          row, "font-medium data-pending:opacity-60",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ComboboxSelectAll({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxSelectAllPart>) {
  return (
    <ComboboxSelectAllPart
      className={withClass(
        cn(
          row, "font-medium data-unchecked:font-normal",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Renders no element of its own: its children function receives the selected values. */
function ComboboxValue(props: React.ComponentProps<typeof ComboboxValuePart>) {
  return <ComboboxValuePart {...props} />
}

/* With `multiple`, the chips and the input share one field. */
function ComboboxChips({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxChipsPart>) {
  return (
    <ComboboxChipsPart
      className={withClass(
        cn(
          "flex min-h-[var(--combobox-height,2.25rem)] w-full min-w-0 flex-wrap items-center gap-1 rounded-[10px] bg-[var(--combobox-face,var(--background))] p-1 text-[13px]",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]",
          "transition-shadow duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none!",
          "hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.16)]",
          "has-[input:focus-visible]:shadow-[0_0_0_1px_var(--ring)] has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/25 dark:has-[input:focus-visible]:shadow-[0_0_0_1px_var(--ring)]",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          "group-has-[[data-slot=combobox-trigger]]/control:pr-9",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* A chip is a small key. It scales in when its value is added. */
function ComboboxChip<T = string>({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxChipPart<T>>) {
  return (
    <ComboboxChipPart<T>
      className={withClass(
        cn(
          "inline-flex h-7 max-w-full items-center gap-1 rounded-[7px] pr-1 pl-2 text-[12px] leading-none font-medium whitespace-nowrap outline-none",
          key,
          "focus-visible:ring-2 focus-visible:ring-ring",
          "data-disabled:opacity-60",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ComboboxChipRemove({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxChipRemovePart>) {
  return (
    <ComboboxChipRemovePart
      className={withClass("grid size-[18px] cursor-pointer place-items-center rounded-[5px] text-muted-foreground outline-none hover:bg-foreground/[0.08] hover:text-[color:var(--combobox-ink,var(--foreground))] focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-40 [&_svg]:size-3", className)}
      {...props}
    >
      {children ?? <XIcon />}
    </ComboboxChipRemovePart>
  )
}

function ComboboxChipsOverflow({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxChipsOverflowPart>) {
  return (
    <ComboboxChipsOverflowPart
      className={withClass("px-1.5 text-[12px] leading-none whitespace-nowrap text-muted-foreground tabular-nums", className)}
      {...props}
    />
  )
}

/* Renders items passed as data with the styled parts above. */
function ComboboxItems({ items }: { items?: ListData<unknown> }) {
  return (items ?? []).map((entry, index) => {
    if (typeof entry === "string") {
      return (
        <ComboboxItem key={entry} value={entry}>
          <ComboboxItemText>{entry}</ComboboxItemText>
          <ComboboxItemIndicator />
        </ComboboxItem>
      )
    }
    if ("type" in entry && entry.type === "separator") {
      return <ComboboxSeparator key={`separator-${index}`} />
    }
    if ("type" in entry && entry.type === "group") {
      return (
        <ComboboxGroup key={`group-${entry.label ?? index}`}>
          {entry.label && <ComboboxGroupLabel>{entry.label}</ComboboxGroupLabel>}
          <ComboboxItems items={entry.items} />
        </ComboboxGroup>
      )
    }
    const { value, label, disabled, keywords } = entry
    return (
      <ComboboxItem<unknown>
        key={typeof value === "string" ? value : index}
        value={value}
        label={label}
        disabled={disabled}
        keywords={keywords}
      >
        <ComboboxItemText>{label}</ComboboxItemText>
        <ComboboxItemIndicator />
      </ComboboxItem>
    )
  })
}

export {
  Combobox,
  ComboboxArrow,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxChipsOverflow,
  ComboboxClear,
  ComboboxContent,
  ComboboxControl,
  ComboboxCreate,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIcon,
  ComboboxItemIndicator,
  ComboboxItems,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxList,
  ComboboxSelectAll,
  ComboboxSeparator,
  ComboboxStatus,
  ComboboxTrigger,
  ComboboxValue,
  ComboboxValueIcon,
  createComboboxController,
}
