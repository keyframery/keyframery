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

export default function FileInputDemo() {
  const [files] = React.useState(createFileInputController)
  const [initial] = React.useState(() => [
    photo("first-dance.jpg", 2_412_000),
    photo("the-cake.jpg", 1_186_000),
  ])
  const addAlbum = () =>
    files.addFiles([
      photo("speeches.jpg", 3_208_000),
      photo("confetti.jpg", 1_744_000),
      photo("last-dance.jpg", 2_655_000),
    ])

  return (
    <div className="flex w-[380px] flex-col gap-4">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight">Wedding photos</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">Everyone who was there can add theirs.</p>
      </div>
      <FileInput name="photos" multiple accept="image/*" maxFiles={8} defaultValue={initial} controller={files}>
        <FileInputDropzone>
          {(zone) => (
            <>
              <FileInputDropzoneIcon />
              <p className="font-medium text-foreground">
                {zone.dragReject ? "Photos only" : zone.dragAccept ? "Release to add" : "Drop photos here"}
              </p>
              <p className="mb-3 text-[12px] text-muted-foreground">JPEG, PNG or HEIC · up to 8 photos</p>
              <div className="flex items-center gap-2">
                <FileInputTrigger>Choose photos</FileInputTrigger>
                <button
                  type="button"
                  data-album
                  onClick={addAlbum}
                  className="inline-flex h-8 cursor-pointer items-center rounded-[9px] px-3 text-[13px] leading-none font-medium text-muted-foreground outline-none transition-[color,background-color,scale] duration-200 ease-pop hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.96] motion-reduce:transition-none"
                >
                  From your phone
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
