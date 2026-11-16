import { ImageCropper, ImageCropperImage, ImageCropperSelection, ImageCropperViewport } from "@/components/ui/image-cropper"

export default function Usage() {
  return (
    <ImageCropper src="/photo.jpg" aria-label="Crop photo">
      <ImageCropperViewport>
        <ImageCropperImage alt="" />
        <ImageCropperSelection />
      </ImageCropperViewport>
    </ImageCropper>
  )
}
