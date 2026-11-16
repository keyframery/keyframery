// Rotate and flip
// `ImageCropperRotate` turns the photo a quarter at a time, and `ImageCropperFlip` mirrors it.
import { FlipHorizontal2, RotateCw } from "lucide-react"

import { ImageCropper, ImageCropperFlip, ImageCropperImage, ImageCropperRotate, ImageCropperSelection, ImageCropperViewport } from "@/components/ui/image-cropper"

export default function ImageCropperTools() {
  return (
    <ImageCropper src="/demo/cup.jpg" aspectRatio={4 / 3} aria-label="Crop photo" className="w-full max-w-[360px]">
      <ImageCropperViewport>
        <ImageCropperImage alt="A coffee cup" />
        <ImageCropperSelection />
      </ImageCropperViewport>
      <div className="flex gap-2">
        <ImageCropperRotate aria-label="Rotate">
          <RotateCw />
        </ImageCropperRotate>
        <ImageCropperFlip aria-label="Flip">
          <FlipHorizontal2 />
        </ImageCropperFlip>
      </div>
    </ImageCropper>
  )
}
