"use client"

/* Styled command palette: the animated primitive plus the Keyframery look. */

import {
  Command as CommandRoot,
  CommandEmpty as CommandEmptyPart,
  CommandGroup as CommandGroupPart,
  CommandGroupLabel as CommandGroupLabelPart,
  CommandInput as CommandInputPart,
  CommandItem as CommandItemPart,
  CommandItemIcon as CommandItemIconPart,
  CommandItemText as CommandItemTextPart,
  CommandList as CommandListPart,
  CommandPage as CommandPagePart,
  CommandSeparator as CommandSeparatorPart,
  CommandShortcut as CommandShortcutPart,
  CommandStatus as CommandStatusPart,
  createCommandController,
} from "@/components/primitives/command"
import * as React from "react"

import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* The palette is a sheet: the search row on top, the commands below. */
function Command({ speed, className, ...props }: React.ComponentProps<typeof CommandRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <CommandRoot
        className={cn(
          "group/command flex w-full flex-col overflow-hidden rounded-[14px] bg-popover text-popover-foreground",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
          "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

/* The search row: a leading svg, the input, and anything after it, over a hairline. */
function CommandSearch({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-search"
      className={cn(
        "flex h-12 shrink-0 items-center gap-2.5 border-b border-border px-4 text-muted-foreground",
        "[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:transition-colors [&>svg]:duration-[calc(150ms*var(--kf-speed,1))] has-[input:focus-visible]:[&>svg]:text-foreground motion-reduce:[&>svg]:transition-none",
        className,
      )}
      {...props}
    />
  )
}

/* Bare text in the search row: the sheet is the field, so focus shows on the row's icon
   and the caret, not as a ring around the whole palette. */
function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandInputPart>) {
  return (
    <CommandInputPart
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground",
        "[&::-webkit-search-cancel-button]:appearance-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandListPart>) {
  return (
    <CommandListPart
      className={cn(
        "max-h-[320px] scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 outline-none",
        "group-has-[[data-slot=command-empty][data-empty]]/command:hidden",
        /* The gliding highlight, in the row's shape and colour. */
        "before:rounded-[8px] before:bg-accent",
        className,
      )}
      {...props}
    />
  )
}

/* Renders no element. Its commands arrive by the primitive's cascade. */
function CommandPage(props: React.ComponentProps<typeof CommandPagePart>) {
  return <CommandPagePart {...props} />
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandItemPart>) {
  return (
    <CommandItemPart
      className={cn(
        "group/item relative flex h-9 cursor-default items-center gap-2.5 rounded-[8px] px-2.5 text-[13px] leading-none outline-none select-none",
        "data-highlighted:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        "data-pending:cursor-progress data-pending:opacity-60",
        className,
      )}
      {...props}
    />
  )
}

function CommandItemIcon({
  className,
  ...props
}: React.ComponentProps<typeof CommandItemIconPart>) {
  return (
    <CommandItemIconPart
      className={cn(
        "grid size-4 shrink-0 place-items-center text-muted-foreground transition-colors duration-[calc(100ms*var(--kf-speed,1))] group-data-highlighted/item:text-foreground data-mirror:rtl:-scale-x-100 motion-reduce:transition-none! [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  )
}

/* The matched part reads stronger; the rest steps back. */
function CommandItemText({
  className,
  ...props
}: React.ComponentProps<typeof CommandItemTextPart>) {
  return (
    <CommandItemTextPart
      className={cn(
        "min-w-0 flex-1 truncate leading-[1.3]",
        "data-matched:text-foreground/70 [&_mark]:bg-transparent [&_mark]:font-semibold [&_mark]:text-foreground",
        className,
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<typeof CommandShortcutPart>) {
  return (
    <CommandShortcutPart
      className={cn(
        "ml-auto shrink-0 pl-3 text-[12px] tracking-[0.08em] text-muted-foreground tabular-nums",
        className,
      )}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandGroupPart>) {
  return <CommandGroupPart className={cn("flex flex-col", className)} {...props} />
}

function CommandGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof CommandGroupLabelPart>) {
  return (
    <CommandGroupLabelPart
      className={cn(
        "px-2.5 pt-2.5 pb-1.5 text-[11px] leading-none font-medium text-muted-foreground select-none",
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandSeparatorPart>) {
  return (
    <CommandSeparatorPart
      className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandEmptyPart>) {
  return (
    <CommandEmptyPart
      className={cn(
        "hidden px-4 py-10 text-center text-[13px] text-muted-foreground data-empty:block data-loading:block",
        className,
      )}
      {...props}
    />
  )
}

function CommandStatus({
  className,
  ...props
}: React.ComponentProps<typeof CommandStatusPart>) {
  return (
    <CommandStatusPart
      className={cn(
        "px-4 pt-3 pb-1 text-[12px] text-muted-foreground tabular-nums empty:hidden",
        className,
      )}
      {...props}
    />
  )
}

/* A quiet strip under the list for hints such as which keys do what. */
function CommandFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-footer"
      className={cn(
        "flex h-10 shrink-0 items-center gap-4 border-t border-border bg-muted/40 px-4 text-[12px] text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIcon,
  CommandItemText,
  CommandList,
  CommandPage,
  CommandSearch,
  CommandSeparator,
  CommandShortcut,
  CommandStatus,
  createCommandController,
}
