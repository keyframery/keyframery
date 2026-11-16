// Several per page
// `slidesPerPage` shows more than one at a time, for product rows and galleries.
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselViewport } from "@/components/ui/carousel"

const items = ["Linen shirt", "Canvas tote", "Wool scarf", "Leather belt", "Cotton cap", "Silk tie"]

export default function CarouselSeveral() {
  return (
    <Carousel slidesPerPage={3} aria-label="Products" className="w-full max-w-[460px]">
      <CarouselViewport>
        <CarouselContent>
          {items.map((name) => (
            <CarouselItem key={name} aria-label={name} className="basis-1/3 pr-2">
              <div className="grid aspect-square place-items-center rounded-[12px] bg-muted p-3 text-center text-[13px] font-medium">{name}</div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </CarouselViewport>
      <div className="flex justify-end gap-2">
        <CarouselPrevious />
        <CarouselNext />
      </div>
    </Carousel>
  )
}
