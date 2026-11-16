// Sideways
// Add a horizontal scrollbar for wide content, like a row of photos.
import { ScrollArea, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from "@/components/ui/scroll-area"

const photos = ["coast-1", "coast-2", "coast-3", "coast-4", "coast-5", "lake"]

export default function ScrollAreaHorizontal() {
  return (
    <ScrollArea className="w-full max-w-[400px] rounded-[12px] border">
      <ScrollAreaViewport role="region" aria-label="Photos">
        <ScrollAreaContent className="flex w-max gap-3 p-3">
          {photos.map((name) => (
            <img key={name} src={`/demo/${name}.jpg`} alt="" className="h-28 w-40 shrink-0 rounded-[10px] bg-muted object-cover" />
          ))}
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="horizontal">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  )
}
