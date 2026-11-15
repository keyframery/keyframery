"use client"

/* Styled trigger menu: the animated primitive plus the Keyframery look. */

import {
  createTriggerMenuController,
  textFieldAdapter,
  TriggerMenu as TriggerMenuRoot,
  TriggerMenuContent as TriggerMenuContentPart,
  type TriggerMenuData,
  TriggerMenuEmpty as TriggerMenuEmptyPart,
  TriggerMenuGroup as TriggerMenuGroupPart,
  TriggerMenuGroupLabel as TriggerMenuGroupLabelPart,
  TriggerMenuHint as TriggerMenuHintPart,
  TriggerMenuInput as TriggerMenuInputPart,
  TriggerMenuItem as TriggerMenuItemPart,
  TriggerMenuItemIcon as TriggerMenuItemIconPart,
  TriggerMenuList as TriggerMenuListPart,
  type TriggerMenuProps,
  TriggerMenuSeparator as TriggerMenuSeparatorPart,
  TriggerMenuStatus as TriggerMenuStatusPart,
} from "@/components/primitives/trigger-menu"
import * as React from "react"

import { cn } from "@/lib/utils"

/* The sheet. Its motion comes from the primitive. */
const sheet = cn(
  "group/content m-0 flex w-64 flex-col border-0 p-0 outline-none",
  "[--list-height:var(--available-height)]",
  "rounded-[14px] bg-popover text-popover-foreground",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
)

/* One row per suggestion. Focus stays in the field; the list's gliding highlight is the cursor. */
const row = cn(
  "group/item relative flex min-h-8 cursor-default items-center gap-2 rounded-[8px] px-2 py-1.5 text-[13px] leading-4 outline-none select-none",
  "data-highlighted:text-accent-foreground",
  "data-disabled:text-muted-foreground/60 data-disabled:data-highlighted:text-muted-foreground/60",
  /* Rows without an icon keep the icon column when another row in the list has one. */
  "[[data-has-icons]_&:not([data-has-icon])]:ps-8",
)

function TriggerMenu<T = string>(props: TriggerMenuProps<T>) {
  return <TriggerMenuRoot<T> {...props} />
}

/* The field people type in: a textarea by default, an input through `render`. */
function TriggerMenuInput({
  className,
  ...props
}: React.ComponentProps<typeof TriggerMenuInputPart>) {
  return (
    <TriggerMenuInputPart
      className={cn(
        "block min-h-9 w-full min-w-0 resize-none rounded-[10px] bg-background px-3 py-2 text-[13px] leading-5 text-foreground outline-none placeholder:text-muted-foreground",
        "[field-sizing:content] [&:is(textarea)]:min-h-[84px]",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)]",
        "transition-shadow duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none!",
        "hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.16)]",
        "focus-visible:shadow-[0_0_0_1px_var(--ring)] focus-visible:ring-[3px] focus-visible:ring-ring/25 dark:focus-visible:shadow-[0_0_0_1px_var(--ring)]",
        "aria-invalid:shadow-[0_0_0_1px_var(--destructive)] aria-invalid:focus-visible:ring-destructive/25 dark:aria-invalid:shadow-[0_0_0_1px_var(--destructive)]",
        "disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-muted/40",
        className,
      )}
      {...props}
    />
  )
}

function TriggerMenuContent({
  className,
  children,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof TriggerMenuContentPart>) {
  return (
    <TriggerMenuContentPart
      sideOffset={sideOffset}
      className={cn(sheet, className)}
      {...props}
    >
      {children ?? <TriggerMenuList />}
    </TriggerMenuContentPart>
  )
}

function TriggerMenuList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TriggerMenuListPart>) {
  return (
    <TriggerMenuListPart
      className={cn(
        "max-h-[min(calc(var(--list-height,100vh)-8px),18rem)] scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 outline-none",
        "aria-busy:opacity-60 before:rounded-[8px] before:bg-accent",
        "has-[[data-disabled][data-highlighted]]:before:bg-accent/50",
        "group-has-[[data-slot=trigger-menu-empty][data-empty]]/content:hidden",
        className,
      )}
      {...props}
    >
      {children ?? ((state) => <TriggerMenuItems items={state.items} />)}
    </TriggerMenuListPart>
  )
}

