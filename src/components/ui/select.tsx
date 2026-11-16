"use client"

/* Styled select: the animated primitive plus the Keyframery look. */

import {
  createSelectController,
  type ListData,
  Select as SelectRoot,
  SelectArrow as SelectArrowPart,
  SelectClear as SelectClearPart,
  SelectContent as SelectContentPart,
  SelectEmpty as SelectEmptyPart,
  SelectGroup as SelectGroupPart,
  SelectGroupLabel as SelectGroupLabelPart,
  SelectInput as SelectInputPart,
  SelectItem as SelectItemPart,
  SelectItemIcon as SelectItemIconPart,
  SelectItemIndicator as SelectItemIndicatorPart,
  SelectItemText as SelectItemTextPart,
  SelectLabel as SelectLabelPart,
  SelectList as SelectListPart,
  type SelectProps,
  SelectSelectAll as SelectSelectAllPart,
  SelectSeparator as SelectSeparatorPart,
  SelectStatus as SelectStatusPart,
  SelectTrigger as SelectTriggerPart,
  SelectValue as SelectValuePart,
  SelectValueIcon as SelectValueIconPart,
} from "@/components/primitives/select"
import * as React from "react"

import { Speed, type SpeedProps, useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* The sheet. Its motion (unfold, cascade, the gliding highlight) comes from the primitive. */
const sheet = cn(
  "group/content m-0 flex min-w-(--anchor-width) flex-col border-0 p-0 outline-none",
  "[--list-height:var(--available-height)]",
  /* Items placed straight in the sheet get the list's padding and scrolling. */
  "not-has-[[data-slot=select-list]]:max-h-[min(calc(var(--list-height,100vh)-8px),18rem)] not-has-[[data-slot=select-list]]:scroll-py-1.5 not-has-[[data-slot=select-list]]:overflow-y-auto not-has-[[data-slot=select-list]]:overscroll-contain not-has-[[data-slot=select-list]]:p-1.5",
  "rounded-[14px] bg-popover text-popover-foreground",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
  "before:rounded-[8px] before:bg-accent has-[[data-disabled][data-highlighted]]:before:bg-accent/50",
)

/* One row for items and the select-all row. No background of its own: the gliding highlight sits under it. */
const row = cn(
  "group/item relative flex min-h-8 cursor-default items-center gap-2 rounded-[8px] px-2 py-1.5 text-[13px] leading-4 outline-none select-none",
  "data-highlighted:text-accent-foreground",
  "data-disabled:pointer-events-none data-disabled:text-muted-foreground/60",
  /* Rows without an icon keep the icon column when another row in the list has one. */
  "[[data-has-icons]_&:not([data-has-icon])]:ps-8",
)

const field = cn(
  "flex h-9 w-full min-w-0 items-center gap-2 rounded-[10px] bg-background px-3 text-[13px] text-foreground outline-none",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]",
  "[transition:box-shadow_calc(150ms*var(--kf-speed,1)),background-color_calc(150ms*var(--kf-speed,1)),scale_calc(200ms*var(--kf-speed,1))_var(--ease-pop)] motion-reduce:transition-none!",
)

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 6.5 3-3 3 3M5 9.5l3 3 3-3" />
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
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="7" r="4.25" />
      <path d="m10.25 10.25 3.25 3.25" />
    </svg>
  )
}

