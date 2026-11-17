import * as React from "react"

import {
  FileInput,
  FileInputDropzone,
  FileInputDropzoneIcon,
  FileInputItem,
  FileInputItemRemove,
  FileInputList,
  FileInputTrigger,
  createFileInputController,
  formatFileSize,
} from "@/components/ui/file-input"

export const controls = {
  multiple: { type: "switch", label: "Multiple", default: true, group: "Behaviour" },
  directory: { type: "switch", label: "Directory", default: false, group: "Behaviour" },
  capture: { type: "select", label: "Capture", default: "off", options: ["off", "camera", "user", "environment"], group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  accept: { type: "text", label: "Accept", default: "image/*" },
  maxFiles: { type: "slider", label: "Max files", default: 8, min: 1, max: 12, step: 1 },
  maxSize: { type: "slider", label: "Max file size (0 = any)", default: 0, min: 0, max: 20, step: 1, unit: "MB" },
  minSize: { type: "slider", label: "Min size", default: 0, min: 0, max: 4000, step: 1, unit: "KB" },
  initialCount: { type: "slider", label: "Initial count", default: 2, min: 0, max: 2, step: 1 },
  title: { type: "text", label: "Title", default: "Wedding photos" },
  dropLabel: { type: "text", label: "Drop label", default: "Drop photos here" },
  trigger: { type: "text", label: "Trigger", default: "Choose photos" },
  album: { type: "text", label: "Album", default: "From your phone" },
  width: { type: "slider", label: "Width", default: 380, min: 280, max: 480, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 12, min: 4, max: 24, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 14, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
} as const

export const meta = { name: "File Input", group: "Forms" }

/* The demo plays itself: clear the list, then pull three photos from a shared album so the
   rows cascade in. Clicks on a remove button that is no longer there do nothing. */
export const play = [
  ...Array.from({ length: 5 }, () => ({ click: '[data-slot="file-input-item-remove"]', wait: 260 })),
  { wait: 600 },
  { click: "[data-album]", wait: 2600 },
]

function photo(name: string, bytes: number) {
  return new File([new Uint8Array(bytes)], name, { type: "image/jpeg" })
}

function ImageIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <rect x="2.25" y="2.75" width="11.5" height="10.5" rx="2" />
      <circle cx="6" cy="6.5" r="1" />
      <path d="m2.75 11.5 3.25-3 2.5 2.25L10.5 9l2.75 2.5" />
    </svg>
  )
}

export default function FileInputDemo({
  multiple = true,
  directory = false,
  capture = "off",
  required = false,
  disabled = false,
  accept = "image/*",
  maxFiles = 8,
  maxSize = 0,
  minSize = 0,
  initialCount = 2,
  title = "Wedding photos",
  dropLabel = "Drop photos here",
  trigger = "Choose photos",
  album = "From your phone",
  width = 380,
  gap = 12,
  radius = 14,
  face = "",
  ink = "",
  accent = "",
}: {
  multiple?: boolean
  directory?: boolean
  capture?: "off" | "camera" | "user" | "environment"
  required?: boolean
  disabled?: boolean
  accept?: string
  maxFiles?: number
  maxSize?: number
  minSize?: number
  initialCount?: number
  title?: string
  dropLabel?: string
  trigger?: string
  album?: string
  width?: number
  gap?: number
  radius?: number
  face?: string
  ink?: string
  accent?: string
}) {
  const theme = {
    "--file-input-gap": `${gap}px`,
    "--file-input-radius": `${radius}px`,
    ...(face ? { "--file-input-face": face } : null),
    ...(ink ? { "--file-input-ink": ink } : null),
    ...(accent ? { "--file-input-accent": accent } : null),
  } as React.CSSProperties
  const [files] = React.useState(createFileInputController)
  const [initial] = React.useState(() => [
    photo("first-dance.jpg", 2_412_000),
    photo("the-cake.jpg", 1_186_000),
  ])
  React.useEffect(() => { files.setValue(initial.slice(0, multiple || directory ? initialCount : Math.min(1, initialCount))) }, [files, initial, initialCount, multiple, directory])
  const addAlbum = () =>
    files.addFiles([
      photo("speeches.jpg", 3_208_000),
      photo("confetti.jpg", 1_744_000),
      photo("last-dance.jpg", 2_655_000),
    ])

  return (
    <div style={{ ...theme, maxWidth: width }} className="flex w-full flex-col gap-4">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">Everyone who was there can add theirs.</p>
      </div>
      <FileInput name="photos" multiple={multiple} directory={directory} capture={capture === "off" ? false : capture === "camera" ? true : capture} required={required} disabled={disabled} accept={accept} maxFiles={maxFiles} maxSize={maxSize ? maxSize * 1000000 : undefined} minSize={minSize * 1000} defaultValue={initial.slice(0, initialCount)} controller={files}>
        <FileInputDropzone>
          {(zone) => (
            <>
              <FileInputDropzoneIcon />
              <p className="font-medium text-foreground">
                {zone.dragReject ? "Photos only" : zone.dragAccept ? "Release to add" : dropLabel}
              </p>
              <p className="mb-3 text-[12px] text-muted-foreground">{accept === "image/*" ? "JPEG, PNG or HEIC" : accept || "Any file type"} · up to {maxFiles} photos</p>
              <div className="flex items-center gap-2">
                <FileInputTrigger>{trigger}</FileInputTrigger>
                <button
                  type="button"
                  disabled={disabled}
                  data-album
                  onClick={addAlbum}
                  className="inline-flex h-8 cursor-pointer items-center rounded-[9px] px-3 text-[13px] leading-none font-medium text-muted-foreground outline-none transition-[color,background-color,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.96] motion-reduce:transition-none"
                >
                  {album}
                </button>
              </div>
            </>
          )}
        </FileInputDropzone>
        <FileInputList aria-label="Photos">
          <FileInputItem>
            {({ file }) => (
              <>
                <span className="grid size-8 shrink-0 place-items-center rounded-[7px] bg-muted text-muted-foreground">
                  <ImageIcon />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="text-[11px] leading-3 text-muted-foreground tabular-nums">
                    {formatFileSize(file.size)}
                  </span>
                </span>
                <FileInputItemRemove />
              </>
            )}
          </FileInputItem>
        </FileInputList>
      </FileInput>
    </div>
  )
}
