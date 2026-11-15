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

/* Painted stand-ins for photos: layered gradients, no network. */
const vignette = "radial-gradient(ellipse at 50% 45%, transparent 55%, rgb(0 0 0 / 0.22))"

const photos = [
  {
    title: "Alfama at dusk",
    place: "Miradouro de Santa Luzia · 19:42",
    scene: [
      vignette,
      "radial-gradient(circle at 72% 40%, oklch(0.95 0.07 85) 0 4.5%, oklch(0.9 0.1 70 / 0.5) 6%, transparent 16%)",
      "repeating-linear-gradient(90deg, transparent 0 7%, oklch(0.4 0.08 38 / 0.6) 7% 7.6%) 0 100% / 100% 36% no-repeat",
      "linear-gradient(transparent 63%, oklch(0.5 0.1 42) 64% 70%, oklch(0.4 0.09 36) 71% 79%, oklch(0.3 0.06 30) 80%)",
      "linear-gradient(oklch(0.58 0.09 295), oklch(0.72 0.1 340) 35%, oklch(0.82 0.11 55) 63%)",
    ].join(", "),
  },
  {
    title: "Tram 28",
    place: "Rua da Conceição · 08:15",
    scene: [
      vignette,
      "repeating-linear-gradient(90deg, oklch(0.88 0.04 220) 0 9%, oklch(0.55 0.06 70) 9% 11%) 50% 44% / 56% 15% no-repeat",
      "linear-gradient(oklch(0.84 0.15 92), oklch(0.76 0.15 85)) 50% 50% / 62% 38% no-repeat",
      "linear-gradient(oklch(0.35 0.03 60), oklch(0.3 0.03 60)) 50% 72% / 62% 4% no-repeat",
      "linear-gradient(90deg, oklch(0.7 0.05 40) 0 14%, transparent 14% 86%, oklch(0.66 0.05 30) 86%)",
      "linear-gradient(oklch(0.9 0.03 75), oklch(0.78 0.04 65) 68%, oklch(0.55 0.02 55) 70%, oklch(0.45 0.02 55))",
    ].join(", "),
  },
  {
    title: "Praça do Comércio",
    place: "Baixa · 11:30",
    scene: [
      vignette,
      "repeating-linear-gradient(90deg, oklch(0.8 0.07 80) 0 6%, oklch(0.62 0.05 70) 6% 8%) 0 62% / 100% 12% no-repeat",
      "linear-gradient(oklch(0.9 0.06 88), oklch(0.84 0.07 82)) 0 50% / 100% 34% no-repeat",
      "linear-gradient(transparent 67%, oklch(0.74 0.03 75) 67%, oklch(0.62 0.03 70))",
      "linear-gradient(oklch(0.66 0.12 245), oklch(0.82 0.07 225) 45%)",
    ].join(", "),
  },
  {
    title: "Belém, low tide",
    place: "Tejo riverside · 15:05",
    scene: [
      vignette,
      "linear-gradient(oklch(0.9 0.03 85), oklch(0.8 0.04 80)) 30% 47% / 7% 36% no-repeat",
      "linear-gradient(oklch(0.7 0.04 80), oklch(0.7 0.04 80)) 30% 27% / 3% 8% no-repeat",
      "linear-gradient(transparent 58%, oklch(0.6 0.08 215) 58%, oklch(0.48 0.08 222) 78%, oklch(0.78 0.05 80) 79%, oklch(0.7 0.05 75))",
      "linear-gradient(oklch(0.8 0.06 235), oklch(0.93 0.03 90) 58%)",
    ].join(", "),
  },
  {
    title: "Sintra in the fog",
    place: "Pena Park · 10:20",
    scene: [
      vignette,
      "radial-gradient(ellipse 60% 40% at 50% 30%, oklch(0.95 0.01 160 / 0.7), transparent)",
      "radial-gradient(ellipse 40% 55% at 22% 95%, oklch(0.38 0.07 150), transparent 70%)",
      "radial-gradient(ellipse 45% 60% at 80% 100%, oklch(0.33 0.06 155), transparent 70%)",
      "radial-gradient(ellipse 30% 35% at 55% 70%, oklch(0.5 0.06 150), transparent 70%)",
      "linear-gradient(oklch(0.88 0.02 160), oklch(0.72 0.04 150) 65%, oklch(0.52 0.05 150))",
    ].join(", "),
  },
]

export default function CarouselDemo() {
  return (
    <div className="w-[420px]">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-semibold tracking-tight">Lisbon</h3>
        <p className="text-[12px] text-muted-foreground tabular-nums">5 photos · May</p>
      </div>
      <p className="mt-1 mb-4 text-[13px] text-muted-foreground">Shared by Inès · 14 to 17 May</p>

      <Carousel aria-label="Photos from Lisbon">
        <CarouselViewport>
          <CarouselContent>
            {photos.map((photo) => (
              <CarouselItem key={photo.title} aria-label={photo.title}>
                <figure>
                  <div
                    role="img"
                    aria-label={photo.title}
                    className="h-[220px] rounded-[14px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]"
                    style={{ background: photo.scene }}
                  />
                  <figcaption className="mt-3 flex items-baseline justify-between gap-4 px-1">
                    <span className="text-[14px] font-medium">{photo.title}</span>
                    <span className="text-[12px] text-muted-foreground tabular-nums">{photo.place}</span>
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
