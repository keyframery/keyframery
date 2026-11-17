import * as React from "react"

import { AspectRatio, AspectRatioImage } from "@/components/ui/aspect-ratio"

export const meta = { name: "Aspect Ratio", group: "Media" }

/* The demo plays itself: each thumbnail swaps the big photo, which fades up out of a blur once it
   has loaded; the frame keeps its shape the whole time. */
export const play = [
  { click: '[data-photo="2"]', wait: 1900 },
  { click: '[data-photo="4"]', wait: 1900 },
  { click: '[data-photo="1"]', wait: 1900 },
  { click: '[data-photo="0"]', wait: 1900 },
]

export const controls = {
  ratio: { type: "select", label: "Ratio", options: ["16:10", "4:3", "1:1"], default: "16:10" },
  thumbnails: { type: "slider", label: "Thumbnails", min: 3, max: 5, step: 1, default: 5 },
  themeFace: { type: "color", label: "Frame surface", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Frame corners", min: 0, max: 32, step: 1, default: 14, unit: "px", group: "Layout" },
  themeFit: { type: "select", label: "Image fit", options: ["cover", "contain", "fill"], default: "cover", group: "Image" },
  themePositionX: { type: "slider", label: "Horizontal crop", min: 0, max: 100, step: 1, default: 50, unit: "%", group: "Layout" },
  themePositionY: { type: "slider", label: "Vertical crop", min: 0, max: 100, step: 1, default: 50, unit: "%", group: "Layout" },
  themeSaturation: { type: "slider", label: "Saturation", min: 0, max: 2, step: 0.1, default: 1, unit: "", group: "Layout" },
  themeContrast: { type: "slider", label: "Contrast", min: 0.5, max: 1.5, step: 0.1, default: 1, unit: "", group: "Layout" },
  themeBrightness: { type: "slider", label: "Brightness", min: 0.5, max: 1.5, step: 0.1, default: 1, unit: "", group: "Layout" },
} as const

const photos = [
  { src: "/demo/coast-1.jpg", alt: "The cove below the cottage at low tide" },
  { src: "/demo/coast-2.jpg", alt: "Cliffs along the coast path toward Logan Rock" },
  { src: "/demo/coast-4.jpg", alt: "Porthcurno beach from the headland" },
  { src: "/demo/coast-5.jpg", alt: "Evening light over the bay" },
  { src: "/demo/lake.jpg", alt: "The lake a short drive inland" },
]

const ratios = { "16:10": 16 / 10, "4:3": 4 / 3, "1:1": 1 }

export default function AspectRatioDemo({
  ratio = "16:10",
  thumbnails = 5,
  themeFace = "",
  themeRadius = 14,
  themeFit = "cover",
  themePositionX = 50,
  themePositionY = 50,
  themeSaturation = 1,
  themeContrast = 1,
  themeBrightness = 1,
}: {
  ratio?: "16:10" | "4:3" | "1:1"
  thumbnails?: number
  themeFace?: string
  themeRadius?: number
  themeFit?: "cover" | "contain" | "fill"
  themePositionX?: number
  themePositionY?: number
  themeSaturation?: number
  themeContrast?: number
  themeBrightness?: number
}) {
  const [current, setCurrent] = React.useState(0)
  const shown = photos.slice(0, thumbnails)
  const photo = photos[Math.min(current, shown.length - 1)]

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--aspect-ratio-face": themeFace } : null),
    ...(themeRadius !== 14 ? { "--aspect-ratio-radius": `${themeRadius}px` } : null),
    ...(themeFit !== "cover" ? { "--aspect-ratio-fit": themeFit } : null),
    ...(themePositionX !== 50 ? { "--aspect-ratio-position-x": `${themePositionX}%` } : null),
    ...(themePositionY !== 50 ? { "--aspect-ratio-position-y": `${themePositionY}%` } : null),
    ...(themeSaturation !== 1 ? { "--aspect-ratio-saturation": `${themeSaturation}` } : null),
    ...(themeContrast !== 1 ? { "--aspect-ratio-contrast": `${themeContrast}` } : null),
    ...(themeBrightness !== 1 ? { "--aspect-ratio-brightness": `${themeBrightness}` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[420px]">
      <AspectRatio ratio={ratios[ratio]}>
        <AspectRatioImage src={photo.src} alt={photo.alt} />
        <span className="absolute top-3 right-3 rounded-full bg-black/45 px-2 py-1 text-[11px] leading-none font-medium text-white tabular-nums backdrop-blur-md">
          {Math.min(current, shown.length - 1) + 1} / {shown.length}
        </span>
      </AspectRatio>

      <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${shown.length}, minmax(0, 1fr))` }}>
        {shown.map((p, i) => (
          <button
            key={p.src}
            type="button"
            data-photo={i}
            aria-label={`Show photo ${i + 1}`}
            aria-current={i === current || undefined}
            onClick={() => setCurrent(i)}
            className="cursor-pointer rounded-[10px] opacity-60 outline-none transition-[opacity,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.94] aria-current:opacity-100 motion-reduce:transition-none"
          >
            <AspectRatio ratio={1} className="rounded-[10px]">
              <AspectRatioImage src={p.src} />
            </AspectRatio>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 @[340px]:flex-row @[340px]:items-baseline @[340px]:justify-between">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold tracking-tight">Cliff cottage above Porthcurno</div>
          <div className="mt-1 text-[12px] text-muted-foreground">Cornwall · 2 bedrooms · sleeps 4</div>
        </div>
        <div className="shrink-0 text-[13px] text-muted-foreground tabular-nums">
          <span className="font-semibold text-foreground">£186</span> night
        </div>
      </div>
    </div>
  )
}
