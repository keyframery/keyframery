import * as React from "react"

import {
  createImageCropperController,
  ImageCropper,
  ImageCropperFlip,
  ImageCropperGrid,
  ImageCropperHandle,
  ImageCropperImage,
  ImageCropperRotate,
  ImageCropperSelection,
  ImageCropperViewport,
  ImageCropperZoom,
  type ImageCrop,
} from "@/components/ui/image-cropper"

export const meta = { name: "Image Cropper", group: "Media" }

/* The demo plays itself: the selection springs from ratio to ratio, a handle grows under a
   scripted hover, and the crop springs in and out with the zoom. */
export const play = [
  { click: '[data-ratio="square"]', wait: 1500 },
  { click: '[data-ratio="wide"]', wait: 1500 },
  { hover: '[data-position="se"]', wait: 900 },
  { unhover: '[data-position="se"]', wait: 300 },
  { click: '[data-zoom="in"]', wait: 1300 },
  { click: '[data-zoom="in"]', wait: 1300 },
  { click: '[data-zoom="out"]', wait: 1200 },
  { click: '[data-ratio="free"]', wait: 1700 },
]

const photo = "/demo/lake.jpg"

const ratios = [
  { id: "free", label: "Free", value: undefined },
  { id: "square", label: "1:1", value: 1 },
  { id: "wide", label: "16:9", value: 16 / 9 },
] as const

const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const

const well =
  "bg-muted shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]"
const keySurface =
  "bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]"
const ghost =
  "grid size-7 shrink-0 place-items-center rounded-[8px] text-muted-foreground outline-none transition-[scale,color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:text-foreground active:scale-[0.9] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-4">
      <path d={d} />
    </svg>
  )
}

export default function ImageCropperDemo() {
  const [controller] = React.useState(() => createImageCropperController())
  const [ratio, setRatio] = React.useState<(typeof ratios)[number]["id"]>("free")
  const [crop, setCrop] = React.useState<ImageCrop>()
  const [hovered, setHovered] = React.useState<string | null>(null)
  const aspectRatio = ratios.find((r) => r.id === ratio)?.value

  const zoomBy = (step: number) => controller.setZoom(Math.min(3, Math.max(1, controller.getZoom() + step)))

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">Cover photo</h3>
          <p className="mt-1 text-[12px] text-muted-foreground tabular-nums">
            {crop ? `${Math.round(crop.width ?? 0)} × ${Math.round(crop.height ?? 0)} px` : "Loading…"}
          </p>
        </div>
        <div className={`flex gap-0.5 rounded-[11px] p-0.5 ${well}`}>
          {ratios.map((r) => (
            <button
              key={r.id}
              type="button"
              data-ratio={r.id}
              aria-pressed={ratio === r.id}
              onClick={() => setRatio(r.id)}
              className={[
                "h-7 rounded-[9px] px-2.5 text-[12px] leading-none font-medium tabular-nums outline-none transition-[color,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                ratio === r.id ? `${keySurface} text-foreground` : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <ImageCropper
        aria-label="Cover photo"
        src={photo}
        aspectRatio={aspectRatio}
        minWidth={120}
        minHeight={120}
        maxZoom={3}
        controller={controller}
        onCropChange={(next) => setCrop(next)}
      >
        <ImageCropperViewport>
          <ImageCropperImage alt="A wooden jetty on a mountain lake" />
          <ImageCropperSelection>
            <ImageCropperGrid />
            {handles.map((position) => (
              <ImageCropperHandle
                key={position}
                position={position}
                data-hovered={hovered === position || undefined}
                onPointerEnter={() => setHovered(position)}
                onPointerLeave={() => setHovered(null)}
              />
            ))}
          </ImageCropperSelection>
        </ImageCropperViewport>

        <div className="flex items-center gap-2">
          <button type="button" data-zoom="out" aria-label="Zoom out" onClick={() => zoomBy(-0.5)} className={ghost}>
            <Icon d="M4 8h8" />
          </button>
          <ImageCropperZoom className="flex-1" />
          <button type="button" data-zoom="in" aria-label="Zoom in" onClick={() => zoomBy(0.5)} className={ghost}>
            <Icon d="M8 4v8M4 8h8" />
          </button>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <ImageCropperRotate aria-label="Rotate">
            <Icon d="M13 8a5 5 0 1 1-1.5-3.55M13 2.5v2.5h-2.5" />
          </ImageCropperRotate>
          <ImageCropperFlip aria-label="Flip">
            <Icon d="M8 2v12M5.5 4.5 2.5 11.5h3zM10.5 4.5l3 7h-3z" />
          </ImageCropperFlip>
        </div>
      </ImageCropper>
    </div>
  )
}
