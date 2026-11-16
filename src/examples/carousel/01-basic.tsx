// Basic
// Swipe, drag or use the buttons. Indicators show where you are and jump to a slide.
import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@/components/ui/carousel"

const photos = ["/demo/coast-1.jpg", "/demo/coast-2.jpg", "/demo/coast-3.jpg", "/demo/coast-4.jpg"]

export default function CarouselBasic() {
  return (
    <Carousel aria-label="Photos" className="w-full max-w-[380px]">
      <CarouselViewport>
        <CarouselContent>
          {photos.map((src, i) => (
            <CarouselItem key={src} aria-label={`Photo ${i + 1}`}>
              <img src={src} alt="" draggable={false} className="aspect-[4/3] w-full rounded-[12px] bg-muted object-cover" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
      <div className="flex items-center justify-between gap-4">
        <CarouselIndicatorGroup aria-label="Choose a photo">
          {photos.map((src, i) => (
            <CarouselIndicator key={src} page={i + 1} aria-label={`Photo ${i + 1}`} />
          ))}
        </CarouselIndicatorGroup>
        <div className="flex gap-2">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </div>
    </Carousel>
  )
}
