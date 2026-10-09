"use client"

import { MousePointerClick } from "lucide-react"
import * as React from "react"

import { useCutsControl } from "@/app/cuts-control"
import { ComponentDemo } from "@/components/docs/demos/coverage"
import { entryOf, MENUS, SPEEDS, snippetsFor, type Choice, type Snippet } from "@/lib/knobs"
import type { Menus } from "@/lib/keyframery/engine"
import { cn } from "@/lib/utils"

/** A component's live demo with what you can change on it: Keyframery or stock, its cut, its speed, and the exact
 *  line to copy for what's picked. A cut goes through the site's one <Cuts />, which is what the same prop does in
 *  your app. Speed and Stock wrap the stage, and the engine carries both onto portaled parts. */
export function Playground({ slug }: { slug: string }) {
  // One per component: moving to another component's page starts fresh instead of keeping this one's picks.
  return <Compact key={slug} slug={slug} />
}

/** The home page's version: the same controls as an inspector beside the stage, each cut with its description. */
export function PlaygroundStudio({ slug }: { slug: string }) {
  return <Studio key={slug} slug={slug} />
}

function usePlayground(slug: string) {
  const entry = entryOf(slug)
  const menu = entry?.menu ? MENUS[entry.menu] : undefined
  const [choice, setChoice] = React.useState<Choice>({ cut: menu?.cuts[0].id, pace: 1, off: false })
  const { setMenus } = useCutsControl()

  // A picked cut applies site-wide, like the prop on <Cuts>. Only this menu is touched, and leaving the page
  // hands it back to the site's default.
  React.useEffect(() => {
    const key = entry?.menu as keyof Menus | undefined
    if (!key) return
    setMenus((m) => ({ ...m, [key]: choice.cut === menu?.cuts[0].id ? undefined : choice.cut }))
    return () => setMenus((m) => ({ ...m, [key]: undefined }))
  }, [choice.cut, entry?.menu, menu, setMenus])

  const set = (patch: Partial<Choice>) => setChoice((c) => ({ ...c, ...patch }))
  const cut = menu?.cuts.find((c) => c.id === choice.cut)
  const caption = !entry ? "" : choice.off ? "shadcn/ui: shadcn's own motion, as it ships." : cut ? `${cut.name}: ${cut.says}` : entry.summary
  return { entry, menu, choice, set, caption, snippets: entry ? snippetsFor(entry, choice) : [] }
}

type Side = "stock" | "kf"

/** One live copy of the demo. The stock side is data-cut="none", which the engine carries onto its portaled parts too. */
function Stage({ slug, side, pace, label, className }: { slug: string; side: Side; pace: number; label?: boolean; className?: string }) {
  return (
    <div
      data-preview-stage={side}
      data-cut={side === "stock" ? "none" : undefined}
      data-cut-pace={side === "stock" || pace === 1 ? undefined : pace}
      className={cn("relative flex min-h-56 min-w-0 flex-wrap items-center justify-center gap-3 p-8", label && "pt-12", className)}
    >
      {label && (
        <p className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border bg-card px-2 py-0.5 text-xs">
          <span aria-hidden="true" className={cn("size-1.5 rounded-full", side === "kf" ? "bg-cut" : "bg-muted-foreground/40")} />
          {side === "kf" ? "With Keyframery" : "shadcn/ui"}
        </p>
      )}
      <ComponentDemo slug={slug} />
    </div>
  )
}

function Code({ snippets, helper }: { snippets: Snippet[]; /** A helper kind's wrapper: the default needs it, not just <Cuts />. */ helper?: string | null }) {
  return snippets.length ? (
    snippets.map((s) => <CodeLine key={s.code} snippet={s} />)
  ) : helper ? (
    <p className="text-sm">
      This is the default once the part that changes is wrapped in <code className="font-mono text-[13px]">{`<${helper}>`}</code>.
    </p>
  ) : (
    <p className="text-sm">
      This is the default. With <code className="font-mono text-[13px]">{"<Cuts />"}</code> in your layout, there&apos;s nothing to add.
    </p>
  )
}

