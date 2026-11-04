"use client"

/* A Claude Code session that installs the Keyframery skill and asks for animations, typed out on a loop while on screen. */

import { CheckIcon, CopyIcon } from "lucide-react"
import * as React from "react"

import { trackCopy } from "@/lib/track-copy"
import { cn } from "@/lib/utils"

type Line = { kind: "you" | "ok" | "info" | "run" | "done"; text: string }

const SCRIPT: Line[] = [
  { kind: "you", text: "/plugin marketplace add keyframery/keyframery" },
  { kind: "ok", text: "Added marketplace keyframery" },
  { kind: "you", text: "/plugin install keyframery@keyframery" },
  { kind: "ok", text: "Installed keyframery · skill ready" },
  { kind: "you", text: "Add animations to my app" },
  { kind: "info", text: "Using the keyframery skill" },
  { kind: "info", text: "components.json found · shadcn/ui on Radix · Next.js" },
  { kind: "run", text: "npx shadcn add @keyframery/cuts" },
  { kind: "ok", text: "Rendered <Cuts /> in app/layout.tsx" },
  { kind: "ok", text: "Inbox and orders lists → ListCut" },
  { kind: "ok", text: "Cart total and order status → ValueCut" },
  { kind: "ok", text: "Dashboard skeleton → LoadCut" },
  { kind: "done", text: "Done. Open any dialog: it now grows from the button you pressed." },
]

const subscribeMotion = (notify: () => void) => {
  const q = matchMedia("(prefers-reduced-motion: reduce)")
  q.addEventListener("change", notify)
  return () => q.removeEventListener("change", notify)
}

export function SkillTerminal() {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduced = React.useSyncExternalStore(subscribeMotion, () => matchMedia("(prefers-reduced-motion: reduce)").matches, () => false)
  const [inView, setInView] = React.useState(false)
  // How many lines are complete, and how much of the next "you" line is typed.
  const [shown, setShown] = React.useState(SCRIPT.length)
  const [typed, setTyped] = React.useState(0)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  React.useEffect(() => {
    if (!inView || reduced) return
    let cancelled = false
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
    const run = async () => {
      while (!cancelled) {
        setShown(0)
        setTyped(0)
        await wait(600)
        for (let i = 0; i < SCRIPT.length && !cancelled; i++) {
          const line = SCRIPT[i]
          if (line.kind === "you") {
            for (let c = 1; c <= line.text.length && !cancelled; c++) {
              setTyped(c)
              await wait(28)
            }
            await wait(350)
          } else {
            await wait(line.kind === "run" ? 700 : line.kind === "done" ? 600 : 380)
          }
          if (cancelled) return
          setShown(i + 1)
          setTyped(0)
        }
        await wait(5200)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [inView, reduced])

  const current = SCRIPT[shown]
  return (
    <div ref={ref} className="overflow-hidden rounded-2xl bg-[#111113] ring-1 ring-white/10 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </span>
        <span className="ml-2 font-mono text-[11.5px] text-white/50">claude · ~/acme-store</span>
      </div>
      <div aria-label="Example Claude Code session" role="img" className="h-[392px] overflow-hidden px-4 py-4 font-mono text-[12.5px] leading-[1.9] sm:px-5">
        {SCRIPT.slice(0, shown).map((l, i) => (
          <TermLine key={i} line={l} />
        ))}
        {current?.kind === "you" && (
          <p className="text-white">
            <span className="text-[#d97757]">›</span> {current.text.slice(0, typed)}
            <span className="lp-caret ml-0.5 text-white/70" />
          </p>
        )}
        {current && current.kind !== "you" && (
          <p className="text-white/35">
            <span className="inline-block animate-pulse">●</span> working…
          </p>
        )}
      </div>
    </div>
  )
}

function TermLine({ line }: { line: Line }) {
  if (line.kind === "you")
    return (
      <p className="mt-2 text-white first:mt-0">
        <span className="text-[#d97757]">›</span> {line.text}
      </p>
    )
  if (line.kind === "run") return <p className="text-white/75"><span className="text-white/40">$</span> {line.text}</p>
  if (line.kind === "info") return <p className="text-white/50">  {line.text}</p>
  if (line.kind === "done") return <p className="mt-1 text-white">✓ {line.text}</p>
  return (
    <p className="text-white/80">
      <span className="text-emerald-400">✓</span> {line.text}
    </p>
  )
}

/** A copyable block of commands, one per line. */
export function CopyLines({ lines, label, className }: { lines: string[]; label: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)
  const [error, setError] = React.useState(false)
  const Icon = copied ? CheckIcon : CopyIcon
  return (
    <div className={cn("relative rounded-xl bg-[var(--lp-card)] ring-1 ring-[var(--lp-line)]", className)}>
      <pre tabIndex={0} className="overflow-x-auto py-3 pr-14 pl-4 font-mono text-[12.5px] leading-7 outline-none focus-visible:ring-2 focus-visible:ring-[var(--cut)]">
        {lines.map((l) => (
          <span key={l} className="block">
            <span aria-hidden="true" className="select-none lp-muted">$ </span>
            {l}
          </span>
        ))}
      </pre>
      <button
        type="button"
        aria-label={copied ? "Copied" : `Copy ${label}`}
        onClick={async () => {
          setCopied(false)
          setError(false)
          try {
            if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable")
            await navigator.clipboard.writeText(lines.join("\n"))
            trackCopy("install_copy", "install-command")
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          } catch {
            setError(true)
          }
        }}
        className="absolute top-2 right-2 grid size-8 place-items-center rounded-md lp-muted outline-none hover:bg-[color-mix(in_oklab,var(--lp-ink)_8%,transparent)] hover:text-[var(--lp-ink)] focus-visible:ring-2 focus-visible:ring-[var(--cut)]"
      >
        <Icon className="size-4" />
      </button>
      <span role="status" className="sr-only">{error ? "Copy failed. Select the commands and copy them manually." : copied ? `Copied ${label}` : ""}</span>
    </div>
  )
}
