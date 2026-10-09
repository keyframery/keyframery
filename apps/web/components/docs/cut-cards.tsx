"use client"

/* Every cut a component can take, as a card: a small looping preview of that cut, what it does in plain words,
   and the one line that picks it. The previews stage the real parts inline (same data-slot names and data-cut
   values), so the cut's own CSS and engine play, not a drawing of it. The MDX keeps a Markdown table of the
   same cuts as this component's children, for the Markdown copy of the page; the cards don't render it. */

import { Check, Copy } from "lucide-react"
import * as React from "react"

import { press, useLoop } from "@/components/cuts/loops"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MENUS } from "@/lib/knobs"
import { cn } from "@/lib/utils"

export function CutCards({ menu }: { menu: string; children?: React.ReactNode }) {
  const m = MENUS[menu]
  if (!m) return null
  const single = m.cuts.length === 1
  return (
    <div className={cn("not-prose my-6 grid gap-3", !single && "sm:grid-cols-3")}>
      {m.cuts.map((c, i) => (
        <figure key={c.id} data-cut-card={c.id} className={cn("m-0 min-w-0 overflow-hidden rounded-xl border bg-card", single && "sm:grid sm:grid-cols-2")}>
          <Preview menu={menu} cut={c.id} name={c.name} delay={i * 160} />
          {/* minmax(0, 1fr): the code line otherwise widens the caption past its card. */}
          <figcaption className={cn("grid grid-cols-[minmax(0,1fr)] content-start gap-2 border-t p-4", single && "sm:border-t-0 sm:border-l sm:p-5")}>
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              {c.name}
              {i === 0 && !single && <span className="rounded-full border px-1.5 text-[11px] leading-[18px] font-normal text-muted-foreground">Default</span>}
            </p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{c.says}</p>
            <CopyLine code={`<Cuts ${menu}="${c.id}" />`} />
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

function CopyLine({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <div className="mt-1 flex items-center gap-1 rounded-md border bg-muted/40 py-1 pr-1 pl-2">
      <code className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-foreground" title={code}>
        {code}
      </code>
      <button
        type="button"
        aria-label={copied ? "Copied" : `Copy: ${code}`}
        onClick={async () => {
          await navigator.clipboard?.writeText(code).catch(() => {})
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        }}
        className="grid size-6 shrink-0 place-items-center rounded text-muted-foreground outline-none hover:bg-card hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {copied ? <Check aria-hidden="true" className="size-3.5" /> : <Copy aria-hidden="true" className="size-3.5" />}
      </button>
    </div>
  )
}

type PreviewProps = { cut: string; /** ms after the beat: each card's press lands on its own, never on a neighbour's. */ delay: number }

const PREVIEWS: Record<string, (p: PreviewProps) => React.ReactNode> = {
  dialog: DialogPreview,
  sheet: SheetPreview,
  drawer: DrawerPreview,
  tabs: TabsPreview,
  toast: ToastPreview,
}

function Preview({ menu, cut, name, delay }: { menu: string; cut: string; name: string; delay: number }) {
  const Body = PREVIEWS[menu]
  return Body ? <Body cut={cut} delay={delay} key={`${menu}-${cut}`} /> : <span className="sr-only">{name}</span>
}

/** Opens and closes on a loop. Until the first open nothing is marked closed, so no closing animation plays on load. */
function useOpenLoop(ms: number, delay: number, beforeOpen?: () => void) {
  const [state, setState] = React.useState<"idle" | "open" | "closed">("idle")
  const loop = useLoop(ms, () =>
    window.setTimeout(() => {
      if (state !== "open") beforeOpen?.()
      setState(state === "open" ? "closed" : "open")
    }, delay),
  )
  const attrs = state === "open" ? { "data-open": "" } : state === "closed" ? { "data-closed": "" } : {}
  return { loop, open: state === "open", idle: state === "idle", attrs }
}

/** The little screen a preview plays in. Under reduced motion it holds still until Play is pressed. */
function Screen({
  still,
  playOnce,
  loopRef,
  label,
  children,
  className,
}: {
  still: boolean
  playOnce: () => void
  loopRef: React.Ref<HTMLDivElement>
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="relative">
      <div ref={loopRef} aria-hidden="true" className={cn("stage-grid relative h-40 overflow-hidden", className)}>
        {children}
      </div>
      {still && (
        <button
          type="button"
          aria-label={`Play the ${label} preview`}
          onClick={playOnce}
          className="absolute right-2 bottom-2 rounded-md border bg-card px-2 py-0.5 text-xs outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Play
        </button>
      )}
    </div>
  )
}

/** Lines standing in for text, so a preview reads as a screen without words to read. */
function Lines({ n = 2, className }: { n?: number; className?: string }) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={cn("block h-1.5 rounded-full bg-muted-foreground/25", i === 0 ? "w-4/5" : "w-3/5")} />
      ))}
    </div>
  )
}

function DialogPreview({ cut, delay }: PreviewProps) {
  const trigger = React.useRef<HTMLSpanElement>(null)
  // A rack focus grows out of what was pressed, so its loop presses the little button first. The other cuts don't
  // use the press, and pressing anyway would hand the rack focus a neighbour's button.
  const { loop, open, attrs } = useOpenLoop(1900, delay, cut === "rack-focus" ? () => press(trigger.current) : undefined)
  return (
    <Screen {...loop} loopRef={loop.ref} label="dialog cut" className="grid place-items-center">
      <span ref={trigger} className={cn("absolute bottom-3 left-3 rounded-md border bg-card px-2 py-0.5 text-[11px] transition-colors", open && "bg-muted")}>
        Edit
      </span>
      <div data-slot="dialog-content" data-cut={cut} {...attrs} className={cn("w-40 rounded-lg border bg-popover p-3 shadow-lg", !open && "opacity-0")}>
        <span className="block h-2 w-1/2 rounded-full bg-foreground/70" />
        <Lines className="mt-2.5" />
        <div className="mt-3 flex justify-end gap-1.5">
          <span className="h-3.5 w-8 rounded border" />
          <span className="h-3.5 w-8 rounded bg-foreground/80" />
        </div>
      </div>
    </Screen>
  )
}

