// Round avatar
// `shape="circle"` with `aspectRatio={1}` and `mode="frame"` fixes the circle and moves the photo under it, the way profile photos work. The slider zooms.
import { ImageCropper, ImageCropperImage, ImageCropperSelection, ImageCropperViewport, ImageCropperZoom } from "@/components/ui/image-cropper"

export default function ImageCropperAvatar() {
  return (
    <ImageCropper src="/demo/face-2.jpg" shape="circle" aspectRatio={1} mode="frame" maxZoom={3} aria-label="Profile photo" className="w-full max-w-[300px]">
      <ImageCropperViewport>
        <ImageCropperImage alt="" />
        <ImageCropperSelection />
      </ImageCropperViewport>
      <ImageCropperZoom aria-label="Zoom" />
    </ImageCropper>
  )
}
