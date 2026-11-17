"use client"

export * from "@/components/primitives/autocomplete"

/* Theming: set on a part or its ancestor; unset variables preserve the original theme.
   --autocomplete-face: Input and popup surfaces (default: --background / --popover).
   --autocomplete-ink: Input, label, matched and popup text (default: --foreground / --popover-foreground).
   --autocomplete-accent: Highlighted suggestion surface (default: --accent).
   --autocomplete-radius: Popup corners (default: 14px).
   --autocomplete-height: Input height (default: 2.25rem).
 */

/* Styled autocomplete: the animated primitive plus the Keyframery look. */

import {
  Autocomplete as AutocompleteRoot,
  AutocompleteArrow as AutocompleteArrowPart,
  AutocompleteClear as AutocompleteClearPart,
  AutocompleteContent as AutocompleteContentPart,
  AutocompleteEmpty as AutocompleteEmptyPart,
  AutocompleteGroup as AutocompleteGroupPart,
  AutocompleteGroupLabel as AutocompleteGroupLabelPart,
  AutocompleteInput as AutocompleteInputPart,
  AutocompleteItem as AutocompleteItemPart,
  AutocompleteItemIcon as AutocompleteItemIconPart,
  AutocompleteItemText as AutocompleteItemTextPart,
  AutocompleteLabel as AutocompleteLabelPart,
  AutocompleteList as AutocompleteListPart,
  AutocompleteSeparator as AutocompleteSeparatorPart,
  AutocompleteStatus as AutocompleteStatusPart,
  AutocompleteTrigger as AutocompleteTriggerPart,
  createAutocompleteController,
  type ListData,
} from "@/components/primitives/autocomplete"
import * as React from "react"

import { Speed, type SpeedProps, useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

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

/* Renders no element of its own. */
function Autocomplete({ speed, ...props }: React.ComponentProps<typeof AutocompleteRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <AutocompleteRoot {...props} />
    </Speed>
  )
}

