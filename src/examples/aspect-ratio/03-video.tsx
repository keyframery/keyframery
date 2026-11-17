// Any content
// The frame keeps anything at its ratio, like an embedded video or a map. Fill it with `absolute inset-0`.
import { AspectRatio } from "@/components/ui/aspect-ratio"

export default function AspectRatioVideo() {
  return (
    <AspectRatio ratio={16 / 9} className="max-w-[420px]">
      <video className="absolute inset-0 size-full object-cover" poster="/demo/coast-5.jpg" controls muted />
    </AspectRatio>
  )
}
