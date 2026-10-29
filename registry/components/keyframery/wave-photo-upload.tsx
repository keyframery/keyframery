"use client"

/**
 * WavePhotoUpload: a photo upload where the picture is printed by a beam of light. Drop, paste or pick a photo and it
 * falls into a point of light on the bottom edge of the frame. From that point one flowing, wavy beam prints the photo
 * line by line: line one from left to right, then line two, and on down, only as fast as the upload goes. The newest
 * lines are a band of small pixels in the photo's own colours, and right behind them the sharp photo develops. When
 * the last line is in, the band rolls off and the photo glows softly in its own colours. A file it can't take is spat
 * back out of the point. Replace or remove the photo and it sinks back into the point.
 */

import * as React from "react"
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

const LIGHT = "var(--kf-accent, #3b82f6)"
const CELL = 6 // px from one pixel of the print to the next
const PIXEL = 3.4 // px: one pixel, small enough to leave air between them
const BAND = 48 // px behind the line being written that the photo is still pixels
const FEATHER = 22 // px over which the sharp photo takes over from the pixels
const FLIGHT = 320 // ms: how long a pixel takes from the point to its place
const LAND = 220 // ms: a pixel's small flare as it lands
const AMPLITUDE = 7 // px: how far the beam swings either side
const PERIOD = 700 // ms: how often the swing repeats as the beam flows
const MIN_DRAW = 1600 // ms: the quickest a whole photo prints, however fast the upload is
const EXIT = 520 // ms: the band rolling off the bottom once the last line is in
const IDLE_HEIGHT = 232
const TYPES: Record<string, string> = { "image/png": "PNG", "image/jpeg": "JPG", "image/webp": "WebP", "image/gif": "GIF", "image/avif": "AVIF" }

type Phase = "idle" | "drawing" | "done" | "failed"
type RGB = [number, number, number]
type Point = { x: number; y: number }
type Flight = { src: string; from: Point; to: Point; key: number }
type Spit = { label: string; from: Point; to: Point; key: number }
type Palette = { accent: RGB; ink: RGB }

export type WavePhotoUploadHandle = {
  /** Starts with a file you already have, as if it had been dropped. */
  pick: (file: File) => void
  /** Removes the photo. */
  clear: () => void
}

export type WavePhotoUploadProps = {
  /** Sends the file. Call `report` with 0 to 1 as it goes, and throw if it fails. Leave it out to only show the photo. */
  upload?: (file: File, report: (fraction: number) => void, signal: AbortSignal) => Promise<unknown>
  /** Called with the photo once it's in, and with null when it's removed. */
  onChange?: (file: File | null) => void
  /** The file types it takes. */
  accept?: string[]
  /** The largest file it takes, in bytes. */
  maxSize?: number
  /** Keep the frame at one shape (width ÷ height), like 1 for an avatar. By default it takes the photo's shape. */
  aspect?: number
  disabled?: boolean
  className?: string
  ref?: React.Ref<WavePhotoUploadHandle>
}

