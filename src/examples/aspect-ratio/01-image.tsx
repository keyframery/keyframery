// Image
// The frame holds its shape before the photo arrives; `AspectRatioImage` fades it up out of a blur once it has loaded.
import { AspectRatio, AspectRatioImage } from "@/components/ui/aspect-ratio"

export default function AspectRatioImageExample() {
  return (
    <AspectRatio ratio={4 / 3} className="max-w-[360px]">
      <AspectRatioImage src="/demo/canal.jpg" alt="Canal houses in the morning light" />
    </AspectRatio>
  )
}