function SheetPreview({ cut, delay }: PreviewProps) {
  const { loop, open, idle, attrs } = useOpenLoop(1900, delay)
  return (
    <Screen {...loop} loopRef={loop.ref} label="sheet cut">
      {/* The page behind: only slide-sink steps it back. */}
      <div data-kf-sink={cut === "slide-sink" ? (open ? "on" : "off") : undefined} className="absolute inset-0 bg-card p-4">
        <span className="block h-2 w-1/3 rounded-full bg-foreground/60" />
        <Lines n={3} className="mt-3 w-2/3" />
        <span className="mt-4 block h-10 w-2/3 rounded-md border" />
      </div>
      <div
        data-slot="sheet-content"
        data-side="right"
        data-cut={cut}
        {...attrs}
        className={cn("absolute inset-y-0 right-0 w-[42%] border-l bg-popover p-3 shadow-xl", idle && "invisible")}
      >
        <span className="block h-2 w-2/3 rounded-full bg-foreground/70" />
        <Lines n={3} className="mt-3" />
      </div>
    </Screen>
  )
}

function DrawerPreview() {
  const [open, setOpen] = React.useState(false)
  const loop = useLoop(1900, () => setOpen((o) => !o))
  return (
    <Screen {...loop} loopRef={loop.ref} label="drawer cut">
      <div data-kf-sink={open ? "on" : "off"} className="absolute inset-0 bg-card p-4">
        <span className="block h-2 w-1/3 rounded-full bg-foreground/60" />
        <Lines n={3} className="mt-3 w-2/3" />
      </div>
      {/* shadcn's drawer slides on its own (Vaul); Keyframery adds the page stepping back behind it. */}
      <div
        className="absolute inset-x-3 bottom-0 h-[58%] rounded-t-xl border border-b-0 bg-popover p-3 shadow-xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: open ? "none" : "translateY(105%)" }}
      >
        <span className="mx-auto block h-1 w-8 rounded-full bg-muted-foreground/30" />
        <span className="mt-3 block h-2 w-1/3 rounded-full bg-foreground/70" />
        <Lines className="mt-2.5" />
      </div>
    </Screen>
  )
}

function TabsPreview({ cut, delay }: PreviewProps) {
  const [tab, setTab] = React.useState("a")
  const host = React.useRef<HTMLDivElement>(null)
  const loop = useLoop(1600, () =>
    window.setTimeout(() => {
      const next = tab === "a" ? "b" : "a"
      press(host.current?.querySelector(`[data-value="${next}"]`) ?? null)
      setTab(next)
    }, delay),
  )
  return (
    <Screen {...loop} loopRef={loop.ref} label="tabs cut" className="grid place-items-center px-5">
      <div ref={host} className="w-full">
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))} data-cut={cut}>
          <TabsList className="h-7">
            <TabsTrigger value="a" data-value="a" tabIndex={-1} className="px-2 text-[11px]">
              Account
            </TabsTrigger>
            <TabsTrigger value="b" data-value="b" tabIndex={-1} className="px-2 text-[11px]">
              Billing
            </TabsTrigger>
          </TabsList>
          <TabsContent value="a" className="mt-2 rounded-md border bg-card p-2.5">
            <Lines />
          </TabsContent>
          <TabsContent value="b" className="mt-2 rounded-md border bg-card p-2.5">
            <span className="block h-2 w-1/3 rounded-full bg-foreground/60" />
            <span className="mt-2 block h-6 rounded bg-muted" />
          </TabsContent>
        </Tabs>
      </div>
    </Screen>
  )
}

function ToastPreview() {
  const [shown, setShown] = React.useState(false)
  const loop = useLoop(1900, () => setShown((s) => !s))
  return (
    <Screen {...loop} loopRef={loop.ref} label="toast cut">
      <span className={cn("absolute top-1/2 left-1/2 -translate-1/2 rounded-md border bg-card px-2.5 py-1 text-[11px] transition-colors", shown && "bg-muted")}>Copy link</span>
      {/* Out of the button, then into the corner: the cut-on-action path, drawn in small. */}
      <div
        className="absolute h-8 w-32 rounded-lg border bg-popover px-2.5 py-2 shadow-lg"
        style={{
          left: shown ? "calc(100% - 8.75rem)" : "calc(50% - 4rem)",
          top: shown ? "calc(100% - 2.75rem)" : "calc(50% - 1rem)",
          scale: shown ? "1" : "0.6",
          opacity: shown ? 1 : 0,
          // Leaving, it fades where it stands and only then goes back to the button, unseen.
          transition: shown
            ? "left 520ms cubic-bezier(0.22,1,0.36,1), top 520ms cubic-bezier(0.22,1,0.36,1), scale 520ms cubic-bezier(0.22,1,0.36,1), opacity 160ms"
            : "opacity 200ms, left 0s 200ms, top 0s 200ms, scale 0s 200ms",
        }}
      >
        <span className="block h-1.5 w-3/4 rounded-full bg-foreground/60" />
      </div>
    </Screen>
  )
}
