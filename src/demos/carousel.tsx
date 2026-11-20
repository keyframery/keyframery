import * as React from "react"

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

export const controls = {
  orientation: { type: "select", label: "Orientation", default: "horizontal", options: ["horizontal", "vertical"], group: "Behaviour" },
  align: { type: "select", label: "Align", default: "start", options: ["start", "center", "end"], group: "Behaviour" },
  loop: { type: "switch", label: "Loop", default: false, group: "Behaviour" },
  skipSnaps: { type: "switch", label: "Skip snaps", default: false, group: "Behaviour" },
  dragFree: { type: "switch", label: "Drag free", default: false, group: "Behaviour" },
  drag: { type: "switch", label: "Drag", default: true, group: "Behaviour" },
  playing: { type: "switch", label: "Playing", default: false, group: "Behaviour" },
  slidesPerPage: { type: "slider", label: "Slides per page", default: 1, min: 1, max: 2, step: 1 },
  items: { type: "slider", label: "Items", default: 5, min: 1, max: 5, step: 1 },
  title: { type: "text", label: "Title", default: "Coast road" },
  subtitle: { type: "text", label: "Subtitle", default: "Four days, one tank of petrol." },
  shared: { type: "text", label: "Shared", default: "Shared by Dan" },
  photoTitle: { type: "text", label: "Photo title", default: "The cliff path" },
  note: { type: "text", label: "Note", default: "Day 1" },
  width: { type: "slider", label: "Width", default: 420, min: 280, max: 480, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Height", default: 220, min: 140, max: 300, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 12, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 14, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
} as const

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

export default function CarouselDemo({
  orientation = "horizontal",
  align = "start",
  loop = false,
  skipSnaps = false,
  dragFree = false,
  drag = true,
  playing = false,
  slidesPerPage = 1,
  items = 5,
  title = "Coast road",
  subtitle = "Four days, one tank of petrol.",
  shared = "Shared by Dan",
  photoTitle = "The cliff path",
  note = "Day 1",
  width = 420,
  height = 220,
  gap = 12,
  radius = 14,
  face = "",
  ink = "",
}: {
  orientation?: "horizontal" | "vertical"
  align?: "start" | "center" | "end"
  loop?: boolean
  skipSnaps?: boolean
  dragFree?: boolean
  drag?: boolean
  playing?: boolean
  slidesPerPage?: number
  items?: number
  title?: string
  subtitle?: string
  shared?: string
  photoTitle?: string
  note?: string
  width?: number
  height?: number
  gap?: number
  radius?: number
  face?: string
  ink?: string
}) {
  const [rotating, setRotating] = React.useState(playing)
  React.useEffect(() => setRotating(playing), [playing])
  // The first photo loads when the carousel nears the screen; the rest follow it, so no slide arrives empty.
  const firstPhoto = React.useRef<HTMLImageElement>(null)
  const [warm, setWarm] = React.useState(false)
  React.useEffect(() => {
    if (firstPhoto.current?.complete) setWarm(true)
  }, [])
  const theme = {
    "--carousel-gap": `${gap}px`,
    "--carousel-radius": `${radius}px`,
    ...(face ? { "--carousel-face": face } : null),
    ...(ink ? { "--carousel-ink": ink } : null),
  } as React.CSSProperties
  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="text-[12px] text-muted-foreground">{shared}</p>
      </div>
      <p className="mt-1 mb-4 text-[13px] text-muted-foreground">{subtitle}</p>

      <Carousel orientation={orientation} align={align} loop={loop} skipSnaps={skipSnaps} dragFree={dragFree} drag={drag} playing={rotating} onPlayingChange={setRotating} slidesPerPage={slidesPerPage} aria-label="Photos from the coast road">
        <CarouselViewport style={orientation === "vertical" ? { height: (height + 33) * slidesPerPage + gap * (slidesPerPage - 1) } : undefined}>
          <CarouselContent style={orientation === "vertical" ? { height: "100%" } : undefined}>
            {photos.slice(0, items).map((photo, index) => (
              <CarouselItem key={photo.title} aria-label={index === 0 ? photoTitle : photo.title} style={{ ...(slidesPerPage > 1 ? { flexBasis: `calc((100% - ${gap * (slidesPerPage - 1)}px) / ${slidesPerPage})` } : null), ...(orientation === "vertical" ? { height: height + 33 } : null) }}>
                <figure>
                  <img
                    ref={index === 0 ? firstPhoto : undefined}
                    style={{ height, borderRadius: radius }}
                    src={photo.src}
                    alt={photo.title}
                    loading={index === 0 || !warm ? "lazy" : "eager"}
                    decoding="async"
                    onLoad={index === 0 ? () => setWarm(true) : undefined}
                    draggable={false}
                    className="block h-[220px] w-full rounded-[14px] bg-muted object-cover outline outline-1 -outline-offset-1 outline-black/5 dark:outline-white/5"
                  />
                  <figcaption className="mt-3 flex items-baseline justify-between gap-4 px-1">
                    <span className="text-[14px] font-medium">{index === 0 ? photoTitle : photo.title}</span>
                    <span className="text-[12px] text-muted-foreground">{index === 0 ? note : photo.note}</span>
                  </figcaption>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselViewport>
        <CarouselProgress />
        <div className="flex items-center justify-between gap-4">
          <CarouselIndicatorGroup aria-label="Choose a photo">
            {photos.slice(0, Math.ceil(items / slidesPerPage)).map((photo, index) => (
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