export function WavePhotoUpload({ upload, onChange, accept = ["image/png", "image/jpeg", "image/webp"], maxSize = 10 * 1024 * 1024, aspect, disabled, className, ref }: WavePhotoUploadProps) {
  const reduce = useReducedMotion() ?? false
  const [phase, setPhase] = React.useState<Phase>("idle")
  const [file, setFile] = React.useState<File | null>(null)
  const [dims, setDims] = React.useState<[number, number] | null>(null)
  const [percent, setPercent] = React.useState(0)
  const [problem, setProblem] = React.useState<string | null>(null)
  const [dragging, setDragging] = React.useState(false)
  const [drawing, setDrawing] = React.useState(false) // the canvas has taken over from the point on the edge
  const [flight, setFlight] = React.useState<Flight | null>(null)
  const [spit, setSpit] = React.useState<Spit | null>(null)
  const [glowing, setGlowing] = React.useState<string | null>(null) // the photo the glow is made from
  const [height, setHeight] = React.useState(IDLE_HEIGHT)
  const [paste, setPaste] = React.useState("⌘V")
  const root = React.useRef<HTMLDivElement>(null)
  const frame = React.useRef<HTMLDivElement>(null)
  const canvas = React.useRef<HTMLCanvasElement>(null)
  const input = React.useRef<HTMLInputElement>(null)
  const printer = React.useRef<Printer | null>(null)
  const job = React.useRef<AbortController | null>(null)
  const photo = React.useRef<string | null>(null) // the object URL of the photo on show
  const over = React.useRef(false) // the pointer is on the component, so a paste goes to it
  const quiet = React.useRef(0) // clears the problem line after a while
  const phaseNow = React.useRef<Phase>("idle")
  const frameHeight = useMotionValue(IDLE_HEIGHT)
  const glow = useMotionValue(0) // the photo's own colours, glowing around the frame
  const sink = useMotionValue(1) // the photo sinking back into the point
  const sinkBlur = useTransform(sink, (v) => `blur(${((1 - v) * 6).toFixed(2)}px)`)
  const names = accept.map((type) => TYPES[type] ?? type.split("/").pop()?.toUpperCase() ?? type)

  React.useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.platform)) setPaste("Ctrl+V")
  }, [])

  React.useEffect(() => {
    phaseNow.current = phase
  }, [phase])

  /** The empty frame: a fixed height, or the given shape at the frame's width. */
  const idleHeight = React.useCallback(() => {
    const w = frame.current?.clientWidth ?? 0
    return aspect && w ? Math.round(clamp(w / aspect, 120, 480)) : IDLE_HEIGHT
  }, [aspect])

  /** Sizes the frame: it springs to a photo's shape, and snaps when it's only being measured. */
  const resize = React.useCallback(
    (h: number, snap = false) => {
      setHeight(h)
      if (snap || reduce) frameHeight.jump(h)
      else animate(frameHeight, h, { type: "spring", duration: 0.55, bounce: 0.1 })
    },
    [frameHeight, reduce],
  )

  React.useLayoutEffect(() => {
    const el = frame.current
    if (!el) return
    // Only a new width re-fits the empty frame. Height changes are the frame's own springs, and answering those would
    // snap a photo's frame back to the empty height before the phase has caught up.
    let width = -1
    const observer = new ResizeObserver(() => {
      if (el.clientWidth === width) return
      width = el.clientWidth
      if (phaseNow.current === "idle") resize(idleHeight(), true)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [idleHeight, resize])

  /** Where a photo comes from: where it was dropped, or the middle of the frame. */
  function origin(at?: Point): Point {
    const box = root.current?.getBoundingClientRect()
    if (at && box) return { x: at.x - box.left, y: at.y - box.top }
    return { x: (frame.current?.clientWidth ?? 400) / 2, y: (frame.current?.clientHeight ?? IDLE_HEIGHT) / 2 }
  }

  /** A file it can't take falls toward the point and is spat back out, and the line below says why. */
  function refuse(next: File, from: Point, message: string) {
    setProblem(message)
    window.clearTimeout(quiet.current)
    quiet.current = window.setTimeout(() => setProblem(null), 4500)
    if (reduce) return
    const width = frame.current?.clientWidth ?? 400
    const key = performance.now()
    setSpit({ label: label(next), from, to: { x: width / 2, y: frame.current?.clientHeight ?? IDLE_HEIGHT }, key })
    window.setTimeout(() => setSpit((s) => (s?.key === key ? null : s)), 950)
  }

  /** Sinks whatever is on the canvas back into the point. */
  async function retract() {
    job.current?.abort()
    const current = printer.current
    if (!current) return
    printer.current = null
    current.halt()
    animate(glow, 0, { duration: 0.35 })
    if (!reduce) await animate(sink, 0, { duration: 0.4, ease: [0.5, 0, 0.75, 0] })
    current.stop()
    wipe(canvas.current)
    sink.jump(1)
    if (photo.current) URL.revokeObjectURL(photo.current)
    photo.current = null
  }

  async function take(next: File, at?: Point) {
    if (disabled) return
    const from = origin(at)
    if (!accept.includes(next.type)) return refuse(next, from, `That's ${describe(next)}. Choose a ${list(names)} photo.`)
    if (next.size > maxSize) return refuse(next, from, `That photo is ${size(next.size)}. The limit is ${size(maxSize)}.`)
    let loaded: { image: HTMLImageElement; url: string }
    try {
      loaded = await load(next)
    } catch {
      return refuse(next, from, "That photo couldn't be opened. Try another one.")
    }
    // A good photo clears an old complaint at once, before the last photo sinks away.
    window.clearTimeout(quiet.current)
    setProblem(null)
    await retract()
    photo.current = loaded.url
    setFile(next)
    setDims([loaded.image.naturalWidth, loaded.image.naturalHeight])
    setPercent(0)
    setDrawing(false)
    setGlowing(loaded.url)
    const width = frame.current?.clientWidth ?? 400
    const h = Math.round(clamp(width / (aspect ?? loaded.image.naturalWidth / loaded.image.naturalHeight), 120, 480))
    resize(h)
    setPhase("drawing")
    if (reduce) return begin(next, loaded.image, width, h)
    // The photo falls into the point on the bottom edge, then the print starts.
    setFlight({ src: loaded.url, from, to: { x: width / 2, y: h }, key: performance.now() })
    window.setTimeout(() => {
      setFlight(null)
      begin(next, loaded.image, width, h)
    }, 520)
  }

  function begin(next: File, image: HTMLImageElement, width: number, h: number) {
    const el = canvas.current
    if (!el) return
    const controller = new AbortController()
    job.current = controller
    const p = new Printer(el, image, width, h, paletteOf(frame.current), reduce)
    printer.current = p
    p.onDone = () => {
      if (controller.signal.aborted) return
      setPhase("done")
      animate(glow, 1, { duration: 0.9 })
      onChange?.(next)
    }
    p.start()
    setDrawing(true)
    const report = (fraction: number) => {
      if (controller.signal.aborted) return
      p.progress = clamp(fraction, 0, 1)
      setPercent(Math.round(p.progress * 100))
      // The colours start to glow around the frame before the print reaches them.
      animate(glow, 0.15 + 0.55 * p.progress, { duration: 0.6 })
    }
    report(0)
    if (!upload) {
      // Nothing to send: the photo prints at its own pace.
      animate(0, 1, { duration: 1.6, ease: "linear", onUpdate: report })
      return
    }
    upload(next, report, controller.signal).then(
      () => report(1),
      () => {
        if (controller.signal.aborted) return
        p.halt()
        animate(glow, 0.2, { duration: 0.4 })
        setPhase("failed")
      },
    )
  }

  async function clear(tell = true) {
    await retract()
    setPhase("idle")
    setDrawing(false)
    setFile(null)
    setDims(null)
    setPercent(0)
    setGlowing(null)
    resize(idleHeight())
    if (tell) onChange?.(null)
  }

  React.useImperativeHandle(ref, () => ({ pick: (f: File) => take(f), clear: () => clear() }))

  // A pasted photo goes in while the pointer or the keyboard is on the component.
  React.useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, [contenteditable='true']")) return
      if (!over.current && !root.current?.contains(document.activeElement)) return
      const pasted = Array.from(event.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"))
      if (!pasted) return
      event.preventDefault()
      take(pasted)
    }
    document.addEventListener("paste", onPaste)
    return () => document.removeEventListener("paste", onPaste)
  })

  React.useEffect(
    () => () => {
      printer.current?.stop()
      job.current?.abort()
      window.clearTimeout(quiet.current)
      if (photo.current) URL.revokeObjectURL(photo.current)
    },
    [],
  )

  const idle = phase === "idle"
  const busy = phase === "drawing"
  const status = problem ?? (busy ? `Uploading ${file?.name}, ${percent}%` : phase === "done" ? `${file?.name} ${upload ? "uploaded" : "added"}` : phase === "failed" ? "The upload stopped" : "")

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={root}
        data-cut="none"
        className={cn("relative isolate flex w-full max-w-[440px] flex-col gap-2.5", className)}
        onPointerEnter={() => (over.current = true)}
        onPointerLeave={() => (over.current = false)}
      >
        {/* The photo's own colours, glowing softly around the frame: a blurred copy of it, behind. */}
        {glowing && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 opacity-40 dark:opacity-80">
            <motion.div className="w-full scale-[1.03] rounded-[16px] bg-cover bg-center blur-2xl brightness-110 saturate-[1.8] dark:brightness-100 dark:saturate-150" style={{ backgroundImage: `url(${glowing})`, opacity: glow, height: frameHeight }} />
          </div>
        )}
        <motion.div
          ref={frame}
          style={{ height: frameHeight }}
          animate={{ scale: dragging ? 1.012 : 1 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
          onDragEnter={(event) => {
            if (!event.dataTransfer.types.includes("Files") || disabled || busy) return
            event.preventDefault()
            setDragging(true)
          }}
          onDragOver={(event) => {
            if (!event.dataTransfer.types.includes("Files") || disabled || busy) return
            event.preventDefault()
            event.dataTransfer.dropEffect = "copy"
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            const dropped = event.dataTransfer.files[0]
            if (dropped && !busy) take(dropped, { x: event.clientX, y: event.clientY })
          }}
          className={cn(
            "group/frame relative w-full overflow-hidden rounded-[16px] bg-card transition-[box-shadow,background-color] duration-300",
            dragging
              ? "shadow-[0_0_0_4px_color-mix(in_oklab,var(--kf-accent,#3b82f6)_12%,transparent),0_12px_28px_-12px_rgb(0_0_0/0.25)] ring-1 ring-[color-mix(in_oklab,var(--kf-accent,#3b82f6)_55%,transparent)]"
              : problem
                ? "shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-destructive)_10%,transparent)] ring-1 ring-destructive/50"
                : "shadow-[0_2px_3px_-1px_rgb(0_0_0/0.08),0_1px_0_0_rgb(25_28_33/0.02)] ring-1 ring-black/8 dark:shadow-[0_1px_2px_rgb(0_0_0/0.5)] dark:ring-white/10",
          )}
        >
          {/* A soft glow from the bottom edge while a photo is dragged over. */}
          <span
            aria-hidden="true"
            className={cn("pointer-events-none absolute inset-0 transition-opacity duration-500", idle && dragging ? "opacity-100" : "opacity-0")}
            style={{ background: `radial-gradient(70% 55% at 50% 100%, color-mix(in oklab, ${LIGHT} 12%, transparent), transparent)` }}
          />
          {/* The photo, printed on a canvas. It dims when an upload stops, leans in a little when you hover it, and sinks
              into the point when it goes. */}
          <div className={cn("absolute inset-x-0 top-0 transition-[opacity,scale] duration-500 ease-out", phase === "failed" && "opacity-55", phase === "done" && "group-hover/frame:scale-[1.015]")}>
            <motion.div style={{ scale: sink, opacity: sink, filter: sinkBlur, transformOrigin: "50% 100%" }}>
              <canvas ref={canvas} aria-hidden="true" className="block" style={{ height }} />
            </motion.div>
          </div>
          {file && !idle && <span role="img" aria-label={`Photo: ${file.name}`} className="pointer-events-none absolute inset-0" />}
          <Source visible={(busy && !drawing) || Boolean(spit)} refusing={Boolean(spit)} />
          <AnimatePresence>
            {idle && (
              <motion.button
                key="choose"
                type="button"
                disabled={disabled}
                onClick={() => input.current?.click()}
                aria-label="Choose a photo, or drop one here"
                className="group absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[inherit] outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.985 }}
              >
                <motion.span
                  className="flex size-11 items-center justify-center rounded-[12px] bg-muted text-muted-foreground ring-1 ring-black/5 transition-colors duration-300 group-hover:text-foreground dark:ring-white/8"
                  animate={{ y: dragging ? 6 : 0, scale: dragging ? 0.92 : 1 }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
                >
                  <svg viewBox="0 0 24 24" className="size-5 transition-[translate] duration-300 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
                    <path d="m4 17 4.5-4.5 3.5 3.5 2.5-2.5L20 18" />
                    <circle cx="15.5" cy="9" r="1.5" className="transition-[translate] duration-300 group-hover:-translate-y-[1.5px]" />
                  </svg>
                </motion.span>
                <span className="flex flex-col items-center gap-1">
                  <span className="text-sm font-medium text-foreground">{dragging ? "Let go to upload" : "Drop a photo here"}</span>
                  <span className={cn("text-[13px] text-muted-foreground transition-opacity duration-200", dragging && "opacity-0")}>
                    or <span className="text-foreground underline decoration-foreground/25 underline-offset-[3px] transition-colors group-hover:decoration-foreground/70">choose one</span>
                  </span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
        {/* The photo you dropped, falling into the point. */}
        <AnimatePresence>
          {flight && (
            <motion.span
              key={flight.key}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 z-10 size-12 rounded-[10px] bg-cover bg-center shadow-[0_8px_20px_-6px_rgb(0_0_0/0.35)] ring-1 ring-black/10"
              style={{ backgroundImage: `url(${flight.src})` }}
              initial={{ x: flight.from.x - 24, y: flight.from.y - 24, scale: 1, opacity: 0 }}
              animate={{ x: flight.to.x - 24, y: flight.to.y - 24, scale: 0.1, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.5, ease: [0.5, 0, 0.75, 0.2], opacity: { duration: 0.5, times: [0, 0.12, 0.82, 1] } }}
            />
          )}
        </AnimatePresence>
        {/* A file it can't take: it drops toward the point and is thrown back out, tumbling away. */}
        <AnimatePresence>
          {spit && (
            <motion.span
              key={spit.key}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 z-10 flex size-12 items-center justify-center rounded-[10px] bg-card text-[10px] font-semibold tracking-wide text-muted-foreground shadow-[0_8px_20px_-6px_rgb(0_0_0/0.3)] ring-1 ring-black/10 dark:ring-white/10"
              animate={{
                x: [spit.from.x - 24, spit.to.x - 24, spit.to.x - 24 + (spit.from.x <= spit.to.x ? -80 : 80)],
                y: [spit.from.y - 24, spit.to.y - 40, spit.to.y - 150],
                scale: [1, 0.6, 0.85],
                rotate: [0, 0, spit.from.x <= spit.to.x ? -28 : 28],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.9, times: [0, 0.4, 1], ease: ["easeIn", [0.2, 0.7, 0.3, 1]] }}
            >
              {spit.label}
            </motion.span>
          )}
        </AnimatePresence>
        <input
          ref={input}
          type="file"
          accept={accept.join(",")}
          tabIndex={-1}
          className="sr-only"
          aria-hidden="true"
          onChange={(event) => {
            const picked = event.target.files?.[0]
            event.target.value = ""
            if (picked) take(picked)
          }}
        />
        <Info
          phase={phase}
          file={file}
          dims={dims}
          percent={percent}
          problem={problem}
          names={names}
          maxSize={maxSize}
          paste={paste}
          uploaded={Boolean(upload)}
          onCancel={() => clear(false)}
          onRetry={() => file && take(file)}
          onReplace={() => input.current?.click()}
          onRemove={() => clear()}
        />
        <p role="status" className="sr-only">
          {status}
        </p>
      </div>
    </MotionConfig>
  )
}

/** The point of light on the bottom edge. It opens as a photo falls into it, and flashes red as it spits a file out. */
function Source({ visible, refusing }: { visible: boolean; refusing: boolean }) {
  const color = refusing ? "var(--color-destructive)" : LIGHT
  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          key="point"
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -mb-[3px] -ml-[3px] size-1.5 rounded-full bg-white"
          style={{ boxShadow: `0 0 0 3px color-mix(in oklab, ${color} 30%, transparent), 0 0 16px 5px color-mix(in oklab, ${color} 40%, transparent)` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={refusing ? { scale: [0, 1, 1.6, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={refusing ? { duration: 0.6, times: [0, 0.4, 0.6, 1], delay: 0.15 } : { type: "spring", duration: 0.35, bounce: 0.3, delay: 0.32 }}
        />
      )}
    </AnimatePresence>
  )
}

/** The line under the frame: what it takes, then the file and its progress, then what you can do with it. */
function Info({ phase, file, dims, percent, problem, names, maxSize, paste, uploaded, onCancel, onRetry, onReplace, onRemove }: { phase: Phase; file: File | null; dims: [number, number] | null; percent: number; problem: string | null; names: string[]; maxSize: number; paste: string; uploaded: boolean; onCancel: () => void; onRetry: () => void; onReplace: () => void; onRemove: () => void }) {
  return (
    <div className="relative h-8 text-[13px]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={problem ? "problem" : phase}
          className="absolute inset-0 flex items-center gap-3"
          initial={{ opacity: 0, y: 4, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -4, filter: "blur(3px)", transition: { duration: 0.15 } }}
          transition={{ type: "spring", duration: 0.35, bounce: 0 }}
        >
          {problem ? (
            <span className="min-w-0 flex-1 truncate text-destructive">{problem}</span>
          ) : phase === "idle" ? (
            <>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {list(names)}, up to {size(maxSize)}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                <kbd className="rounded-[5px] bg-muted px-1.5 py-0.5 font-sans text-[11px] font-medium text-foreground/80">{paste}</kbd> pastes one
              </span>
            </>
          ) : (
            <>
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium text-foreground">{file?.name}</span>
                <span className="text-muted-foreground">
                  {" · "}
                  {file ? size(file.size) : ""}
                  {phase === "done" && dims ? ` · ${dims[0]} × ${dims[1]}` : ""}
                </span>
              </span>
              {phase === "drawing" && (
                <>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    <Roll value={percent} />%
                  </span>
                  <Action onClick={onCancel}>Cancel</Action>
                </>
              )}
              {phase === "failed" && (
                <>
                  <span className="shrink-0 text-destructive">Upload stopped</span>
                  <Action onClick={onRetry}>Try again</Action>
                </>
              )}
              {phase === "done" && (
                <>
                  <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--kf-success, #16a34a)" }} aria-hidden="true">
                      <motion.path d="M3.5 8.5 6.5 11.5 12.5 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.1 }} />
                    </svg>
                    {uploaded ? "Uploaded" : "Added"}
                  </span>
                  <Action onClick={onReplace}>Replace</Action>
                  <Action onClick={onRemove}>Remove</Action>
                </>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/** A number whose changed digits roll up into place. */
function Roll({ value }: { value: number }) {
  const digits = String(value).split("")
  return (
    <span className="inline-flex overflow-hidden align-bottom">
      {digits.map((d, i) => (
        <span key={digits.length - i} className="relative inline-block">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={d}
              className="inline-block"
              initial={{ y: "70%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-70%", opacity: 0 }}
              transition={{ type: "spring", duration: 0.32, bounce: 0 }}
            >
              {d}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}

function Action({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="shrink-0 rounded-[7px] px-2 py-1 text-[12.5px] font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </motion.button>
  )
}

/**
 * Prints a photo onto a canvas from a point on the bottom edge. One wave, a swinging beam of light, runs from the point
 * to the pixel being written, and the photo's pixels ride along it: line one from left to right, then line two, and on
 * down; at the end of a line the beam's tip sweeps back like a carriage return. The newest lines stay a band of small,
 * softly twinkling pixels in the photo's own colours, swelling where the beam's tip is; above the band the sharp photo
 * takes over through a feathered edge, so the real picture arrives the whole way down. Below the line being written is
 * a sparse bed of faint dots. The print only gets as far as `progress` allows and never runs faster than MIN_DRAW;
 * when the last line is in, the band rolls off the bottom.
 */
class Printer {
  progress = 0
  onDone: () => void = () => {}
  private ctx: CanvasRenderingContext2D
  private crisp: HTMLCanvasElement
  private mask: HTMLCanvasElement
  private maskCtx: CanvasRenderingContext2D
  private bed: HTMLCanvasElement
  private sample: Uint8ClampedArray
  private colors: string[]
  private phases: Float32Array // each pixel twinkles on its own beat
  private cols: number
  private rows: number
  private total: number
  private dpr: number
  private sx: number
  private sy: number
  private light: RGB
  private head = 0 // how many pixels have left the point, counted from the top left
  private launched = 0
  private landed = 0
  private sent: Float64Array // when each pixel left the point
  private tip: [number, number] // where the beam ends: the next pixel to land
  private flares: { cell: number; at: number }[] = []
  private last = 0
  private frame = 0
  private halted = false
  private exitAt = 0

  constructor(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    private width: number,
    private height: number,
    palette: Palette,
    private reduce: boolean,
  ) {
    const dpr = (this.dpr = Math.min(window.devicePixelRatio || 1, 2))
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    this.ctx = canvas.getContext("2d")!
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const crop = cover(image.naturalWidth, image.naturalHeight, width, height)
    this.crisp = layer(canvas.width, canvas.height)
    const crispCtx = this.crisp.getContext("2d")!
    crispCtx.imageSmoothingQuality = "high"
    crispCtx.drawImage(image, ...crop, 0, 0, canvas.width, canvas.height)
    this.mask = layer(canvas.width, canvas.height)
    this.maskCtx = this.mask.getContext("2d")!
    this.cols = Math.ceil(width / CELL)
    this.rows = Math.ceil(height / CELL)
    this.total = this.cols * this.rows
    // One colour per pixel: the photo, shrunk to a pixel per cell.
    const small = layer(this.cols, this.rows)
    const smallCtx = small.getContext("2d", { willReadFrequently: true })!
    smallCtx.imageSmoothingQuality = "high"
    smallCtx.drawImage(image, ...crop, 0, 0, this.cols, this.rows)
    this.sample = smallCtx.getImageData(0, 0, this.cols, this.rows).data
    this.colors = Array.from({ length: this.total }, (_, i) => `rgb(${this.sample[i * 4]} ${this.sample[i * 4 + 1]} ${this.sample[i * 4 + 2]})`)
    this.phases = Float32Array.from({ length: this.total }, () => Math.random() * Math.PI * 2)
    // The bed: a faint dot on every other pixel's place, sparse enough to read as paper rather than pattern.
    this.bed = layer(canvas.width, canvas.height)
    const bedCtx = this.bed.getContext("2d")!
    bedCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const [ir, ig, ib] = palette.ink
    bedCtx.fillStyle = `rgb(${ir} ${ig} ${ib} / 0.09)`
    for (let y = CELL; y < height; y += CELL * 2) {
      for (let x = CELL; x < width; x += CELL * 2) {
        bedCtx.beginPath()
        bedCtx.arc(x, y, 0.6, 0, Math.PI * 2)
        bedCtx.fill()
      }
    }
    this.sent = new Float64Array(this.total)
    this.sx = width / 2
    this.sy = height
    this.tip = this.centre(0)
    this.light = palette.accent
  }

  start() {
    this.last = performance.now()
    this.frame = requestAnimationFrame(this.tick)
  }

  /** Stops firing: the upload failed, or the photo is going. Pixels already on their way still land. */
  halt() {
    this.halted = true
  }

  stop() {
    cancelAnimationFrame(this.frame)
  }

  private centre(cell: number): [number, number] {
    return [(cell % this.cols) * CELL + CELL / 2, Math.floor(cell / this.cols) * CELL + CELL / 2]
  }

  private tick = (now: number) => {
    const dt = Math.min(48, now - this.last)
    this.last = now
    if (this.reduce) return this.plain()
    if (!this.halted && !this.exitAt) {
      // The print follows the upload, easing after it, and never runs faster than the quickest print.
      const goal = this.progress >= 1 ? this.total : this.progress * this.total
      const cap = (this.total / MIN_DRAW) * dt
      const step = clamp((goal - this.head) * (1 - Math.exp(-dt / 120)), 0, cap)
      // Easing never quite arrives, so the last pixel would never go: close the final gap outright.
      this.head = goal - this.head - step < 1 ? Math.min(goal, this.head + cap) : this.head + step
      const due = Math.floor(this.head)
      const count = due - this.launched
      // Spread this frame's launches across the frame, so the stream flows instead of pulsing.
      for (let k = 0; this.launched < due; k++) this.sent[this.launched++] = now - dt + ((k + 1) / count) * dt
    }
    // Pixels land in order, each one FLIGHT after it left.
    while (this.landed < this.launched && this.sent[this.landed] + FLIGHT <= now) this.flares.push({ cell: this.landed++, at: now })
    // The beam's tip follows the next pixel to land; across a line break it flicks back.
    const [tx, ty] = this.centre(Math.min(this.total - 1, this.landed))
    const k = 1 - Math.exp(-dt / 24)
    this.tip = [this.tip[0] + (tx - this.tip[0]) * k, this.tip[1] + (ty - this.tip[1]) * k]
    if (!this.exitAt && this.landed >= this.total && this.progress >= 1) this.exitAt = now
    // Where the line being written is; once the last line is in, the band rolls on off the bottom.
    const exit = this.exitAt ? Math.min(1, (now - this.exitAt) / EXIT) : 0
    const front = this.exitAt ? this.height + (BAND + FEATHER) * (1 - Math.pow(1 - exit, 3)) : (this.landed / this.cols) * CELL
    this.draw(now, front)
    if (exit >= 1) return this.onDone()
    if (this.halted && this.landed >= this.launched && !this.flares.length) return
    this.frame = requestAnimationFrame(this.tick)
  }

  /** A point a fraction u along the beam: a gentle wave from the point to the tip, flowing toward the tip. */
  private beam(u: number, now: number): [number, number] {
    const { sx, sy } = this
    const [ex, ey] = this.tip
    const dx = ex - sx
    const dy = ey - sy
    const length = Math.hypot(dx, dy) || 1
    const swing = AMPLITUDE * Math.sin(Math.PI * 3 * u - (now / PERIOD) * Math.PI * 2) * Math.sin(Math.PI * u)
    return [sx + dx * u - (dy / length) * swing, sy + dy * u + (dx / length) * swing]
  }

  private draw(now: number, front: number) {
    const { ctx, width, height, sx, sy, dpr, cols } = this
    const reveal = front - BAND // above this, the sharp photo
    ctx.clearRect(0, 0, width, height)
    // The bed, below the line being written.
    const bedTop = Math.min(height, Math.ceil(front / CELL) * CELL)
    if (bedTop < height) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, bedTop, width, height - bedTop)
      ctx.clip()
      ctx.drawImage(this.bed, 0, 0, width, height)
      ctx.restore()
    }
    // The sharp photo, taking over above the band through a feathered edge.
    if (reveal > -FEATHER / 2) {
      const m = this.maskCtx
      m.globalCompositeOperation = "source-over"
      m.clearRect(0, 0, this.mask.width, this.mask.height)
      m.drawImage(this.crisp, 0, 0)
      m.globalCompositeOperation = "destination-in"
      const edge = m.createLinearGradient(0, (reveal - FEATHER / 2) * dpr, 0, (reveal + FEATHER / 2) * dpr)
      edge.addColorStop(0, "#000")
      edge.addColorStop(1, "rgb(0 0 0 / 0)")
      m.fillStyle = edge
      m.fillRect(0, 0, this.mask.width, this.mask.height)
      m.globalCompositeOperation = "source-over"
      ctx.drawImage(this.mask, 0, 0, width, height)
    }
    // A faint glow over the band, strongest at the line being written.
    if (front < height + BAND) {
      const wash = ctx.createLinearGradient(0, reveal, 0, front + CELL)
      wash.addColorStop(0, this.rgba(0))
      wash.addColorStop(1, this.rgba(0.07))
      ctx.fillStyle = wash
      ctx.fillRect(0, reveal, width, BAND + CELL)
    }
    // The band: the newest lines as small twinkling pixels, fading into the photo as the band moves on, and swelling
    // where the beam's tip is.
    const [tipX] = this.tip
    const firstRow = Math.max(0, Math.floor((reveal - FEATHER / 2) / CELL))
    const lastRow = Math.min(this.rows - 1, Math.floor((front - 0.001) / CELL))
    for (let r = firstRow; r <= lastRow; r++) {
      const y = r * CELL + CELL / 2
      const behind = Math.min(1, Math.max(0, (front - y) / BAND)) // 0 at the line being written, 1 at the band's top
      const toPhoto = clamp((y - (reveal - FEATHER / 2)) / FEATHER, 0, 1) // 0 where the sharp photo has taken over
      if (toPhoto <= 0) continue
      const nearLine = Math.max(0, 1 - (front - y) / (CELL * 3))
      for (let c = 0; c < cols; c++) {
        const cell = r * cols + c
        if (cell >= this.landed) break
        const x = c * CELL + CELL / 2
        const dx = x - tipX
        const swell = nearLine * Math.exp(-(dx * dx) / (2 * 24 * 24))
        const twinkle = 0.72 + 0.28 * Math.sin(now * 0.004 + this.phases[cell])
        const size = PIXEL * (1 + 0.75 * swell)
        ctx.globalAlpha = Math.min(1, ((0.72 - 0.42 * behind) * twinkle + 0.3 * swell) * toPhoto)
        ctx.fillStyle = this.colors[cell]
        ctx.fillRect(x - size / 2, y - size / 2, size, size)
      }
    }
    ctx.globalAlpha = 1
    // Each pixel flares a little brighter as it lands, then settles into the band.
    for (let i = this.flares.length - 1; i >= 0; i--) {
      const f = this.flares[i]
      const t = (now - f.at) / LAND
      if (t >= 1) {
        this.flares[i] = this.flares[this.flares.length - 1]
        this.flares.pop()
        continue
      }
      const [x, y] = this.centre(f.cell)
      const size = PIXEL * (1.7 - 0.7 * t)
      ctx.globalAlpha = 0.9 * (1 - t)
      ctx.fillStyle = this.tint(f.cell, 0.4 + 0.6 * t)
      ctx.fillRect(x - size / 2, y - size / 2, size, size)
    }
    ctx.globalAlpha = 1
    const writing = !this.exitAt && this.landed < this.total && !(this.halted && this.landed >= this.launched)
    if (!writing) return
    // The wave: a soft glow under a fine line, brighter toward the tip.
    const gradient = ctx.createLinearGradient(sx, sy, this.tip[0], this.tip[1])
    gradient.addColorStop(0, this.rgba(0.25))
    gradient.addColorStop(1, this.rgba(0.85))
    for (const [line, alpha] of [[6, 0.12], [1.4, 1]] as const) {
      ctx.beginPath()
      for (let i = 0; i <= 48; i++) {
        const [x, y] = this.beam(i / 48, now)
        if (i) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      }
      ctx.globalAlpha = alpha
      ctx.lineWidth = line
      ctx.lineJoin = "round"
      ctx.strokeStyle = gradient
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    // The pixels riding it: light as they leave, their own colour as they arrive. A share of them is enough to read
    // as a stream.
    const flying = this.launched - this.landed
    const every = flying > 240 ? 6 : flying > 120 ? 4 : flying > 50 ? 3 : 2
    for (let c = this.landed; c < this.launched; c += every) {
      const u = Math.min(1, (now - this.sent[c]) / FLIGHT)
      if (u <= 0) continue
      const [x, y] = this.beam(1 - Math.pow(1 - u, 2), now)
      ctx.globalAlpha = 0.4 + 0.5 * u
      ctx.fillStyle = this.tint(c, u * u)
      ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6)
    }
    ctx.globalAlpha = 1
    // The tip, and the point the wave comes from.
    const [hx, hy] = this.tip
    const tip = ctx.createRadialGradient(hx, hy, 0, hx, hy, 12)
    tip.addColorStop(0, this.rgba(0.45))
    tip.addColorStop(1, this.rgba(0))
    ctx.fillStyle = tip
    ctx.fillRect(hx - 12, hy - 12, 24, 24)
    const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, 22)
    halo.addColorStop(0, this.rgba(0.45))
    halo.addColorStop(1, this.rgba(0))
    ctx.fillStyle = halo
    ctx.fillRect(sx - 22, sy - 22, 44, 22)
    ctx.fillStyle = "#fff"
    ctx.beginPath()
    ctx.arc(sx, sy - 0.5, 2.4, 0, Math.PI * 2)
    ctx.fill()
  }

  /** With reduced motion: the photo fades in as it uploads, with nothing moving. */
  private plain() {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)
    ctx.globalAlpha = this.progress
    ctx.drawImage(this.crisp, 0, 0, this.width, this.height)
    ctx.globalAlpha = 1
    if (this.progress >= 1) return this.onDone()
    if (!this.halted) this.frame = requestAnimationFrame(this.tick)
  }

  private rgba(alpha: number) {
    const [r, g, b] = this.light
    return `rgb(${r} ${g} ${b} / ${alpha.toFixed(3)})`
  }

  /** A pixel on its way: light at first, its own colour by the time it lands (k from 0 to 1). */
  private tint(cell: number, k: number) {
    const [lr, lg, lb] = this.light
    const i = cell * 4
    const from = [lr + (255 - lr) * 0.55, lg + (255 - lg) * 0.55, lb + (255 - lb) * 0.55]
    return `rgb(${Math.round(from[0] + (this.sample[i] - from[0]) * k)} ${Math.round(from[1] + (this.sample[i + 1] - from[1]) * k)} ${Math.round(from[2] + (this.sample[i + 2] - from[2]) * k)})`
  }
}

function layer(width: number, height: number) {
  const c = document.createElement("canvas")
  c.width = width
  c.height = height
  return c
}

/** The part of an image that covers a box of this shape, cropped from the middle. */
function cover(iw: number, ih: number, w: number, h: number): [number, number, number, number] {
  const scale = Math.max(w / iw, h / ih)
  const sw = w / scale
  const sh = h / scale
  return [(iw - sw) / 2, (ih - sh) / 2, sw, sh]
}

function load(file: File) {
  return new Promise<{ image: HTMLImageElement; url: string }>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => resolve({ image, url })
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("unreadable"))
    }
    image.src = url
  })
}

function wipe(el: HTMLCanvasElement | null) {
  el?.getContext("2d")?.clearRect(0, 0, el.width, el.height)
}

/** The colours the print needs, as the browser resolves them on this frame: the light, and the ink for the bed. */
function paletteOf(el: HTMLElement | null): Palette {
  const resolve = (css: string, fallback: string) => {
    if (!el) return fallback
    const probe = document.createElement("span")
    probe.style.color = css
    el.appendChild(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  }
  return {
    accent: rgbOf(resolve(LIGHT, "#3b82f6")),
    ink: rgbOf(resolve("var(--color-foreground, #111)", "#111")),
  }
}

/** Any CSS colour as plain red, green and blue, by painting it on a one-pixel canvas. */
function rgbOf(color: string): RGB {
  const ctx = layer(1, 1).getContext("2d", { willReadFrequently: true })!
  ctx.fillStyle = "#3b82f6"
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

/** What a refused file shows as it's spat out: its extension, or FILE. */
function label(file: File) {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : ""
  return (ext || "file").slice(0, 4).toUpperCase()
}

function describe(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase()
  if (file.type === "application/pdf") return "a PDF"
  if (file.type.startsWith("video/")) return "a video"
  if (file.type === "image/heic" || ext === "heic") return "a HEIC photo"
  if (file.type === "image/svg+xml") return "an SVG"
  return ext && ext !== file.name.toLowerCase() ? `a .${ext} file` : "not a photo"
}

function list(items: string[]) {
  return items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} or ${items.at(-1)}`
}

function size(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
