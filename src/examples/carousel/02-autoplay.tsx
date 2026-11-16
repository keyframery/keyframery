// Autoplay
// `defaultPlaying` advances on its own every `interval` ms. `CarouselPlayToggle` pauses it, and `CarouselProgress` shows the time to the next slide.
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPlayToggle,
  CarouselProgress,
  CarouselViewport,
} from "@/components/ui/carousel"

const slides = ["/demo/food-1.jpg", "/demo/food-2.jpg", "/demo/food-3.jpg"]

export default function CarouselAutoplay() {
  return (
    <Carousel defaultPlaying interval={3000} loop aria-label="Dishes" className="w-full max-w-[380px]">
      <CarouselViewport>
        <CarouselContent>
          {slides.map((src, i) => (
            <CarouselItem key={src} aria-label={`Dish ${i + 1}`}>
              <img src={src} alt="" draggable={false} className="aspect-video w-full rounded-[12px] bg-muted object-cover" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
      <div className="flex items-center gap-3">
        <CarouselPlayToggle aria-label="Pause or play" />
        <CarouselProgress className="flex-1" />
      </div>
    </Carousel>
  )
}
