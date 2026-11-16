import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselProgress,
  CarouselViewport,
} from "@/components/ui/carousel"

export const meta = { name: "Carousel", group: "Disclosure" }

/* Pages forward, jumps to the end by its dot, then back to the start. */
export const play = [
  { click: '[data-slot="carousel-next"]', wait: 1500 },
  { click: '[data-slot="carousel-next"]', wait: 1500 },
  { click: '[data-slot="carousel-indicator"]:nth-child(5)', wait: 1800 },
  { click: '[data-slot="carousel-indicator"]:nth-child(1)', wait: 2000 },
]

const photos = [
  { title: "The cliff path", note: "Day 1", src: "/demo/coast-1.jpg" },
  { title: "Weather coming in", note: "Day 1", src: "/demo/coast-2.jpg" },
  { title: "From the lookout", note: "Day 2", src: "/demo/coast-3.jpg" },
  { title: "Low tide, late", note: "Day 3", src: "/demo/coast-4.jpg" },
  { title: "Last swim", note: "Day 4", src: "/demo/coast-5.jpg" },
]

export default function CarouselDemo() {
  return (
    <div className="w-full max-w-[420px]">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-semibold tracking-tight">Coast road</h3>
        <p className="text-[12px] text-muted-foreground">Shared by Dan</p>
      </div>
      <p className="mt-1 mb-4 text-[13px] text-muted-foreground">Four days, one tank of petrol.</p>

      <Carousel aria-label="Photos from the coast road">
        <CarouselViewport>
          <CarouselContent>
            {photos.map((photo) => (
              <CarouselItem key={photo.title} aria-label={photo.title}>
                <figure>
                  <img
                    src={photo.src}
                    alt={photo.title}
                    draggable={false}
                    className="block h-[220px] w-full rounded-[14px] bg-muted object-cover outline outline-1 -outline-offset-1 outline-black/5 dark:outline-white/5"
                  />
                  <figcaption className="mt-3 flex items-baseline justify-between gap-4 px-1">
                    <span className="text-[14px] font-medium">{photo.title}</span>
                    <span className="text-[12px] text-muted-foreground">{photo.note}</span>
                  </figcaption>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselProgress />
        <div className="flex items-center justify-between gap-4">
          <CarouselIndicatorGroup aria-label="Choose a photo">
            {photos.map((photo, index) => (
              <CarouselIndicator key={photo.title} page={index + 1} aria-label={photo.title} />
            ))}
          </CarouselIndicatorGroup>
          <div className="flex gap-2">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </div>
      </Carousel>
    </div>
  )
}
