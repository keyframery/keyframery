"use client"

/* Styled color picker: the animated primitive plus the Keyframery look. */

import {
  ColorPicker as ColorPickerRoot,
  ColorPickerArea as ColorPickerAreaPart,
  ColorPickerAreaCanvas as ColorPickerAreaCanvasPart,
  ColorPickerAreaThumb as ColorPickerAreaThumbPart,
  ColorPickerChannelInput as ColorPickerChannelInputPart,
  ColorPickerContent as ColorPickerContentPart,
  ColorPickerEyeDropper as ColorPickerEyeDropperPart,
  ColorPickerInput as ColorPickerInputPart,
  ColorPickerPopover as ColorPickerPopoverPart,
  ColorPickerSlider as ColorPickerSliderPart,
  ColorPickerSliderThumb as ColorPickerSliderThumbPart,
  ColorPickerSwatch as ColorPickerSwatchPart,
  ColorPickerSwatches as ColorPickerSwatchesPart,
  ColorPickerSwatchItem as ColorPickerSwatchItemPart,
  ColorPickerTrigger as ColorPickerTriggerPart,
  createColorPickerController,
} from "@/components/primitives/color-picker"
import * as React from "react"

import { cn } from "@/lib/utils"

/* A hairline inside anything filled with the colour, so white and black still have an edge. */
const colorEdge =
  "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]"

/* Transparent colours sit on a quiet checkerboard. */
const checker =
  "[background:linear-gradient(var(--color-picker-color),var(--color-picker-color)),repeating-conic-gradient(var(--muted)_0_25%,var(--background)_0_50%)_0_0/8px_8px]"

/* Thumbs are small keys filled with the colour: a white collar, a hairline and a soft drop. */
const thumb = cn(
  "absolute size-[18px] -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full bg-(--color-picker-color) outline-none",
  "shadow-[0_0_0_2.5px_rgb(255_255_255),0_0_0_3.5px_rgb(0_0_0/0.12),0_2px_6px_rgb(0_0_0/0.3)]",
  "dark:shadow-[0_0_0_2.5px_rgb(255_255_255),0_0_0_3.5px_rgb(0_0_0/0.5),0_2px_8px_rgb(0_0_0/0.6)]",
  "active:cursor-grabbing",
  "focus-visible:shadow-[0_0_0_2.5px_rgb(255_255_255),0_0_0_4.5px_var(--ring),0_2px_6px_rgb(0_0_0/0.3)]",
  "data-disabled:cursor-not-allowed data-readonly:cursor-default",
)

const fieldLook =
  "rounded-[9px] bg-background text-[13px] text-foreground outline-none " +
  "[--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)] " +
  "shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)] " +
  "transition-[box-shadow] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none! " +
  "hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)] " +
  "focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:[--field-line:var(--ring)] dark:focus-visible:[--field-line:var(--ring)] " +
  "aria-invalid:ring-destructive/25 aria-invalid:[--field-line:var(--destructive)] " +
  "data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:text-muted-foreground data-readonly:bg-muted/50"

function ColorPicker({ className, ...props }: React.ComponentProps<typeof ColorPickerRoot>) {
  return (
    <ColorPickerRoot
      className={cn("flex flex-col gap-3 data-disabled:opacity-60", className)}
      {...props}
    />
  )
}