const VIEWS = [
  { id: "both", name: "Both" },
  { id: "kf", name: "Keyframery" },
  { id: "stock", name: "shadcn/ui" },
]

/** The docs' version. It opens side by side: the same demo as shadcn ships it and with Keyframery, so the
 *  difference is in front of you instead of behind a switch. Cut and speed change the Keyframery side. */
function Compact({ slug }: { slug: string }) {
  const { entry, menu, choice, set, caption, snippets } = usePlayground(slug)
  const [view, setView] = React.useState("both")
  if (!entry) return null
  const sides: Side[] = view === "both" ? ["stock", "kf"] : [view as Side]
  return (
    <div data-preview="" data-playground="" className="not-prose my-8 overflow-hidden rounded-xl border bg-card shadow-[0_1px_2px_rgba(16,16,20,0.04),0_16px_40px_-28px_rgba(16,16,20,0.25)]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-2.5 py-2">
        <Segmented
          label="Show"
          value={view}
          onChange={(v) => {
            setView(v)
            set({ off: v === "stock" })
          }}
          options={VIEWS}
          pill
        />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 lg:ml-auto">
          {menu && menu.cuts.length > 1 && <Segmented label="Cut" value={choice.cut ?? ""} disabled={choice.off} onChange={(v) => set({ cut: v })} options={menu.cuts} pill />}
          <Segmented label="Speed" value={String(choice.pace)} disabled={choice.off} onChange={(v) => set({ pace: Number(v) })} options={SPEED} pill />
        </div>
      </div>
      <div className={cn("stage-grid grid", sides.length === 2 && "max-sm:divide-y sm:grid-cols-2 sm:divide-x")}>
        {sides.map((side) => (
          <Stage key={side} slug={slug} side={side} pace={choice.pace} label />
        ))}
      </div>
      <div data-playground-code="" className="grid grid-cols-[minmax(0,1fr)] gap-2.5 border-t px-4 py-3.5">
        {entry.try && (
          <p className="flex items-start gap-2 text-sm">
            <MousePointerClick aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-cut" />
            <span>
              <span className="font-medium">Try it:</span> {entry.try}
              {sides.length === 2 && <span className="text-muted-foreground"> Do it on both sides and compare.</span>}
            </span>
          </p>
        )}
        <p className="text-sm text-muted-foreground">{caption}</p>
        <Code snippets={snippets} helper={entry.kind === "helper" ? entry.part : null} />
      </div>
    </div>
  )
}

function Studio({ slug }: { slug: string }) {
  const { entry, menu, choice, set, snippets } = usePlayground(slug)
  if (!entry) return null
  return (
    <div
      data-preview=""
      data-playground=""
      className="not-prose overflow-hidden rounded-2xl border bg-card shadow-[0_1px_2px_rgba(16,16,20,0.05),0_32px_64px_-32px_rgba(16,16,20,0.28)]"
    >
      <div className="grid md:grid-cols-[300px_minmax(0,1fr)]">
        <div className="grid content-start gap-6 border-t p-5 md:border-t-0 md:border-r">
          <Field label="Motion">
            <Segmented label="Motion" value={choice.off ? "stock" : "kf"} onChange={(v) => set({ off: v === "stock" })} options={MOTION} hideLabel full />
          </Field>
          {menu && menu.cuts.length > 1 && (
            <Field label="Cut">
              <div role="group" aria-label="Cut" className={cn("grid gap-1.5", choice.off && "opacity-50")}>
                {menu.cuts.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={choice.off}
                    aria-pressed={choice.cut === c.id}
                    onClick={() => set({ cut: c.id })}
                    className="grid gap-0.5 rounded-lg border border-transparent px-3 py-2 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none aria-pressed:border-border aria-pressed:bg-muted"
                  >
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className="text-[13px] leading-snug text-muted-foreground">{c.says}</span>
                  </button>
                ))}
              </div>
            </Field>
          )}
          <Field label="Speed">
            <Segmented label="Speed" value={String(choice.pace)} disabled={choice.off} onChange={(v) => set({ pace: Number(v) })} options={SPEED} hideLabel full />
          </Field>
        </div>
        <Stage slug={slug} side={choice.off ? "stock" : "kf"} pace={choice.pace} className="stage-grid min-h-80 max-md:order-first" />
      </div>
      <div data-playground-code="" className="grid grid-cols-[minmax(0,1fr)] gap-2 border-t bg-muted/30 px-5 py-4">
        <Code snippets={snippets} helper={entry.kind === "helper" ? entry.part : null} />
      </div>
    </div>
  )
}

