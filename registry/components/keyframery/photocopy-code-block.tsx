"use client"

/**
 * PhotocopyCodeBlock: a code block whose copy button photocopies the code. Press copy and the button says Copied at
 * once; then a fine lamp of light reads the code from top to bottom like a copier, each line glowing as it passes, runs
 * back to the top and folds into the button, which now says how many lines you copied. A one-line command is read by a
 * light running across it, straight into the button. Select a few lines and press ⌘C, and a lamp just as wide as your
 * selection reads only those letters, so you see exactly what you copied. Shell prompts never reach the clipboard.
 */

import * as React from "react"
import { AnimatePresence, MotionConfig, animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react"

import { cn } from "@/lib/utils"

const LIGHT = "var(--kf-accent, #3b82f6)"
const TAIL = 36 // px of afterglow the lamp leaves on the lines it has just read
const PACE = 1.05 // ms the lamp spends on each px of code
const READ = { min: 380, max: 680 } // ms: the quickest and slowest read, however short or long the code is
const SWEEP = [0.45, 0, 0.2, 1] as const // the lamp eases off its mark, glides, and settles
const RETURN = 0.18 // s: the lamp running back to the top, dimmed, the way a copier's does
const FOLD = 0.14 // s: the lamp folding into the button
const SETTLE = 1700 // ms the button keeps saying Copied once the lamp is in
const REST = 1 // px: where the lamp waits, just inside the top (or left) edge
const OVERSCAN = 4 // px the lamp reads past the first and last selected rows
const MARGIN = 12 // px the lamp reaches past either side of a selection
const SHELLS = ["sh", "bash", "zsh", "shell", "console", "terminal"]

type Phase = "idle" | "copied" | "failed"
/** A selection: the rows it covers, its sides, and its exact shape as a mask, all in px within the code. */
type Picked = { from: number; to: number; left: number; right: number; mask: string; size: string }

export type PhotocopyCodeBlockProps = {
  /** The code. It's what gets copied, and what's shown when there are no children. */
  code?: string
  /** The code as your highlighter renders it, like Shiki's output. Leave it out to show `code` as plain text. */
  children?: React.ReactNode
  /** A file name or label for the header, like "app/page.tsx". Without one, the button floats in the corner. */
  title?: string
  /** The language, used to spot shell commands and their prompts. */
  language?: string
  /** A prompt to show but never copy, like "$ ". Found on its own in shell code; false turns it off. */
  prompt?: string | false
  /** Runs with the text that went to the clipboard. */
  onCopy?: (text: string) => void
  className?: string
}

export function PhotocopyCodeBlock({ code, children, title, language, prompt, onCopy, className }: PhotocopyCodeBlockProps) {
  const reduce = useReducedMotion() ?? false
  const [phase, setPhase] = React.useState<Phase>("idle")
  const [lines, setLines] = React.useState(() => (code ? count(code) : 0))
  const [tally, setTally] = React.useState(0) // the lines the button reports: 0 until the lamp brings the count in
  const [across, setAcross] = React.useState(false) // the lamp runs left to right, for one-line code
  const [origin, setOrigin] = React.useState(0) // where along the lamp it folds to: the button
  const [span, setSpan] = React.useState<[number, number] | null>(null) // a lamp only as wide as the selection
  const [picked, setPicked] = React.useState<Picked | null>(null)
  const [ready, setReady] = React.useState(false) // the pointer or focus is on the button: the lamp warms up
  const [edges, setEdges] = React.useState<[boolean, boolean]>([false, false]) // code hidden off the left, the right
  const [status, setStatus] = React.useState("")
  const stage = React.useRef<HTMLDivElement>(null)
  const scroller = React.useRef<HTMLDivElement>(null)
  const page = React.useRef<HTMLDivElement>(null) // the code as shown, the full scroll width
  const button = React.useRef<HTMLButtonElement>(null)
  const run = React.useRef(0)
  const settle = React.useRef(0)
  const pos = useMotionValue(REST) // where the lamp is, in px from the top (or the left, running across)
  const glowAt = useMotionValue(REST) // where its light falls: with the lamp as it reads, left behind as it runs back
  const shift = useMotionValue(0) // how far the code is scrolled sideways, so the light lands on the right letters
  const lit = useMotionValue(0) // how brightly the lamp lights the code it reads
  const beam = useMotionValue(0) // how strongly the lamp itself shows
  const warm = useMotionValue(0) // the lamp glowing faintly at its start while the button is pointed at
  const fold = useMotionValue(1) // the lamp folding into the button, 1 to 0
  const glow = useMotionValue(0) // the button taking in the light
  const axis = useMotionValue(0) // 0 reading down, 1 reading across

  const shell = SHELLS.includes(language?.toLowerCase() ?? "") || /^terminal$/i.test(title ?? "")
  const mark = prompt === false ? null : (prompt ?? (shell && code && promptOf(code))) || null
  const single = lines <= 1 && !title

  // Without `code`, the text comes from the code as rendered.
  React.useLayoutEffect(() => {
    if (!code) setLines(count(page.current?.querySelector("[data-code]")?.textContent ?? ""))
  }, [code, children])

  // Long lines fade out at the edge they run off, so it's clear the code scrolls.
  React.useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth
      setEdges((e) => {
        const next: [boolean, boolean] = [el.scrollLeft > 1, max > 1 && el.scrollLeft < max - 1]
        return e[0] === next[0] && e[1] === next[1] ? e : next
      })
    }
    measure()
    el.addEventListener("scroll", measure, { passive: true })
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => {
      el.removeEventListener("scroll", measure)
      observer.disconnect()
    }
  }, [code, children])

  React.useEffect(() => {
    animate(warm, ready && phase === "idle" ? 1 : 0, { duration: ready ? 0.25 : 0.4 })
  }, [ready, phase, warm])

  React.useEffect(() => () => window.clearTimeout(settle.current), [])

  const lamp = useTransform(() => Math.max(beam.get(), warm.get() * 0.3))
  const ring = useTransform(glow, (g) => g * 28)
  const halo = useTransform(glow, (g) => g * 14)
  const glowShadow = useMotionTemplate`0 0 0 1px color-mix(in oklab, ${LIGHT} ${ring}%, transparent), 0 0 16px 2px color-mix(in oklab, ${LIGHT} ${halo}%, transparent)`
  // Only the lines around the lamp are lit: a bright edge where it is, fading over the lines it has just read.
  const litMask = useTransform(() => {
    // Every value is read before anything returns: the mask only follows the values it read last time.
    const on = lit.get()
    const sideways = axis.get() === 1
    const p = glowAt.get() + (sideways ? shift.get() : 0)
    if (on <= 0.001) return "linear-gradient(transparent, transparent)"
    const a = (k: number) => `rgb(0 0 0 / ${(k * on).toFixed(3)})`
    const band = `linear-gradient(to ${sideways ? "right" : "bottom"}, transparent ${p - TAIL}px, ${a(0.22)} ${p - TAIL * 0.55}px, ${a(0.7)} ${p - 8}px, ${a(1)} ${p - 1}px, ${a(1)} ${p + 2}px, transparent ${p + 6}px)`
    return picked ? `${band}, ${picked.mask}` : band
  })

  /** The text that goes to the clipboard: the code, without its prompts. */
  function text() {
    const raw = code ?? page.current?.querySelector("[data-code]")?.textContent ?? ""
    return strip(raw.replace(/\n$/, ""), mark)
  }

  async function copyAll() {
    const value = text()
    try {
      await write(value)
    } catch {
      return fail()
    }
    onCopy?.(value)
    read(null, count(value))
  }

  /** The clipboard is out of reach: select the code, so ⌘C copies it, and say so. */
  function fail() {
    const node = page.current?.querySelector("[data-code]")
    const selection = window.getSelection()
    if (node && selection) {
      const range = document.createRange()
      range.selectNodeContents(node)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    setPhase("failed")
    setStatus(`Copying is blocked here. The code is selected: press ${shortcut()} to copy it.`)
    window.clearTimeout(settle.current)
    settle.current = window.setTimeout(() => setPhase("idle"), 3200)
  }

  /** Copied by hand: the lamp reads just the selection. Prompts in it are left out of the clipboard. */
  function onCopyEvent(event: React.ClipboardEvent) {
    const selection = window.getSelection()
    const node = page.current?.querySelector("[data-code]")
    if (!selection || selection.isCollapsed || !node?.contains(selection.anchorNode)) return
    const raw = selection.toString()
    const value = strip(raw, mark)
    if (value !== raw) {
      event.preventDefault()
      event.clipboardData.setData("text/plain", value)
    }
    onCopy?.(value)
    read(shape(selection.getRangeAt(0)), count(value))
  }

  /** ⌘C with nothing selected copies the whole block. */
  function onKeyDown(event: React.KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c" && window.getSelection()?.isCollapsed !== false) {
      event.preventDefault()
      copyAll()
    }
  }

  /**
   * The button says Copied straight away; then the lamp reads the code (or the selection), runs back, and folds into
   * the button, bringing in the count.
   */
  async function read(selection: Picked | null, copied: number) {
    const token = ++run.current
    window.clearTimeout(settle.current)
    setPhase("copied")
    setTally(0)
    setStatus(copied > 1 ? `Copied ${copied} lines` : "Copied")
    const box = stage.current?.getBoundingClientRect()
    const b = button.current?.getBoundingClientRect()
    if (reduce || !box || !b) {
      setTally(copied)
      settle.current = window.setTimeout(() => setPhase("idle"), SETTLE)
      return
    }
    const sideways = !selection && copied <= 1
    const scrolled = scroller.current?.scrollLeft ?? 0
    // Running across, the light stops where the code ends and the button begins.
    const length = sideways ? (scroller.current?.clientWidth ?? box.width) : box.height
    const from = selection ? Math.max(REST, selection.from) : REST
    const to = selection ? Math.min(length, selection.to) : length
    const sides: [number, number] | null = selection ? [clamp(selection.left - scrolled, 0, box.width), clamp(selection.right - scrolled, 0, box.width)] : null
    const target = sideways ? clamp(b.top + b.height / 2 - box.top, 0, box.height) : clamp(b.left + b.width / 2 - box.left, 0, box.width)
    setAcross(sideways)
    setPicked(selection)
    setSpan(sides)
    setOrigin(target - (sides ? sides[0] : 0))
    axis.jump(sideways ? 1 : 0)
    shift.jump(scrolled)
    pos.jump(from)
    glowAt.jump(from)
    fold.jump(1)
    // The lamp lights up at its mark, reads, and leaves an afterglow on what it read.
    animate(beam, 1, { duration: 0.08 })
    animate(lit, 1, { duration: 0.1 })
    const follow = pos.on("change", (v) => glowAt.set(v))
    await animate(pos, to, { duration: clamp((to - from) * PACE, READ.min, READ.max) / 1000, ease: SWEEP })
    follow()
    if (token !== run.current) return
    animate(lit, 0, { duration: 0.3, ease: "easeOut" })
    if (!sideways) {
      // Back to the top, dimmed, the way a copier's lamp returns, while the afterglow fades where it finished.
      animate(beam, 0.22, { duration: 0.1 })
      await animate(pos, REST, { duration: RETURN, ease: [0.3, 0.7, 0.2, 1] })
      if (token !== run.current) return
      animate(beam, 1, { duration: 0.06 })
    }
    // It folds into the button, which takes in the light and brings in the count.
    await animate(fold, 0, { duration: FOLD, ease: [0.55, 0, 0.8, 0.2] })
    if (token !== run.current) return
    beam.jump(0)
    fold.jump(1)
    pos.jump(REST)
    setTally(copied)
    animate(glow, [0, 1, 0], { duration: 0.38, times: [0, 0.2, 1], ease: "easeOut" })
    settle.current = window.setTimeout(() => setPhase("idle"), SETTLE)
  }

  /** The rows a selection covers, its sides, and its exact shape as a mask, so only the selected letters light up. */
  function shape(range: Range): Picked | null {
    const box = page.current?.getBoundingClientRect()
    const node = page.current?.querySelector("[data-code]")
    if (!box || !node) return null
    const line = parseFloat(getComputedStyle(node).lineHeight) || 23
    const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0.5 && r.height > 0.5)
    if (!rects.length) return null
    const rows = rects.map((r) => ({ x: r.left - box.left - 2, y: r.top - box.top - (line - r.height) / 2, w: r.width + 4, h: line }))
    const w = Math.ceil(box.width)
    const h = Math.ceil(box.height)
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>${rows.map((r) => `<rect x='${r.x.toFixed(1)}' y='${r.y.toFixed(1)}' width='${r.w.toFixed(1)}' height='${r.h.toFixed(1)}' rx='3'/>`).join("")}</svg>`
    return {
      from: Math.min(...rows.map((r) => r.y)) - OVERSCAN,
      to: Math.max(...rows.map((r) => r.y + r.h)) + OVERSCAN,
      left: Math.min(...rows.map((r) => r.x)) - MARGIN,
      right: Math.max(...rows.map((r) => r.x + r.w)) + MARGIN,
      mask: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
      size: `${w}px ${h}px`,
    }
  }

  const label = phase === "copied" ? (tally > 1 ? `Copied ${tally} lines` : "Copied") : phase === "failed" ? `Press ${shortcut()}` : ready ? "Copy" : null
  const rendered = children ?? <Plain code={code ?? ""} mark={mark} />
  const pad = cn("px-5 py-4 font-mono leading-[1.7] whitespace-pre", single && "py-3", !title && !single && "pr-24")
  const fade = edges[0] || edges[1] ? `linear-gradient(to right, ${edges[0] ? "transparent, black 28px" : "black"}, ${edges[1] ? "black calc(100% - 36px), transparent" : "black"})` : undefined

  const copy = (
    <motion.button
      ref={button}
      type="button"
      layout
      onClick={copyAll}
      onPointerEnter={() => setReady(true)}
      onPointerLeave={() => setReady(false)}
      onFocus={(event) => event.currentTarget.matches(":focus-visible") && setReady(true)}
      onBlur={() => setReady(false)}
      aria-label={phase === "copied" ? status : "Copy code"}
      whileTap={{ scale: 0.95 }}
      transition={{ layout: { type: "spring", duration: 0.36, bounce: 0.16 } }}
      style={{ boxShadow: glowShadow, borderRadius: 8 }}
      className={cn(
        "relative z-10 flex h-7 shrink-0 items-center gap-1.5 overflow-hidden px-[7px] text-[12px] font-medium text-muted-foreground outline-none transition-colors duration-200 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        phase === "copied" && "text-foreground",
        phase === "failed" && "text-destructive",
        !title && !single && "absolute top-3 right-3 bg-card/80 ring-1 ring-black/[0.06] backdrop-blur-md dark:bg-[color-mix(in_oklab,var(--card)_70%,transparent)] dark:ring-white/[0.08]",
        (title || single) && "hover:bg-black/[0.045] dark:hover:bg-white/[0.06]",
        single && "mr-2.5",
      )}
    >
      <span className="relative flex size-4 shrink-0 items-center justify-center">
        <AnimatePresence initial={false} mode="popLayout">
          {phase === "copied" ? (
            <motion.svg key="check" viewBox="0 0 16 16" className="size-4" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: LIGHT }} initial={{ opacity: 0, scale: 0.6, filter: "blur(3px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 0.6, filter: "blur(3px)" }} transition={{ type: "spring", duration: 0.3, bounce: 0.25 }}>
              <motion.path d="M3.5 8.6 6.6 11.6 12.6 4.6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.18, ease: "easeOut" }} />
            </motion.svg>
          ) : (
            <motion.svg key="copy" viewBox="0 0 16 16" className="size-4 overflow-visible" fill="none" stroke="currentColor" strokeWidth={1.35} strokeLinecap="round" strokeLinejoin="round" initial={{ opacity: 0, scale: 0.6, filter: "blur(3px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 0.6, filter: "blur(3px)" }} transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}>
              {/* The sheet underneath slides out a touch while you point at it, like a copy about to be made. */}
              <motion.path d="M10.75 3.25V2.9a1.4 1.4 0 0 0-1.4-1.4H3.4A1.4 1.4 0 0 0 2 2.9v5.95a1.4 1.4 0 0 0 1.4 1.4h.35" animate={{ x: ready ? -0.75 : 0, y: ready ? -0.75 : 0 }} transition={{ type: "spring", duration: 0.3, bounce: 0.3 }} />
              <rect x="5.25" y="5.25" width="8.75" height="8.75" rx="1.6" />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
      <AnimatePresence initial={false} mode="popLayout">
        {label && (
          <motion.span key={label} layout="position" className="whitespace-nowrap pr-0.5 tabular-nums" initial={{ opacity: 0, y: 5, filter: "blur(3px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -5, filter: "blur(3px)", transition: { duration: 0.12 } }} transition={{ type: "spring", duration: 0.3, bounce: 0 }}>
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )

  return (
    <MotionConfig reducedMotion="user">
      <figure
        data-cut="none"
        onCopy={onCopyEvent}
        className={cn(
          "group/code relative isolate m-0 w-full min-w-0 overflow-hidden rounded-[12px] bg-card text-[13.5px] shadow-[0_2px_3px_-1px_rgb(0_0_0/0.08),0_1px_0_rgb(25_28_33/0.02)] ring-1 ring-black/[0.07] dark:bg-[color-mix(in_oklab,var(--card)_72%,black)] dark:shadow-[0_1px_2px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.04)] dark:ring-white/[0.08]",
          // The lamp's light: a crisp accent line on a light block, near-white with an accent bloom on a dark one.
          "[--pc-core:color-mix(in_oklab,var(--kf-accent,#3b82f6)_82%,white)] [--pc-hot:color-mix(in_oklab,var(--kf-accent,#3b82f6)_60%,white)] [--pc-ink:var(--kf-accent,#3b82f6)] [--pc-bloom:0_0_3px_color-mix(in_oklab,var(--kf-accent,#3b82f6)_55%,transparent),0_0_10px_1px_color-mix(in_oklab,var(--kf-accent,#3b82f6)_22%,transparent)] [--pc-spill:7%]",
          "dark:[--pc-core:color-mix(in_oklab,var(--kf-accent,#3b82f6)_16%,white)] dark:[--pc-hot:white] dark:[--pc-ink:white] dark:[--pc-bloom:0_0_3px_0.5px_color-mix(in_oklab,var(--kf-accent,#3b82f6)_85%,transparent),0_0_12px_2px_color-mix(in_oklab,var(--kf-accent,#3b82f6)_40%,transparent),0_0_28px_4px_color-mix(in_oklab,var(--kf-accent,#3b82f6)_12%,transparent)] dark:[--pc-spill:12%]",
          className,
        )}
      >
        {title && (
          <figcaption className="flex h-11 items-center gap-2 border-b border-black/[0.06] bg-muted/40 pr-2 pl-4 text-[12.5px] text-muted-foreground dark:border-white/[0.06] dark:bg-white/[0.02]">
            <FileIcon shell={shell} />
            <span className="min-w-0 flex-1 truncate">{title}</span>
            {copy}
          </figcaption>
        )}
        <div ref={stage} className={cn("relative", single && "flex items-center")}>
          <div
            ref={scroller}
            tabIndex={0}
            role="region"
            aria-label={title ? `Code: ${title}` : "Code"}
            onKeyDown={onKeyDown}
            style={fade ? { maskImage: fade, WebkitMaskImage: fade } : undefined}
            className="min-w-0 flex-1 overflow-x-auto rounded-b-[12px] outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-ring)] [scrollbar-width:thin]"
          >
            <div ref={page} className="relative w-max min-w-full">
              <div data-code className={cn(pad, "text-foreground/90 selection:bg-[color-mix(in_oklab,var(--kf-accent,#3b82f6)_22%,transparent)] [&_code]:font-mono [&_pre]:m-0 [&_pre]:bg-transparent! [&_pre]:p-0")}>
                {rendered}
              </div>
              {/* The same code again, lit: shown only where the lamp is and just behind it, softly enough that the
                  colours of the code still read through. */}
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-35 select-none dark:opacity-50"
                style={{
                  maskImage: litMask,
                  WebkitMaskImage: litMask,
                  maskSize: picked ? `100% 100%, ${picked.size}` : "100% 100%",
                  WebkitMaskSize: picked ? `100% 100%, ${picked.size}` : "100% 100%",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  // Only the standard property: Chrome treats the prefixed one as the same, and its old values win.
                  maskComposite: picked ? "intersect" : "add",
                }}
              >
                <div className={cn(pad, "text-(--pc-ink) [text-shadow:0_0_4px_color-mix(in_oklab,var(--kf-accent,#3b82f6)_70%,transparent),0_0_1px_color-mix(in_oklab,var(--kf-accent,#3b82f6)_50%,transparent)] [&_*]:text-(--pc-ink)! [&_pre]:m-0 [&_pre]:bg-transparent! [&_pre]:p-0")}>{rendered}</div>
              </motion.div>
            </div>
          </div>
          {(single || !title) && copy}
          <Lamp across={across} origin={origin} span={span} pos={pos} glowAt={glowAt} lamp={lamp} lit={lit} fold={fold} />
        </div>
        <span role="status" className="sr-only">
          {phase === "copied" || phase === "failed" ? status : ""}
        </span>
      </figure>
    </MotionConfig>
  )
}

/** The copier's lamp: a fine line of light with a soft spill on the code around it. */
function Lamp({ across, origin, span, pos, glowAt, lamp, lit, fold }: { across: boolean; origin: number; span: [number, number] | null; pos: MotionValue<number>; glowAt: MotionValue<number>; lamp: MotionValue<number>; lit: MotionValue<number>; fold: MotionValue<number> }) {
  const at = useTransform(pos, (p) => p - 0.5)
  const spillAt = useTransform(glowAt, (p) => p - 32)
  // Reading a selection, the lamp is only as wide as the selection.
  const sides = !across && span ? { left: span[0], width: Math.max(0, span[1] - span[0]) } : undefined
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-[12px]">
      <motion.div
        className={cn("absolute mix-blend-plus-lighter dark:mix-blend-screen", across ? "inset-y-0 left-0 w-16" : cn("top-0 h-16", !sides && "inset-x-0"))}
        style={{
          ...sides,
          ...(across ? { x: spillAt } : { y: spillAt }),
          opacity: lit,
          background: `linear-gradient(to ${across ? "right" : "bottom"}, transparent, color-mix(in oklab, ${LIGHT} calc(var(--pc-spill) / 2), transparent) 30%, color-mix(in oklab, ${LIGHT} var(--pc-spill), transparent) 50%, color-mix(in oklab, ${LIGHT} calc(var(--pc-spill) / 2), transparent) 70%, transparent)`,
          maskImage: `linear-gradient(to ${across ? "bottom" : "right"}, transparent, black 14%, black 86%, transparent)`,
        }}
      />
      <motion.div
        className={cn("absolute", across ? "inset-y-1.5 left-0 w-px" : cn("top-0 h-px", !sides && "inset-x-0"))}
        style={{
          ...sides,
          ...(across ? { x: at, scaleY: fold, transformOrigin: `50% ${origin}px` } : { y: at, scaleX: fold, transformOrigin: `${origin}px 50%` }),
          opacity: lamp,
        }}
      >
        <div
          className="absolute inset-0 rounded-full [box-shadow:var(--pc-bloom)]"
          style={{ background: `linear-gradient(to ${across ? "bottom" : "right"}, transparent, var(--pc-core) 8%, var(--pc-hot) 50%, var(--pc-core) 92%, transparent)` }}
        />
      </motion.div>
    </div>
  )
}

/** Plain code, line by line. A prompt is shown dimmed and can't be selected, so it never lands in the clipboard. */
function Plain({ code, mark }: { code: string; mark: string | null }) {
  return (
    <code>
      {code
        .replace(/\n$/, "")
        .split("\n")
        .map((line, i) => {
          const prompted = mark && line.startsWith(mark)
          return (
            <span key={i} className="block">
              {prompted && <span className="text-muted-foreground/55 select-none">{mark}</span>}
              {(prompted ? line.slice(mark.length) : line) || " "}
            </span>
          )
        })}
    </code>
  )
}

function FileIcon({ shell }: { shell: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {shell ? (
        <>
          <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="2" />
          <path d="m4.75 6.25 2 1.75-2 1.75M8.5 10h2.75" />
        </>
      ) : (
        <>
          <path d="M9.25 1.75h-4.5a1.5 1.5 0 0 0-1.5 1.5v9.5a1.5 1.5 0 0 0 1.5 1.5h6.5a1.5 1.5 0 0 0 1.5-1.5v-7.5z" />
          <path d="M9.25 1.75v3.5a.5.5 0 0 0 .5.5h3" />
        </>
      )}
    </svg>
  )
}

/** The prompt every command line starts with, like "$ " or "> ", if they all share one. */
function promptOf(code: string) {
  const rows = code.split("\n").filter((l) => l.trim())
  for (const mark of ["$ ", "% ", "> ", "# "]) if (rows.length && rows.every((l) => l.startsWith(mark))) return mark
  return null
}

function strip(text: string, mark: string | null) {
  return mark
    ? text
        .split("\n")
        .map((l) => (l.startsWith(mark) ? l.slice(mark.length) : l))
        .join("\n")
    : text
}

function count(text: string) {
  const trimmed = text.replace(/\n+$/, "")
  return trimmed ? trimmed.split("\n").length : 0
}

async function write(value: string) {
  try {
    await navigator.clipboard.writeText(value)
  } catch {
    // Older browsers, or a page without clipboard access: a hidden field and the old copy command.
    const field = document.createElement("textarea")
    field.value = value
    field.setAttribute("readonly", "")
    field.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none"
    document.body.appendChild(field)
    field.select()
    const ok = document.execCommand("copy")
    field.remove()
    if (!ok) throw new Error("Copy failed")
  }
}

function shortcut() {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘C" : "Ctrl+C"
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)