/* The area is a well painted with the colour's two channels. */
function ColorPickerArea({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerAreaPart>) {
  return (
    <ColorPickerAreaPart
      className={cn(
        "relative isolate h-36 w-full shrink-0 touch-none rounded-[10px] [background:var(--color-area-background)] select-none",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_1px_2px_rgb(0_0_0/0.12),inset_0_0_0_1px_rgb(0_0_0/0.08)] dark:after:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.06)]",
        "data-disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  )
}

function ColorPickerAreaCanvas({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerAreaCanvasPart>) {
  return (
    <ColorPickerAreaCanvasPart
      className={cn("absolute inset-0 -z-10 size-full rounded-[inherit]", className)}
      {...props}
    />
  )
}

function ColorPickerAreaThumb({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerAreaThumbPart>) {
  return <ColorPickerAreaThumbPart className={cn(thumb, "z-10", className)} {...props} />
}

/* A slider is a pill-shaped well drawn with its channel's gradient. */
function ColorPickerSlider({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerSliderPart>) {
  return (
    <ColorPickerSliderPart
      className={cn(
        "relative isolate shrink-0 touch-none rounded-full select-none",
        "data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-36 data-[orientation=vertical]:w-3",
        "[background:var(--color-slider-background)]",
        "data-[channel=alpha]:[background:var(--color-slider-background),repeating-conic-gradient(var(--muted)_0_25%,var(--background)_0_50%)_0_0/8px_8px]",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_1px_2px_rgb(0_0_0/0.12),inset_0_0_0_1px_rgb(0_0_0/0.08)] dark:after:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.06)]",
        "data-disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  )
}

function ColorPickerSliderThumb({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerSliderThumbPart>) {
  return (
    <ColorPickerSliderThumbPart
      className={cn(
        thumb,
        "z-10 data-[orientation=horizontal]:top-1/2 data-[orientation=vertical]:left-1/2",
        className,
      )}
      {...props}
    />
  )
}

/* The current colour, on a checkerboard so transparency reads. */
function ColorPickerSwatch({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerSwatchPart>) {
  return (
    <ColorPickerSwatchPart
      className={cn("relative size-8 shrink-0 rounded-[8px]", checker, colorEdge, className)}
      {...props}
    />
  )
}

function ColorPickerInput({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerInputPart>) {
  return (
    <ColorPickerInputPart
      className={cn(fieldLook, "h-8 w-full min-w-0 px-2.5 tabular-nums", className)}
      {...props}
    />
  )
}

function ColorPickerChannelInput({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerChannelInputPart>) {
  return (
    <ColorPickerChannelInputPart
      className={cn(fieldLook, "h-8 w-full min-w-0 px-2 text-center tabular-nums", className)}
      {...props}
    />
  )
}

function ColorPickerEyeDropper({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ColorPickerEyeDropperPart>) {
  return (
    <ColorPickerEyeDropperPart
      className={cn(
        "grid size-8 shrink-0 cursor-pointer place-items-center rounded-[9px] bg-background text-foreground outline-none",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
        "dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
        "hover:bg-accent",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
        "data-disabled:pointer-events-none data-disabled:opacity-40 data-unsupported:hidden",
        "[&_svg]:size-4",
        className,
      )}
      {...props}
    >
      {children ?? (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9.5 4.5 2 2M3 13l1-3 6.25-6.25a1.4 1.4 0 0 1 2 2L6 12z" />
        </svg>
      )}
    </ColorPickerEyeDropperPart>
  )
}

function ColorPickerSwatches({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerSwatchesPart>) {
  return (
    <ColorPickerSwatchesPart
      className={cn("flex flex-wrap items-center gap-2 p-0.5", className)}
      {...props}
    />
  )
}

/* A preset. When it is the value, a ring in its own colour opens around it. */
function ColorPickerSwatchItem({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerSwatchItemPart>) {
  return (
    <ColorPickerSwatchItemPart
      className={cn(
        "relative size-6 shrink-0 cursor-pointer rounded-full bg-(--color-picker-color) outline-none",
        "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1),0_0_0_0_var(--popover),0_0_0_0_var(--color-picker-color)]",
        "dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12),0_0_0_0_var(--popover),0_0_0_0_var(--color-picker-color)]",
        "data-selected:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1),0_0_0_2px_var(--popover),0_0_0_3.5px_var(--color-picker-color)]",
        "dark:data-selected:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12),0_0_0_2px_var(--popover),0_0_0_3.5px_var(--color-picker-color)]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-[5px] focus-visible:ring-offset-popover",
        "data-disabled:pointer-events-none data-disabled:opacity-40 data-readonly:cursor-default",
        className,
      )}
      {...props}
    />
  )
}

/* With a popover inside the picker, a swatch button opens the parts in a sheet. */
function ColorPickerPopover(props: React.ComponentProps<typeof ColorPickerPopoverPart>) {
  return <ColorPickerPopoverPart {...props} />
}

function ColorPickerTrigger({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerTriggerPart>) {
  return (
    <ColorPickerTriggerPart
      className={cn(
        "inline-flex h-9 cursor-pointer items-center gap-2 rounded-[10px] bg-background pr-3 pl-1.5 text-[13px] leading-none font-medium text-foreground outline-none",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
        "dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "*:data-[slot=color-picker-swatch]:size-6 *:data-[slot=color-picker-swatch]:rounded-[6px]",
        "[&>svg]:size-4 [&>svg]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

function ColorPickerContent({
  className,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof ColorPickerContentPart>) {
  return (
    <ColorPickerContentPart
      sideOffset={sideOffset}
      className={cn(
        "flex w-64 flex-col gap-3 rounded-[14px] bg-popover p-3 text-popover-foreground outline-none",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)]",
        "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
        className,
      )}
      {...props}
    />
  )
}

export {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaCanvas,
  ColorPickerAreaThumb,
  ColorPickerChannelInput,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerInput,
  ColorPickerPopover,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerSwatch,
  ColorPickerSwatches,
  ColorPickerSwatchItem,
  ColorPickerTrigger,
  createColorPickerController,
}