function Select<T = string, Multiple extends boolean | undefined = false>(
  { speed, ...props }: SelectProps<T, Multiple> & SpeedProps,
) {
  return (
    <Speed speed={speed}>
      <SelectRoot<T, Multiple> {...(props as SelectProps<T, Multiple>)} />
    </Speed>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectLabelPart>) {
  return (
    <SelectLabelPart
      className={cn(
        "mb-2 block text-[13px] leading-none font-medium text-foreground data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

/* The field. Its chevron sits at the end; pass a SelectValue (and a SelectValueIcon) inside. */
function SelectTrigger({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof SelectTriggerPart>, "children"> & {
  children?: React.ReactNode
}) {
  return (
    <SelectTriggerPart
      className={cn(
        field,
        "cursor-pointer text-start select-none",
        "hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.16)]",
        "data-open:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)] dark:data-open:shadow-[0_0_0_1px_rgb(255_255_255/0.16)]",
        "focus-visible:shadow-[0_0_0_1px_var(--ring)] focus-visible:ring-[3px] focus-visible:ring-ring/25 dark:focus-visible:shadow-[0_0_0_1px_var(--ring)]",
        "aria-invalid:shadow-[0_0_0_1px_var(--destructive)] aria-invalid:focus-visible:ring-destructive/25 dark:aria-invalid:shadow-[0_0_0_1px_var(--destructive)]",
        "data-invalid:shadow-[0_0_0_1px_var(--destructive)] dark:data-invalid:shadow-[0_0_0_1px_var(--destructive)]",
        "active:bg-[color-mix(in_oklab,var(--background),var(--foreground)_2%)]",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-readonly:cursor-default data-readonly:bg-muted/40",
        "[&>svg:last-child]:ms-auto [&>svg:last-child]:size-4 [&>svg:last-child]:shrink-0 [&>svg:last-child]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronIcon />
    </SelectTriggerPart>
  )
}

function SelectValue({
  className,
  ...props
}: React.ComponentProps<typeof SelectValuePart>) {
  return (
    <SelectValuePart
      className={cn("min-w-0 flex-1 truncate data-placeholder:text-muted-foreground", className)}
      {...props}
    />
  )
}

/* Shows the chosen item's icon inside the field. */
function SelectValueIcon({
  className,
  ...props
}: React.ComponentProps<typeof SelectValueIconPart>) {
  return (
    <SelectValueIconPart
      className={cn(
        "-ms-0.5 grid size-4 shrink-0 place-items-center text-muted-foreground [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  )
}

function SelectClear({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectClearPart>) {
  return (
    <SelectClearPart
      className={cn(
        "grid size-6 shrink-0 cursor-pointer place-items-center rounded-[6px] text-muted-foreground outline-none [&_svg]:size-3.5",
        "transition-[color,background-color,scale] duration-[calc(150ms*var(--kf-speed,1))] hover:bg-foreground/[0.06] hover:text-foreground active:scale-[0.94]",
        "focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-40 motion-reduce:transition-none!",
        className,
      )}
      {...props}
    >
      {children ?? <XIcon />}
    </SelectClearPart>
  )
}

function SelectContent({
  className,
  children,
  sideOffset = 6,
  style,
  ...props
}: React.ComponentProps<typeof SelectContentPart>) {
  return (
    <SelectContentPart
      sideOffset={sideOffset}
      className={cn(sheet, className)}
      {...props} style={useSpeedStyle(style)}
    >
      {children ?? <SelectList />}
    </SelectContentPart>
  )
}

function SelectList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectListPart>) {
  return (
    <SelectListPart
      className={cn(
        "max-h-[min(calc(var(--list-height,100vh)-8px),18rem)] scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 outline-none",
        "aria-busy:opacity-60",
        "group-has-[[data-slot=select-empty][data-empty]]/content:hidden",
        className,
      )}
      {...props}
    >
      {children ?? ((state) => <SelectItems items={state.items} />)}
    </SelectListPart>
  )
}

/* A search field at the top of the sheet. */
function SelectInput({
  className,
  ...props
}: React.ComponentProps<typeof SelectInputPart>) {
  return (
    <div data-slot="select-input-row" className="relative flex items-center border-b border-border">
      <span className="pointer-events-none absolute start-3 grid size-4 place-items-center text-muted-foreground [&_svg]:size-4">
        <SearchIcon />
      </span>
      <SelectInputPart
        className={cn(
          "h-10 w-full min-w-0 bg-transparent ps-9 pe-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground",
          className,
        )}
        {...props}
      />
    </div>
  )
}

function SelectItem<T = string>({
  className,
  ...props
}: React.ComponentProps<typeof SelectItemPart<T>>) {
  return <SelectItemPart<T> className={cn(row, className)} {...props} />
}

/* The label of an item. It takes the free space, so hints and the check line up at the end.
   While searching, the matched part reads stronger. */
function SelectItemText({
  className,
  ...props
}: React.ComponentProps<typeof SelectItemTextPart>) {
  return (
    <SelectItemTextPart
      className={cn(
        "min-w-0 flex-1 truncate data-matched:text-muted-foreground [&_mark]:bg-transparent [&_mark]:font-medium [&_mark]:text-foreground",
        className,
      )}
      {...props}
    />
  )
}

/* The check. It stays mounted, so the primitive can draw it in when its item is chosen and
   when the sheet opens on the chosen item. */
function SelectItemIndicator({
  className,
  children,
  keepMounted = true,
  ...props
}: React.ComponentProps<typeof SelectItemIndicatorPart>) {
  return (
    <SelectItemIndicatorPart
      keepMounted={keepMounted}
      className={cn(
        "ms-auto grid size-4 shrink-0 place-items-center text-foreground [&_svg]:size-4",
        className,
      )}
      {...props}
    >
      {children ?? <CheckIcon />}
    </SelectItemIndicatorPart>
  )
}

function SelectItemIcon({
  className,
  ...props
}: React.ComponentProps<typeof SelectItemIconPart>) {
  return (
    <SelectItemIconPart
      className={cn(
        "grid size-4 shrink-0 place-items-center text-muted-foreground [&_svg]:size-4",
        "group-data-highlighted/item:text-current",
        "rtl:data-mirror:-scale-x-100",
        className,
      )}
      {...props}
    />
  )
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectGroupPart>) {
  return <SelectGroupPart className={cn("flex flex-col", className)} {...props} />
}

function SelectGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectGroupLabelPart>) {
  return (
    <SelectGroupLabelPart
      className={cn(
        "px-2 pt-1.5 pb-1 text-[11px] leading-4 font-medium text-muted-foreground select-none",
        "[[data-has-icons]_&]:ps-8",
        className,
      )}
      {...props}
    />
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectSeparatorPart>) {
  return (
    <SelectSeparatorPart
      className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectEmpty({
  className,
  ...props
}: React.ComponentProps<typeof SelectEmptyPart>) {
  return (
    <SelectEmptyPart
      className={cn(
        "hidden px-3 py-6 text-center text-[13px] text-muted-foreground data-empty:block data-loading:block",
        className,
      )}
      {...props}
    />
  )
}

function SelectStatus({
  className,
  ...props
}: React.ComponentProps<typeof SelectStatusPart>) {
  return (
    <SelectStatusPart
      className={cn("px-3.5 pt-2.5 pb-0.5 text-[12px] text-muted-foreground empty:hidden", className)}
      {...props}
    />
  )
}

function SelectSelectAll({
  className,
  ...props
}: React.ComponentProps<typeof SelectSelectAllPart>) {
  return (
    <SelectSelectAllPart
      className={cn(row, "font-medium data-unchecked:font-normal", className)}
      {...props}
    />
  )
}

function SelectArrow({
  className,
  ...props
}: React.ComponentProps<typeof SelectArrowPart>) {
  return (
    <SelectArrowPart
      className={cn("size-2.5 rotate-45 rounded-[2px] bg-popover", className)}
      {...props}
    />
  )
}

/* Renders items passed as data with the styled parts above. */
function SelectItems({ items }: { items?: ListData<unknown> }) {
  return (items ?? []).map((entry, index) => {
    if (typeof entry === "string") {
      return (
        <SelectItem key={entry} value={entry}>
          <SelectItemText>{entry}</SelectItemText>
          <SelectItemIndicator />
        </SelectItem>
      )
    }
    if ("type" in entry && entry.type === "separator") {
      return <SelectSeparator key={`separator-${index}`} />
    }
    if ("type" in entry && entry.type === "group") {
      return (
        <SelectGroup key={`group-${entry.label ?? index}`}>
          {entry.label && <SelectGroupLabel>{entry.label}</SelectGroupLabel>}
          <SelectItems items={entry.items} />
        </SelectGroup>
      )
    }
    const { value, label, disabled } = entry
    return (
      <SelectItem<unknown>
        key={typeof value === "string" ? value : index}
        value={value}
        label={label}
        disabled={disabled}
      >
        <SelectItemText>{label}</SelectItemText>
        <SelectItemIndicator />
      </SelectItem>
    )
  })
}

export type { ListData } from "@/components/primitives/select"
export {
  createSelectController,
  Select,
  SelectArrow,
  SelectClear,
  SelectContent,
  SelectEmpty,
  SelectGroup,
  SelectGroupLabel,
  SelectInput,
  SelectItem,
  SelectItemIcon,
  SelectItemIndicator,
  SelectItems,
  SelectItemText,
  SelectLabel,
  SelectList,
  SelectSelectAll,
  SelectSeparator,
  SelectStatus,
  SelectTrigger,
  SelectValue,
  SelectValueIcon,
}
