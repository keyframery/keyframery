import { AspectRatio, AspectRatioImage } from "@/components/ui/aspect-ratio"

export default function Usage() {
  return (
    <AspectRatio ratio={16 / 9}>
      <AspectRatioImage src="/demo/coast-1.jpg" alt="A cove at low tide" />
    </AspectRatio>
  )
}