const MOTION = [
  { id: "kf", name: "Keyframery" },
  { id: "stock", name: "Stock" },
]
const SPEED = SPEEDS.map((s) => ({ id: String(s.pace), name: s.name }))

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

function Segmented({
  label,
  value,
  options,
  onChange,
  disabled,
  hideLabel,
  full,
  pill,
}: {
  label: string
  value: string
  options: readonly { id: string; name: string }[]
  onChange: (id: string) => void
  disabled?: boolean
  hideLabel?: boolean
  full?: boolean
  /** The docs toolbar: the options sit in a sunken track, the picked one raised on it. */
  pill?: boolean
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex items-center gap-1",
        full && "rounded-lg bg-muted p-1 [&>button]:flex-1 [&>button[aria-pressed=true]]:bg-card [&>button[aria-pressed=true]]:shadow-xs",
        disabled && "opacity-50",
      )}
    >
      {!hideLabel && <span className={cn("px-1 text-xs text-muted-foreground", !pill && "max-sm:hidden")}>{label}</span>}
      {pill ? (
        <span className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              disabled={disabled}
              aria-pressed={value === o.id}
              onClick={() => onChange(o.id)}
              className="rounded-md px-2.5 py-1 text-[13px] whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-xs"
            >
              {o.name}
            </button>
          ))}
        </span>
      ) : options.map((o) => (
        <button
          key={o.id}
          type="button"
          disabled={disabled}
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-md px-2.5 py-1 text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none aria-pressed:text-foreground",
            full ? "text-sm hover:text-foreground" : "hover:bg-muted aria-pressed:bg-muted",
          )}
        >
          {o.name}
        </button>
      ))}
    </div>
  )
}

/** One line of JSX with its comment, in the GitHub high-contrast colours the site's snippets use (4.5:1 or better). */
function CodeLine({ snippet }: { snippet: Snippet }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <div className="flex items-start gap-2 rounded-lg border bg-card px-3 py-2 font-mono text-[13px] leading-6">
      <pre className="min-w-0 flex-1 overflow-x-auto">
        <span className="text-[#66707b] dark:text-[#bdc4cc]">{`// ${snippet.comment}`}</span>
        {"\n"}
        {highlight(snippet.code)}
      </pre>
      <button
        type="button"
        aria-label={copied ? "Copied" : `Copy: ${snippet.code}`}
        onClick={async () => {
          await navigator.clipboard?.writeText(snippet.code).catch(() => {})
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        }}
        className="shrink-0 rounded-md px-2 py-0.5 font-sans text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  )
}

const TOKEN = /("[^"]*")|(\{[^}]*\})|(<\/?[A-Za-z][\w.]*)|([\w-]+)(?==)/g
const COLOR = ["text-[#032563] dark:text-[#addcff]", "text-[#023b95] dark:text-[#91cbff]", "text-[#024c1a] dark:text-[#72f088]", "text-[#622cbc] dark:text-[#dbb7ff]"]

function highlight(code: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let at = 0
  for (const m of code.matchAll(TOKEN)) {
    if (m.index > at) out.push(code.slice(at, m.index))
    const group = m.slice(1).findIndex(Boolean)
    out.push(
      <span key={m.index} className={COLOR[group]}>
        {m[0]}
      </span>,
    )
    at = m.index + m[0].length
  }
  if (at < code.length) out.push(code.slice(at))
  return out
}
