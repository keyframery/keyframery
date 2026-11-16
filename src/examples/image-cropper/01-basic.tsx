// Box with handles
// Drag the selection to move it and its handles to resize it. `onCropChange` gives the crop in the image's own pixels.
import * as React from "react"

import {
  type ImageCrop,
  ImageCropper,
  ImageCropperGrid,
  ImageCropperHandle,
  ImageCropperImage,
  ImageCropperSelection,
  ImageCropperViewport,
} from "@/components/ui/image-cropper"

const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const

export default function ImageCropperBasic() {
  const [crop, setCrop] = React.useState<ImageCrop>()
  return (
    <div className="flex w-full max-w-[380px] flex-col gap-2">
      <ImageCropper src="/demo/lake.jpg" aria-label="Crop photo" onCropChange={setCrop}>
        <ImageCropperViewport>
          <ImageCropperImage alt="A lake between mountains" />
          <ImageCropperSelection>
            <ImageCropperGrid />
            {handles.map((position) => (
              <ImageCropperHandle key={position} position={position} />
            ))}
          </ImageCropperSelection>
        </ImageCropperViewport>
      </ImageCropper>
      <span className="text-[12px] text-muted-foreground tabular-nums">
        {crop ? `${Math.round(crop.width ?? 0)} × ${Math.round(crop.height ?? 0)} px` : "Loading…"}
      </span>
    </div>
  )
}