function TriggerMenuItem<T = string>({
  className,
  ...props
}: React.ComponentProps<typeof TriggerMenuItemPart<T>>) {
  return <TriggerMenuItemPart<T> className={cn(row, className)} {...props} />
}

function TriggerMenuItemIcon({
  className,
  ...props
}: React.ComponentProps<typeof TriggerMenuItemIconPart>) {
  return (
    <TriggerMenuItemIconPart
      className={cn(
        "flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4",
        "group-data-highlighted/item:text-current",
        "rtl:data-mirror:-scale-x-100",
        className,
      )}
      {...props}
    />
  )
}

function TriggerMenuGroup({
  className,
  ...props
}: React.ComponentProps<typeof TriggerMenuGroupPart>) {
  return <TriggerMenuGroupPart className={cn("flex flex-col", className)} {...props} />
}

function TriggerMenuGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof TriggerMenuGroupLabelPart>) {
  return (
    <TriggerMenuGroupLabelPart
      className={cn(
        "px-2 pt-1.5 pb-1 text-[11px] leading-4 font-medium text-muted-foreground select-none",
        className,
      )}
      {...props}
    />
  )
}

function TriggerMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof TriggerMenuSeparatorPart>) {
  return (
    <TriggerMenuSeparatorPart
      className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  )
}

/* Shown while nothing matches. Rendering it keeps the menu open with no matches. */
function TriggerMenuEmpty({
  className,
  ...props
}: React.ComponentProps<typeof TriggerMenuEmptyPart>) {
  return (
    <TriggerMenuEmptyPart
      className={cn(
        "hidden px-3 py-5 text-center text-[13px] text-muted-foreground data-empty:block data-loading:block",
        className,
      )}
      {...props}
    />
  )
}

/* A polite live region. Hidden from sight by default, heard by screen readers. */
function TriggerMenuStatus({
  className,
  ...props
}: React.ComponentProps<typeof TriggerMenuStatusPart>) {
  return <TriggerMenuStatusPart className={cn("sr-only", className)} {...props} />
}

/* Ghost text at the caret for the arguments still to type. */
function TriggerMenuHint({
  className,
  ...props
}: React.ComponentProps<typeof TriggerMenuHintPart>) {
  return (
    <TriggerMenuHintPart
      className={cn("pointer-events-none text-[13px] text-muted-foreground/70 select-none", className)}
      {...props}
    />
  )
}

/* Renders suggestions passed as data with the styled parts above. */
function TriggerMenuItems({ items }: { items?: TriggerMenuData<unknown> }) {
  return (items ?? []).map((entry, index) => {
    if (typeof entry === "string") {
      return (
        <TriggerMenuItem key={entry} value={entry} label={entry}>
          {entry}
        </TriggerMenuItem>
      )
    }
    if ("type" in entry && entry.type === "separator") {
      return <TriggerMenuSeparator key={`separator-${index}`} />
    }
    if ("type" in entry && entry.type === "group") {
      return (
        <TriggerMenuGroup key={`group-${entry.label ?? index}`}>
          {entry.label && <TriggerMenuGroupLabel>{entry.label}</TriggerMenuGroupLabel>}
          <TriggerMenuItems items={entry.items} />
        </TriggerMenuGroup>
      )
    }
    const { value, label, disabled, keywords } = entry
    return (
      <TriggerMenuItem<unknown>
        key={typeof value === "string" ? value : index}
        value={value}
        label={label}
        disabled={disabled}
        keywords={keywords}
      >
        {label}
      </TriggerMenuItem>
    )
  })
}

export type { TriggerMenuData, TriggerMenuDataItem } from "@/components/primitives/trigger-menu"
export {
  createTriggerMenuController,
  textFieldAdapter,
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuGroup,
  TriggerMenuGroupLabel,
  TriggerMenuHint,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuItemIcon,
  TriggerMenuItems,
  TriggerMenuList,
  TriggerMenuSeparator,
  TriggerMenuStatus,
}