function AutocompleteLabel({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteLabelPart>) {
  return (
    <AutocompleteLabelPart
      className={withClass("text-[13px] leading-none font-medium text-[color:var(--autocomplete-ink,var(--foreground))] data-disabled:opacity-50", className)}
      {...props}
    />
  )
}

/* The row that holds the input, with the clear button and the trigger laid over its right
   edge. A leading svg sits over its left edge. */
function AutocompleteControl({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="autocomplete-control"
      className={cn(
        "group/control relative flex w-full items-center",
        "[&>svg]:pointer-events-none [&>svg]:absolute [&>svg]:top-2.5 [&>svg]:left-3 [&>svg]:size-4 [&>svg]:text-muted-foreground",
        "[&>svg]:transition-colors [&>svg]:duration-[calc(150ms*var(--kf-speed,1))] has-[input:focus-visible]:[&>svg]:text-[color:var(--autocomplete-ink,var(--foreground))] motion-reduce:[&>svg]:transition-none",
        className,
      )}
      {...props}
    />
  )
}

function AutocompleteInput({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteInputPart>) {
  return (
    <AutocompleteInputPart
      className={withClass(
        cn(
          "h-[var(--autocomplete-height,2.25rem)] w-full min-w-0 rounded-[10px] bg-[var(--autocomplete-face,var(--background))] px-3 text-[13px] text-[color:var(--autocomplete-ink,var(--foreground))] outline-none placeholder:text-muted-foreground",
          "[&::-webkit-search-cancel-button]:appearance-none",
          "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)]",
          "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)]",
          "transition-[box-shadow] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
          "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)]",
          "focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:[--field-line:var(--ring)] dark:focus-visible:[--field-line:var(--ring)]",
          "aria-invalid:ring-destructive/25 aria-invalid:[--field-line:var(--destructive)] dark:aria-invalid:[--field-line:var(--destructive)]",
          "data-readonly:bg-muted/50",
          "data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:text-muted-foreground",
          /* Room for what the control lays over it. */
          "group-has-[>svg]/control:pl-9",
          "group-has-[[data-slot=autocomplete-trigger]]/control:pr-9 group-has-[[data-slot=autocomplete-clear]]/control:pr-9",
          "group-has-[[data-slot=autocomplete-trigger]]/control:group-has-[[data-slot=autocomplete-clear]]/control:pr-16",
        ),
        className,
      )}
      {...props}
    />
  )
}

const controlButton =
  "absolute top-1 grid size-7 cursor-pointer place-items-center rounded-[7px] text-muted-foreground outline-none hover:bg-foreground/[0.06] hover:text-[color:var(--autocomplete-ink,var(--foreground))] focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-40 [&_svg]:size-4"

function AutocompleteTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AutocompleteTriggerPart>) {
  return (
    <AutocompleteTriggerPart
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
    </AutocompleteTriggerPart>
  )
}

/* Only in the page while there is text, so it enters from its starting style. */
function AutocompleteClear({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AutocompleteClearPart>) {
  return (
    <AutocompleteClearPart
      className={withClass(
        cn(
          controlButton,
          "right-1 group-has-[[data-slot=autocomplete-trigger]]/control:right-8 [&_svg]:size-3.5",
        ),
        className,
      )}
      {...props}
    >
      {children ?? <XIcon />}
    </AutocompleteClearPart>
  )
}

function AutocompleteContent({
  className,
  children,
  sideOffset = 6,
  style,
  ...props
}: React.ComponentProps<typeof AutocompleteContentPart>) {
  return (
    <AutocompleteContentPart
      sideOffset={sideOffset}
      className={withClass(
        cn(
          "group/content flex w-(--anchor-width) min-w-[200px] flex-col rounded-[var(--autocomplete-radius,14px)] bg-[var(--autocomplete-face,var(--popover))] text-[color:var(--autocomplete-ink,var(--popover-foreground))] outline-none",
          "[--list-height:var(--available-height)]",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
          "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
        ),
        className,
      )}
      {...props} style={useSpeedStyle(style)}
    >
      {children ?? <AutocompleteList />}
    </AutocompleteContentPart>
  )
}

function AutocompleteArrow({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteArrowPart>) {
  return (
    <AutocompleteArrowPart
      className={withClass("size-2.5 rotate-45 rounded-[2px] bg-[var(--autocomplete-face,var(--popover))]", className)}
      {...props}
    />
  )
}

function AutocompleteList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AutocompleteListPart>) {
  return (
    <AutocompleteListPart
      className={withClass(
        cn(
          "max-h-[min(calc(var(--list-height,100vh)-8px),18rem)] scroll-py-1.5 overflow-y-auto overscroll-contain rounded-[var(--autocomplete-radius,14px)] p-1.5 outline-none",
          "group-has-[[data-slot=autocomplete-empty][data-empty]]/content:hidden",
          /* The gliding highlight, in the row's shape and colour. */
          "before:rounded-[8px] before:bg-[var(--autocomplete-accent,var(--accent))]",
        ),
        className,
      )}
      {...props}
    >
      {children ?? ((state) => <AutocompleteItems items={state.items as ListData<string>} />)}
    </AutocompleteListPart>
  )
}

function AutocompleteItem({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteItemPart>) {
  return (
    <AutocompleteItemPart
      className={withClass(
        cn(
          "group/item relative flex min-h-8 cursor-default items-center gap-2.5 rounded-[8px] px-2.5 py-1.5 text-[13px] leading-[1.3] outline-none select-none",
          "data-highlighted:text-accent-foreground",
          "data-disabled:pointer-events-none data-disabled:opacity-40",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The matched part of the suggestion reads stronger; the rest steps back slightly. */
function AutocompleteItemText({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteItemTextPart>) {
  return (
    <AutocompleteItemTextPart
      className={withClass(
        cn(
          "min-w-0 flex-1 truncate",
          "data-matched:text-[color:color-mix(in_oklab,var(--autocomplete-ink,var(--foreground))_70%,transparent)] [&_mark]:bg-transparent [&_mark]:font-semibold [&_mark]:text-[color:var(--autocomplete-ink,var(--foreground))]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function AutocompleteItemIcon({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteItemIconPart>) {
  return (
    <AutocompleteItemIconPart
      className={withClass("grid size-4 shrink-0 place-items-center text-muted-foreground transition-colors duration-[calc(100ms*var(--kf-speed,1))] group-data-highlighted/item:text-[color:var(--autocomplete-ink,var(--foreground))] data-mirror:rtl:-scale-x-100 motion-reduce:transition-none! [&_svg]:size-4", className)}
      {...props}
    />
  )
}

function AutocompleteGroup({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteGroupPart>) {
  return <AutocompleteGroupPart className={withClass("flex flex-col", className)} {...props} />
}

function AutocompleteGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteGroupLabelPart>) {
  return (
    <AutocompleteGroupLabelPart
      className={withClass("px-2.5 pt-2 pb-1.5 text-[11px] leading-none font-medium text-muted-foreground select-none", className)}
      {...props}
    />
  )
}

function AutocompleteSeparator({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteSeparatorPart>) {
  return (
    <AutocompleteSeparatorPart
      className={withClass("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  )
}

function AutocompleteEmpty({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteEmptyPart>) {
  return (
    <AutocompleteEmptyPart
      className={withClass("hidden px-3 py-6 text-center text-[13px] text-muted-foreground data-empty:block data-loading:block", className)}
      {...props}
    />
  )
}

function AutocompleteStatus({
  className,
  ...props
}: React.ComponentProps<typeof AutocompleteStatusPart>) {
  return (
    <AutocompleteStatusPart
      className={withClass("px-4 pt-3 pb-1 text-[12px] text-muted-foreground tabular-nums empty:hidden", className)}
      {...props}
    />
  )
}

/* Renders suggestions passed as data with the styled parts above. */
function AutocompleteItems({ items }: { items?: ListData<string> }) {
  return (items ?? []).map((entry, index) => {
    if (typeof entry === "string") {
      return (
        <AutocompleteItem key={entry} value={entry}>
          <AutocompleteItemText />
        </AutocompleteItem>
      )
    }
    if ("type" in entry && entry.type === "separator") {
      return <AutocompleteSeparator key={`separator-${index}`} />
    }
    if ("type" in entry && entry.type === "group") {
      return (
        <AutocompleteGroup key={`group-${entry.label ?? index}`}>
          {entry.label && <AutocompleteGroupLabel>{entry.label}</AutocompleteGroupLabel>}
          <AutocompleteItems items={entry.items} />
        </AutocompleteGroup>
      )
    }
    const { value, label, disabled, keywords } = entry
    return (
      <AutocompleteItem
        key={value}
        value={value}
        label={label}
        disabled={disabled}
        keywords={keywords}
      >
        <AutocompleteItemText />
      </AutocompleteItem>
    )
  })
}

export {
  Autocomplete,
  AutocompleteArrow,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteControl,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteItemIcon,
  AutocompleteItems,
  AutocompleteItemText,
  AutocompleteLabel,
  AutocompleteList,
  AutocompleteSeparator,
  AutocompleteStatus,
  AutocompleteTrigger,
  createAutocompleteController,
}
