"use client"

/* Animated drop-in for `@ui-sdk/react/image-cropper`: same parts, same props. Swap the import and keep
   your code. This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  ImageCropper as ImageCropperPart,
  ImageCropperFlip as ImageCropperFlipPart,
  ImageCropperGrid as ImageCropperGridPart,
  ImageCropperHandle as ImageCropperHandlePart,
  ImageCropperImage as ImageCropperImagePart,
  ImageCropperRotate as ImageCropperRotatePart,
  ImageCropperSelection as ImageCropperSelectionPart,
} from "@ui-sdk/react/image-cropper"
import * as React from "react"

import { cn } from "@/lib/utils"

export * from "@ui-sdk/react/image-cropper"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Press: buttons give under the finger and spring back on release. Scales with --kf-flourish. */
const press =
  "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop not-disabled:active:scale-[calc(1-0.04*var(--kf-flourish,1))] motion-reduce:transition-none!"

/* The root names a group so the image can tell when a drag is under way. */
function ImageCropper({ className, ...props }: React.ComponentProps<typeof ImageCropperPart>) {
  return <ImageCropperPart className={withClass("group/kf-cropper", className)} {...props} />
}

/* The image clears out of a blur once it loads, and springs to its new place and turn on a rotate,
   a flip or a frame zoom. While a pointer pans it, it follows the pointer exactly. The load fade and
   the spring to place are feedback; the load blur scales with --kf-flourish. */
function ImageCropperImage({ className, ...props }: React.ComponentProps<typeof ImageCropperImagePart>) {
  return (
    <ImageCropperImagePart
      className={withClass(
        cn(
          "[transition:left_calc(560ms*var(--kf-speed,1))_var(--ease-spring),top_calc(560ms*var(--kf-speed,1))_var(--ease-spring),width_calc(560ms*var(--kf-speed,1))_var(--ease-spring),height_calc(560ms*var(--kf-speed,1))_var(--ease-spring),transform_calc(620ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(420ms*var(--kf-speed,1))_var(--ease-house),filter_calc(420ms*var(--kf-speed,1))_var(--ease-house)]",
          "data-loading:opacity-0 data-loading:blur-[calc(10px*var(--kf-flourish,1))]",
          "group-data-dragging/kf-cropper:[transition:opacity_calc(420ms*var(--kf-speed,1))_var(--ease-house),filter_calc(420ms*var(--kf-speed,1))_var(--ease-house)]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The selection springs to its new box when the ratio or the zoom changes, or an arrow key moves
   it, and tracks the pointer exactly while dragged. Its shadow (the dimmed area outside) fades:
   in once the image loads, and lighter or darker as your own classes change it during a drag.
   Its grow-in on first show scales with --kf-flourish; at 0 it fades in. */
function ImageCropperSelection({ className, ...props }: React.ComponentProps<typeof ImageCropperSelectionPart>) {
  return (
    <ImageCropperSelectionPart
      className={withClass(
        cn(
          "[transition:left_calc(560ms*var(--kf-speed,1))_var(--ease-spring),top_calc(560ms*var(--kf-speed,1))_var(--ease-spring),width_calc(560ms*var(--kf-speed,1))_var(--ease-spring),height_calc(560ms*var(--kf-speed,1))_var(--ease-spring),box-shadow_calc(320ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(360ms*var(--kf-speed,1))_var(--ease-house),scale_calc(520ms*var(--kf-speed,1))_var(--ease-spring)]",
          "data-dragging:[transition:box-shadow_calc(320ms*var(--kf-speed,1))_var(--ease-house)]",
          "starting:scale-[calc(1-0.1*var(--kf-flourish,1))] starting:opacity-0",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The thirds fade in while you drag, and out when you let go. */
function ImageCropperGrid({ className, ...props }: React.ComponentProps<typeof ImageCropperGridPart>) {
  return (
    <ImageCropperGridPart
      className={withClass(
        cn(
          "opacity-0 transition-opacity duration-[calc(240ms*var(--kf-speed,1))] ease-house data-dragging:opacity-100",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* A handle grows with a pop under the pointer, and a little more while it is dragged. It sits beside
   the selection, so it springs to its new place on the selection's curve and tracks the pointer exactly
   during a drag. Set `data-hovered` to show the hover from script. The spring to place is feedback;
   the hover and drag growth scales with --kf-flourish. */
function ImageCropperHandle({ className, ...props }: React.ComponentProps<typeof ImageCropperHandlePart>) {
  return (
    <ImageCropperHandlePart
      className={withClass(
        cn(
          "[transition:left_calc(560ms*var(--kf-speed,1))_var(--ease-spring),top_calc(560ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(360ms*var(--kf-speed,1))_var(--ease-pop)]",
          "group-data-dragging/kf-cropper:[transition:scale_calc(360ms*var(--kf-speed,1))_var(--ease-pop)]",
          "not-data-disabled:hover:scale-[calc(1+0.45*var(--kf-flourish,1))] data-hovered:scale-[calc(1+0.45*var(--kf-flourish,1))] data-dragging:scale-[calc(1+0.6*var(--kf-flourish,1))]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ImageCropperRotate({ className, ...props }: React.ComponentProps<typeof ImageCropperRotatePart>) {
  return <ImageCropperRotatePart className={withClass(press, className)} {...props} />
}

function ImageCropperFlip({ className, ...props }: React.ComponentProps<typeof ImageCropperFlipPart>) {
  return <ImageCropperFlipPart className={withClass(press, className)} {...props} />
}

export {
  ImageCropper,
  ImageCropperFlip,
  ImageCropperGrid,
  ImageCropperHandle,
  ImageCropperImage,
  ImageCropperRotate,
  ImageCropperSelection,
}
