"use client"

import { ArrowUpRight, Monitor, RotateCw, Smartphone, Tablet } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"

const devices = [
  { value: "desktop", label: "Desktop", hint: "Desktop · 1440px", Icon: Monitor, width: 1440, height: 900 },
  { value: "tablet", label: "Tablet", hint: "Tablet · 834px", Icon: Tablet, width: 834, height: 1000 },
  { value: "mobile", label: "Phone", hint: "Phone · 390px", Icon: Smartphone, width: 390, height: 780 },
] as const

type Device = (typeof devices)[number]["value"]

/**
 * A template running live inside the docs page. The page is drawn at a real screen width and scaled to
 * fit, so the desktop design is what you see even in a narrow column. It is the real page: scroll it,
 * drag things, switch currency.
 */
export function TemplateStage({ slug, name, hint }: { slug: string; name?: string; hint?: string }) {
  const stage = React.useRef<HTMLDivElement>(null)
  const [room, setRoom] = React.useState(0)
  const [device, setDevice] = React.useState<Device>("desktop")
  const [run, setRun] = React.useState(0)

  React.useLayoutEffect(() => {
    const element = stage.current
    if (!element) return
    // On a phone, start with the phone layout: the desktop one would be drawn a quarter of its size.
    if (element.clientWidth < 520) setDevice("mobile")
    const observer = new ResizeObserver(() => setRoom(element.clientWidth))
    observer.observe(element)
    setRoom(element.clientWidth)
    return () => observer.disconnect()
  }, [])

  const { width, height } = devices.find((candidate) => candidate.value === device)!
  // Desktop fills the stage. Tablet and phone keep their own size and only shrink to fit the column.
  const gutter = device === "desktop" ? 0 : 24
  const scale = room ? Math.min(1, (room - gutter * 2) / width) : 1
  const path = `/templates/${slug}`

  return (
    <section id="preview" aria-label="Live preview" className="not-prose my-6 min-w-0 scroll-mt-24">
      <div className="overflow-hidden rounded-xl border bg-background shadow-[0_1px_2px_rgb(0_0_0/0.04),0_24px_48px_-28px_rgb(0_0_0/0.28)]">
        <div className="flex items-center gap-2 border-b px-2.5 py-2">
          <div role="group" aria-label="Screen size" className="flex items-center gap-0.5 rounded-[11px] bg-muted p-1 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.04)]">
            {devices.map(({ value, label, hint, Icon }) => (
              <Button
                key={value}
                variant="ghost"
                size="icon-sm"
                aria-pressed={device === value}
                aria-label={label}
                title={hint}
                onClick={() => setDevice(value)}
                className="size-7 rounded-[8px] text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm dark:aria-pressed:bg-accent"
              >
                <Icon aria-hidden className="size-3.5" />
              </Button>
            ))}
          </div>
          <span className="mx-auto hidden min-w-0 truncate rounded-full bg-muted px-3.5 py-1.5 text-[12px] leading-none text-muted-foreground sm:block">
            keyframery.com{path}
          </span>
          <div className="ms-auto flex items-center gap-1 sm:ms-0">
            <Button variant="ghost" size="icon-sm" aria-label="Load it again from the start" title="Load again" onClick={() => setRun((count) => count + 1)} className="size-7 text-muted-foreground">
              <RotateCw aria-hidden className="size-3.5" />
            </Button>
            <Button variant="default" size="sm" render={<a href={path} target="_blank" rel="noreferrer" />}>
              Open
              <ArrowUpRight aria-hidden />
            </Button>
          </div>
        </div>
        <div ref={stage} className="stage-grid grid place-items-center overflow-hidden" style={{ paddingBlock: gutter, minHeight: 320 }}>
          {room > 0 && (
            <div
              className={device === "desktop" ? "overflow-hidden" : "overflow-hidden rounded-[22px] shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_18px_40px_-18px_rgb(0_0_0/0.35)]"}
              style={{ width: Math.round(width * scale), height: Math.round(height * scale) }}
            >
              <iframe
                key={`${device}-${run}`}
                src={path}
                title={`${name ?? "Template"} live preview`}
                style={{ width, height, border: 0, transform: `scale(${scale})`, transformOrigin: "0 0", display: "block" }}
              />
            </div>
          )}
        </div>
      </div>
      <p className="mt-2.5 text-[12.5px] leading-5 text-muted-foreground">{hint ?? "This is the real page, not a recording. Scroll inside it, drag a line on the ring, tap a face, switch the currency."}</p>
    </section>
  )
}
