"use client"

/* Styled image cropper: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  ImageCropper as ImageCropperPrimitive,
  ImageCropperFlip as ImageCropperFlipPrimitive,
  ImageCropperGrid as ImageCropperGridPrimitive,
  ImageCropperHandle as ImageCropperHandlePrimitive,
  ImageCropperImage as ImageCropperImagePrimitive,
  ImageCropperRotate as ImageCropperRotatePrimitive,
  ImageCropperSelection as ImageCropperSelectionPrimitive,
  ImageCropperViewport as ImageCropperViewportPrimitive,
  ImageCropperZoom as ImageCropperZoomPrimitive,
} from "@/components/primitives/image-cropper"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

export { createImageCropperController, type ImageCrop } from "@/components/primitives/image-cropper"

function ImageCropper({ speed, className, ...props }: React.ComponentProps<typeof ImageCropperPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <ImageCropperPrimitive
        className={cn("flex flex-col gap-3 data-disabled:opacity-60", className as string)}
        {...props}
      />
    </Speed>
  )
}

/* A dark well the photo sits in, sized to the photo, with room around it for the handles. Dark in
   both themes, like a photo editor: the dim outside the crop then reads as one canvas. */
function ImageCropperViewport({ className, ...props }: React.ComponentProps<typeof ImageCropperViewportPrimitive>) {
  return (
    <ImageCropperViewportPrimitive
      className={cn(
        "box-border w-full rounded-[14px] bg-[oklch(0.24_0_0)] p-2.5 aspect-(--image-cropper-aspect-ratio,4/3) dark:bg-muted",
        "shadow-[inset_0_1px_2px_rgb(0_0_0/0.3),inset_0_0_0_1px_rgb(0_0_0/0.1)]",
        "dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
        className as string,
      )}
      {...props}
    />
  )
}

function ImageCropperImage({ className, ...props }: React.ComponentProps<typeof ImageCropperImagePrimitive>) {
  return <ImageCropperImagePrimitive className={cn("rounded-[3px]", className as string)} {...props} />
}

/* A white hairline around the crop, and a dimmed photo outside it that lightens while you drag. */
function ImageCropperSelection({ className, ...props }: React.ComponentProps<typeof ImageCropperSelectionPrimitive>) {
  return (
    <ImageCropperSelectionPrimitive
      className={cn(
        "outline-none data-[shape=circle]:rounded-full",
        "shadow-[0_0_0_1.5px_rgb(255_255_255/0.95),0_0_0_9999px_rgb(0_0_0/0.52)]",
        "data-dragging:shadow-[0_0_0_1.5px_rgb(255_255_255/0.95),0_0_0_9999px_rgb(0_0_0/0.3)]",
        "starting:shadow-[0_0_0_1.5px_rgb(255_255_255/0),0_0_0_9999px_rgb(0_0_0/0)]",
        "focus-visible:shadow-[0_0_0_2px_var(--ring),0_0_0_9999px_rgb(0_0_0/0.52)]",
        className as string,
      )}
      {...props}
    />
  )
}

/* Lines in thirds. */
function ImageCropperGrid({ className, ...props }: React.ComponentProps<typeof ImageCropperGridPrimitive>) {
  return (
    <ImageCropperGridPrimitive
      className={cn(
        "before:absolute before:inset-y-0 before:left-1/3 before:right-1/3 before:border-x before:border-white/50 before:content-['']",
        "after:absolute after:inset-x-0 after:top-1/3 after:bottom-1/3 after:border-y after:border-white/50 after:content-['']",
        className as string,
      )}
      {...props}
    />
  )
}

/* White dots on the corners and short bars on the edges, with a larger invisible grip around each. */
function ImageCropperHandle({ className, ...props }: React.ComponentProps<typeof ImageCropperHandlePrimitive>) {
  return (
    <ImageCropperHandlePrimitive
      className={cn(
        "absolute z-10 -translate-1/2 rounded-full bg-white outline-none",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.18),0_1px_3px_rgb(0_0_0/0.35)]",
        "before:absolute before:-inset-2.5 before:content-['']",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-white",
        "data-[position=nw]:top-0 data-[position=nw]:left-0 data-[position=ne]:top-0 data-[position=ne]:left-full",
        "data-[position=sw]:top-full data-[position=sw]:left-0 data-[position=se]:top-full data-[position=se]:left-full",
        "data-[position=n]:top-0 data-[position=n]:left-1/2 data-[position=s]:top-full data-[position=s]:left-1/2",
        "data-[position=w]:top-1/2 data-[position=w]:left-0 data-[position=e]:top-1/2 data-[position=e]:left-full",
        "data-[position=ne]:size-3 data-[position=nw]:size-3 data-[position=se]:size-3 data-[position=sw]:size-3",
        "data-[position=n]:h-1.5 data-[position=n]:w-5 data-[position=s]:h-1.5 data-[position=s]:w-5",
        "data-[position=e]:h-5 data-[position=e]:w-1.5 data-[position=w]:h-5 data-[position=w]:w-1.5",
        className as string,
      )}
      {...props}
    />
  )
}

/* A thin range: a pill well with a round key for a thumb. */
function ImageCropperZoom({ className, ...props }: React.ComponentProps<typeof ImageCropperZoomPrimitive>) {
  return (
    <ImageCropperZoomPrimitive
      className={cn(
        "h-5 w-full cursor-pointer appearance-none bg-transparent outline-none disabled:cursor-not-allowed",
        "[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-muted",
        "[&::-webkit-slider-runnable-track]:shadow-[inset_0_1px_1px_rgb(0_0_0/0.08),inset_0_0_0_1px_rgb(0_0_0/0.04)] dark:[&::-webkit-slider-runnable-track]:bg-accent",
        "[&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-background",
        "[&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_1px_rgb(0_0_0/0.06),0_2px_5px_-1px_rgb(0_0_0/0.16)]",
        "[&::-webkit-slider-thumb]:transition-[scale] [&::-webkit-slider-thumb]:duration-[calc(300ms*var(--kf-speed,1))] [&::-webkit-slider-thumb]:ease-pop active:[&::-webkit-slider-thumb]:scale-125",
        "dark:[&::-webkit-slider-thumb]:bg-foreground",
        "[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted",
        "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-background",
        "focus-visible:[&::-webkit-slider-thumb]:ring-2 focus-visible:[&::-webkit-slider-thumb]:ring-ring focus-visible:[&::-webkit-slider-thumb]:ring-offset-2 focus-visible:[&::-webkit-slider-thumb]:ring-offset-background",
        "motion-reduce:[&::-webkit-slider-thumb]:transition-none",
        className as string,
      )}
      {...props}
    />
  )
}

const keyButton = cn(
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-[9px] px-2.5 text-[13px] leading-none font-medium outline-none",
  "bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
  "dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
)

function ImageCropperRotate({ className, ...props }: React.ComponentProps<typeof ImageCropperRotatePrimitive>) {
  return <ImageCropperRotatePrimitive className={cn(keyButton, className as string)} {...props} />
}

function ImageCropperFlip({ className, ...props }: React.ComponentProps<typeof ImageCropperFlipPrimitive>) {
  return <ImageCropperFlipPrimitive className={cn(keyButton, className as string)} {...props} />
}

export {
  ImageCropper,
  ImageCropperFlip,
  ImageCropperGrid,
  ImageCropperHandle,
  ImageCropperImage,
  ImageCropperRotate,
  ImageCropperSelection,
  ImageCropperViewport,
  ImageCropperZoom,
}
