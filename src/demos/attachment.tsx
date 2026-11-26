import { FileText, Paperclip, RotateCw } from "lucide-react"
import * as React from "react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentProgress,
  AttachmentRemove,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"

export const meta = { name: "Attachment", group: "AI" }

/* The demo plays itself: a council-tax bill is attached and pops in, its upload line fills and it
   settles as done; then the letter that was too large is removed, and the files after it close the gap. */
export const play = [
  { wait: 900 },
  { click: '[data-play="attach"]', wait: 3400 },
  { click: '[data-file="reference"] [data-action="remove"]', wait: 1800 },
  { click: '[data-play="reset"]', wait: 900 },
]

export const controls = {
  size: { type: "select", label: "Size", options: ["default", "sm", "xs"], default: "default" },
  orientation: { type: "select", label: "Orientation", options: ["horizontal", "vertical"], default: "horizontal" },
  themeFace: { type: "color", label: "File surface", default: "", group: "Colours" },
  themeInk: { type: "color", label: "File text", default: "", group: "Colours" },
  themeMuted: { type: "color", label: "File details", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "File corners", min: 0, max: 32, step: 1, default: 12, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Filename size", min: 10, max: 18, step: 1, default: 13, unit: "px", group: "Layout" },
  themeMediaSize: { type: "slider", label: "Preview size", min: 24, max: 64, step: 1, default: 40, unit: "px", group: "Layout" },
  themeGap: { type: "slider", label: "File gap", min: 0, max: 32, step: 1, default: 10, unit: "px", group: "Layout" },
  themePadding: { type: "slider", label: "File padding", min: 0, max: 16, step: 1, default: 6, unit: "px", group: "Layout" },
} as const

type Status = "idle" | "uploading" | "processing" | "error" | "done"
type Doc = { id: string; name: string; detail: string; status: Status; progress?: number; image?: string }

const initial: Doc[] = [
  { id: "id", name: "passport.jpg", detail: "1.2 MB", status: "done", image: "/demo/face-2.jpg" },
  { id: "payslip", name: "payslip-october.pdf", detail: "182 KB", status: "done" },
  { id: "reference", name: "reference-letter.heic", detail: "24 MB · over the 10 MB limit", status: "error" },
  { id: "bank", name: "bank-statement-q3.pdf", detail: "Not sent yet", status: "idle" },
]

export default function AttachmentDemo({
  size = "default",
  orientation = "horizontal",
  themeFace = "",
  themeInk = "",
  themeMuted = "",
  themeRadius = 12,
  themeFont = 13,
  themeMediaSize = 40,
  themeGap = 10,
  themePadding = 6,
}: {
  size?: "default" | "sm" | "xs"
  orientation?: "horizontal" | "vertical"
  themeFace?: string
  themeInk?: string
  themeMuted?: string
  themeRadius?: number
  themeFont?: number
  themeMediaSize?: number
  themeGap?: number
  themePadding?: number
}) {
  const [docs, setDocs] = React.useState(initial)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const update = (id: string, change: Partial<Doc>) => setDocs((all) => all.map((d) => (d.id === id ? { ...d, ...change } : d)))

  /* A new file: it uploads in steps, then settles as done. */
  const attach = (el: HTMLElement) => {
    if (docs.some((d) => d.id === "tax")) return
    const speed = parseFloat(getComputedStyle(el).getPropertyValue("--kf-speed")) || 1
    setDocs((all) => [...all, { id: "tax", name: "council-tax-bill.pdf", detail: "Uploading · 0%", status: "uploading", progress: 0 }])
    ;[18, 46, 71, 100].forEach((p, i) => {
      timers.current.push(setTimeout(() => update("tax", { progress: p, detail: `Uploading · ${p}%` }), (350 + i * 520) * speed))
    })
    timers.current.push(setTimeout(() => update("tax", { status: "done", detail: "96 KB" }), 2700 * speed))
  }

  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setDocs(initial)
  }

  const vertical = orientation === "vertical"

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--attachment-face": themeFace } : null),
    ...(themeInk ? { "--attachment-ink": themeInk } : null),
    ...(themeMuted ? { "--attachment-muted": themeMuted } : null),
    ...(themeRadius !== 12 ? { "--attachment-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 13 ? { "--attachment-font": `${themeFont}px` } : null),
    ...(themeMediaSize !== 40 ? { "--attachment-media-size": `${themeMediaSize}px` } : null),
    ...(themeGap !== 10 ? { "--attachment-gap": `${themeGap}px` } : null),
    ...(themePadding !== 6 ? { "--attachment-padding": `${themePadding}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[460px]">
      <div className="rounded-[20px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.16)] @max-[26rem]:p-4 dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold tracking-tight">Documents</h3>
            <p className="mt-1 text-[12.5px] text-muted-foreground">Flat 3, 14 Elm Row · application for Dana Whitfield</p>
          </div>
          <Button size="sm" data-play="attach" onClick={(e) => attach(e.currentTarget)}>
            <Paperclip />
            Attach
          </Button>
        </div>

        <AttachmentGroup
          className={
            vertical
              ? "mt-4 -mx-1 items-start"
              : "mt-4 -mx-1 min-h-[298px] flex-col items-stretch overflow-visible [--attachment-collapse-x:0] [--attachment-collapse-y:1] *:data-[slot=attachment]:w-auto"
          }
        >
          {docs.map((doc) => (
            <Attachment
              key={doc.id}
              data-file={doc.id}
              value={doc.id}
              status={doc.status}
              progress={doc.progress}
              size={size}
              orientation={orientation}
              onRemove={(id) => setDocs((all) => all.filter((d) => d.id !== id))}
            >
              <AttachmentMedia variant={doc.image ? "image" : "icon"} className={vertical ? "aspect-[4/3]" : undefined}>
                {doc.image ? <img src={doc.image} alt="" /> : <FileText />}
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{doc.name}</AttachmentTitle>
                <AttachmentDescription>{doc.detail}</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                {doc.status === "error" && (
                  <AttachmentAction aria-label={`Try ${doc.name} again`}>
                    <RotateCw />
                  </AttachmentAction>
                )}
                <AttachmentRemove aria-label={`Remove ${doc.name}`} />
              </AttachmentActions>
              <AttachmentProgress />
            </Attachment>
          ))}
        </AttachmentGroup>
        <button type="button" hidden data-play="reset" onClick={reset} />
      </div>
    </div>
  )
}
