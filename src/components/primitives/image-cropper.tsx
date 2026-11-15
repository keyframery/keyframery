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

/* Press: buttons give under the finger and spring back on release. */
const press =
  "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop not-disabled:active:scale-[0.96] motion-reduce:transition-none!"

/* The root names a group so the image can tell when a drag is under way. */
function ImageCropper({ className, ...props }: React.ComponentProps<typeof ImageCropperPart>) {
  return <ImageCropperPart className={withClass("group/kf-cropper", className)} {...props} />
}

/* The image clears out of a blur once it loads, and springs to its new place and turn on a rotate,
   a flip or a frame zoom. While a pointer pans it, it follows the pointer exactly. */
function ImageCropperImage({ className, ...props }: React.ComponentProps<typeof ImageCropperImagePart>) {
  return (
    <ImageCropperImagePart
      className={withClass(
        cn(
          "[transition:left_calc(560ms*var(--kf-speed,1))_var(--ease-spring),top_calc(560ms*var(--kf-speed,1))_var(--ease-spring),width_calc(560ms*var(--kf-speed,1))_var(--ease-spring),height_calc(560ms*var(--kf-speed,1))_var(--ease-spring),transform_calc(620ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(420ms*var(--kf-speed,1))_var(--ease-house),filter_calc(420ms*var(--kf-speed,1))_var(--ease-house)]",
          "data-loading:opacity-0 data-loading:blur-[10px]",
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
   in once the image loads, and lighter or darker as your own classes change it during a drag. */
function ImageCropperSelection({ className, ...props }: React.ComponentProps<typeof ImageCropperSelectionPart>) {
  return (
    <ImageCropperSelectionPart
      className={withClass(
        cn(
          "[transition:left_calc(560ms*var(--kf-speed,1))_var(--ease-spring),top_calc(560ms*var(--kf-speed,1))_var(--ease-spring),width_calc(560ms*var(--kf-speed,1))_var(--ease-spring),height_calc(560ms*var(--kf-speed,1))_var(--ease-spring),box-shadow_calc(320ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(360ms*var(--kf-speed,1))_var(--ease-house),scale_calc(520ms*var(--kf-speed,1))_var(--ease-spring)]",
          "data-dragging:[transition:box-shadow_calc(320ms*var(--kf-speed,1))_var(--ease-house)]",
          "starting:scale-[0.9] starting:opacity-0",
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

/* A handle grows with a pop under the pointer, and a little more while it is dragged. Set
   `data-hovered` to show the hover from script. */
function ImageCropperHandle({ className, ...props }: React.ComponentProps<typeof ImageCropperHandlePart>) {
  return (
    <ImageCropperHandlePart
      className={withClass(
        cn(
          "transition-[scale] duration-[calc(360ms*var(--kf-speed,1))] ease-pop",
          "not-data-disabled:hover:scale-[1.45] data-hovered:scale-[1.45] data-dragging:scale-[1.6]",
          "motion-reduce:transition-none!",
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
