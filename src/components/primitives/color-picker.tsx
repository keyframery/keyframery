"use client"

/* Animated drop-in for `@ui-sdk/react/color-picker`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Area and slider thumbs: grow with a pop while grabbed, whether you press the thumb or the track.
   - Swatch items: the chosen one pops (scale 0.7 to 1 on `ease-pop`), so its ring opens with a bounce.
   - Extra helpers for a picker in a popup: ColorPickerPopover, ColorPickerTrigger (Press) and
     ColorPickerContent (Unfold), built on `@ui-sdk/react/popover`. */

import {
  ColorPickerArea as ColorPickerAreaPart,
  ColorPickerAreaThumb as ColorPickerAreaThumbPart,
  ColorPickerEyeDropper as ColorPickerEyeDropperPart,
  ColorPickerSlider as ColorPickerSliderPart,
  ColorPickerSliderThumb as ColorPickerSliderThumbPart,
  ColorPickerSwatchItem as ColorPickerSwatchItemPart,
} from "@ui-sdk/react/color-picker"
import {
  Popover as PopoverRoot,
  PopoverContent as PopoverContentPart,
  PopoverTrigger as PopoverTriggerPart,
} from "@ui-sdk/react/popover"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/color-picker"

const popKeyframes = "@keyframes kf-pop{from{scale:.7}to{scale:1}}"

const thumb =
  "transition-[scale,box-shadow] duration-[calc(320ms*var(--kf-speed,1))] ease-pop hover:scale-110 active:scale-[1.35] motion-reduce:transition-none!"

function ColorPickerArea({ className, ...props }: React.ComponentProps<typeof ColorPickerAreaPart>) {
  return <ColorPickerAreaPart className={withClass("group/kf-track", className)} {...props} />
}

function ColorPickerSlider({ className, ...props }: React.ComponentProps<typeof ColorPickerSliderPart>) {
  return <ColorPickerSliderPart className={withClass("group/kf-track", className)} {...props} />
}

function ColorPickerAreaThumb({ className, ...props }: React.ComponentProps<typeof ColorPickerAreaThumbPart>) {
  return (
    <ColorPickerAreaThumbPart
      className={withClass(
        cn(
          thumb, "group-active/kf-track:scale-[1.35]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ColorPickerSliderThumb({ className, ...props }: React.ComponentProps<typeof ColorPickerSliderThumbPart>) {
  return (
    <ColorPickerSliderThumbPart
      className={withClass(
        cn(
          thumb, "group-active/kf-track:scale-[1.35]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ColorPickerSwatchItem({ className, ...props }: React.ComponentProps<typeof ColorPickerSwatchItemPart>) {
  return (
    <>
      <style href="kf-pop" precedence="default">
        {popKeyframes}
      </style>
      <ColorPickerSwatchItemPart
        className={withClass(
          cn(
            "transition-[scale,box-shadow] duration-[calc(260ms*var(--kf-speed,1))] ease-pop hover:scale-110 active:scale-90",
            "data-selected:animate-[kf-pop_calc(460ms*var(--kf-speed,1))_var(--ease-pop)] data-selected:hover:scale-100",
            "motion-reduce:transition-none! motion-reduce:animate-none!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

function ColorPickerEyeDropper({ className, ...props }: React.ComponentProps<typeof ColorPickerEyeDropperPart>) {
  return (
    <ColorPickerEyeDropperPart
      className={withClass("transition-[scale,background-color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] motion-reduce:transition-none!", className)}
      {...props}
    />
  )
}

/* Helpers for a picker that opens from a swatch. Put the popover inside the ColorPicker. */
function ColorPickerPopover(props: React.ComponentProps<typeof PopoverRoot>) {
  return <PopoverRoot {...props} />
}

function ColorPickerTrigger({ className, ...props }: React.ComponentProps<typeof PopoverTriggerPart>) {
  return (
    <PopoverTriggerPart
      className={withClass(
        cn(
          "transition-[scale,background-color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] motion-reduce:transition-none!",
          "[&>svg]:transition-[rotate] [&>svg]:duration-[calc(420ms*var(--kf-speed,1))] [&>svg]:ease-spring data-open:[&>svg]:rotate-180 motion-reduce:[&>svg]:transition-none",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Unfold: from the swatch, scale 0.86 with a 6px blur and 8px toward it, on a spring. */
function ColorPickerContent({ className, ...props }: React.ComponentProps<typeof PopoverContentPart>) {
  return (
    <PopoverContentPart
      className={withClass(
        cn(
          "origin-(--transform-origin) transition-[opacity,scale,translate,filter] duration-[calc(380ms*var(--kf-speed,1))] ease-spring",
          "data-starting-style:scale-[0.86] data-starting-style:opacity-0 data-starting-style:blur-[6px]",
          "data-[side=bottom]:data-starting-style:-translate-y-2 data-[side=top]:data-starting-style:translate-y-2",
          "data-[side=left]:data-starting-style:translate-x-2 data-[side=right]:data-starting-style:-translate-x-2",
          "data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:blur-[2px] data-ending-style:duration-[calc(150ms*var(--kf-speed,1))] data-ending-style:ease-house",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export {
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerPopover,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerSwatchItem,
  ColorPickerTrigger,
}
