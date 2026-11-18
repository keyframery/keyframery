"use client"

import { bindPersistentLayer } from "@ui-sdk/core"
import type { AgentComponent } from "@ui-sdk/react/agent"
import { Check, Copy, CornerDownLeft, RefreshCw, X } from "lucide-react"
import * as React from "react"
import { createPortal } from "react-dom"

import { callText, facts, hasChoices, kindWords, plans, shownText, type ActionPlan, type Choice } from "@/components/agent-describe"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { elementForRef } from "@/lib/agent-preview"
import { useAgentPreview } from "@/lib/use-agent-preview"
import { cn } from "@/lib/utils"

/* UI SDK swallows the first click outside an open menu or dialog, so a demo that has its menu
   open would eat the click on the Agent view switch. Marking the bar and the inspector as
   persistent layers (UI SDK's own API, used by toast regions) lets those clicks through and
   leaves the demo's popup open for inspection. */
function usePersistentLayer(ref: React.RefObject<HTMLElement | null>, active = true) {
  React.useEffect(() => {
    const el = ref.current
    if (!el || !active) return
    return bindPersistentLayer(el)
  }, [ref, active])
}

/* The component and its agent-readable state share one canvas. Inspector controls stay outside
   that canvas and are hidden from the bridge, so a panel never describes its own controls. */
export function AgentPreview({ children, className, label = "this preview", defaultEnabled = false }: {
  children: React.ReactNode
  className?: string
  label?: string
  /** Docs playgrounds start with the inspector closed; a showcase may open it on arrival. */
  defaultEnabled?: boolean
}) {
  const scope = React.useRef<HTMLDivElement>(null)
  const bar = React.useRef<HTMLDivElement>(null)
  const layout = React.useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = React.useState(defaultEnabled)
  const turnedOn = React.useRef(false)
  const inspectorId = React.useId()
  usePersistentLayer(bar)

  const toggle = (next: boolean) => {
    setEnabled(next)
    if (!next) return
    turnedOn.current = true
    /* Reading a snapshot that the demo keeps changing is hopeless: hand the demo to the visitor. */
    scope.current?.dispatchEvent(new CustomEvent("keyframery:agent-action", { bubbles: true }))
  }

  /* On a phone the inspector stacks under the preview. Bring its top into view so turning the
     switch on visibly does something, while the preview's foot stays on screen above it. */
  React.useEffect(() => {
    if (!enabled || !turnedOn.current) return
    turnedOn.current = false
    const frame = requestAnimationFrame(() => {
      const aside = document.getElementById(inspectorId)
      if (!aside || !layout.current || layout.current.offsetWidth >= 720) return
      const top = aside.getBoundingClientRect().top
      if (top < window.innerHeight * 0.7) return
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      window.scrollBy({ top: top - window.innerHeight * 0.4, behavior: smooth ? "smooth" : "auto" })
    })
    return () => cancelAnimationFrame(frame)
  }, [enabled, inspectorId])

  return (
    <div ref={layout} data-agent-preview-layout className={cn("@container/agent-preview min-w-0", className)}>
      <div ref={bar} data-agent-hidden className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-4 py-2">
        <p className="min-w-0 truncate text-[12px] text-muted-foreground">
          {enabled
            ? <><span className="@[560px]/agent-preview:hidden">Tap a name to find it.</span><span className="hidden @[560px]/agent-preview:inline">Hover a part to find it in the preview.</span></>
            : <><span className="@[560px]/agent-preview:hidden">See it as an AI agent does.</span><span className="hidden @[560px]/agent-preview:inline">See this component the way an AI agent does.</span></>}
        </p>
        <label className="relative inline-flex shrink-0 cursor-pointer items-center gap-2.5 rounded-[9px] border border-foreground/30 bg-muted/70 px-2 py-1 text-[12px] font-medium text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--background)_75%,transparent),0_1px_2px_color-mix(in_oklab,var(--foreground)_8%,transparent)] hover:border-foreground/45 hover:bg-muted before:pointer-events-none before:absolute before:-top-px before:-start-px before:size-[8px] before:rounded-ss-[9px] before:border-s before:border-t before:border-foreground/65 after:pointer-events-none after:absolute after:-end-px after:-bottom-px after:size-[8px] after:rounded-ee-[9px] after:border-e after:border-b after:border-foreground/65">
          Agent view
          <Switch aria-label={`Agent view for ${label}`} aria-controls={enabled ? inspectorId : undefined}
            checked={enabled} onCheckedChange={toggle} className="[--switch-width:32px] [--switch-height:20px] [--switch-thumb-size:16px]" />
        </label>
      </div>
      <div className={cn("grid min-w-0 items-stretch", enabled && "@[720px]/agent-preview:grid-cols-[minmax(0,1fr)_320px]")}>
        <div ref={scope} data-agent-preview-canvas className="min-w-0">{children}</div>
        {enabled && <AgentInspector id={inspectorId} scope={scope} label={label} />}
      </div>
    </div>
  )
}

function json(value: unknown) {
  try { return JSON.stringify(value, null, 2) ?? "null" }
  catch { return String(value) }
}

/* UI SDK can register a field by its label. Outline the label together with the control it
   names, so a select shows its trigger and not only the word above it. */
function partsOf(node: HTMLElement) {
  const parts = [node]
  const doc = node.ownerDocument
  if (node instanceof HTMLLabelElement && node.control) parts.push(node.control)
  if (node.id) {
    /* The control, not a popup that borrows the same label (a select's open list). */
    const named = [...doc.querySelectorAll<HTMLElement>(`[aria-labelledby~="${CSS.escape(node.id)}"]`)]
      .find((el) => !node.contains(el) && !el.matches('[role="listbox"], [role="menu"], [role="dialog"], [role="alertdialog"], [role="tree"], [role="grid"], [popover]') && !el.closest("[popover]"))
    if (named) parts.push(named)
  }
  return parts
}

/* Hidden while something else (a sticky header, another layer) sits over the part. The outline
   itself takes no pointer, so hit-testing sees through it. */
function uncovered(parts: HTMLElement[]) {
  return parts.some((part) => {
    const r = part.getBoundingClientRect()
    const hit = part.ownerDocument.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return !!hit && (part.contains(hit) || hit.contains(part))
  })
}

/* An outline over the part a row describes, drawn in the top layer so it also sits over a demo's
   open popup. It follows the element while shown and never takes the pointer. */
function Highlight({ target }: { target: { ref: string; name: string } | null }) {
  const box = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  React.useEffect(() => {
    const el = box.current
    if (!el || !target) return
    const node = elementForRef(target.ref)
    if (!node) return
    try { if (!el.matches(":popover-open")) el.showPopover() } catch { /* older browsers: fixed position still works */ }
    const parts = partsOf(node)
    let frame = 0
    const place = () => {
      const rects = parts.filter((part) => part.isConnected).map((part) => part.getBoundingClientRect()).filter((r) => r.width > 0 || r.height > 0)
      const left = Math.min(...rects.map((r) => r.left)), top = Math.min(...rects.map((r) => r.top))
      const right = Math.max(...rects.map((r) => r.right)), bottom = Math.max(...rects.map((r) => r.bottom))
      el.style.transform = `translate(${Math.round(left - 3)}px, ${Math.round(top - 3)}px)`
      el.style.width = `${Math.round(right - left + 6)}px`
      el.style.height = `${Math.round(bottom - top + 6)}px`
      el.style.opacity = rects.length && uncovered(parts) ? "1" : "0"
      el.toggleAttribute("data-flip", top < 30)
      frame = requestAnimationFrame(place)
    }
    place()
    return () => {
      cancelAnimationFrame(frame)
      el.style.opacity = "0"
      try { el.hidePopover() } catch { /* not shown as a popover */ }
    }
  }, [target])
  if (!mounted) return null
  return createPortal(
    <div ref={box} popover="manual" data-agent-hidden aria-hidden
      className="group/hl pointer-events-none fixed inset-auto top-0 left-0 m-0 overflow-visible border-0 bg-transparent p-0 opacity-0">
      <div className="absolute inset-0 rounded-[9px] border-2 border-foreground/80 bg-foreground/[0.06] shadow-[0_0_0_3px_color-mix(in_oklab,var(--background)_70%,transparent)]" />
      {target && <span className="absolute -top-[22px] left-0 max-w-[240px] truncate rounded-[6px] bg-foreground px-1.5 py-0.5 text-[10.5px] leading-[14px] font-medium text-background group-data-[flip]/hl:top-auto group-data-[flip]/hl:-bottom-[22px]">{target.name}</span>}
    </div>,
    document.body,
  )
}

type Run = { call: string; ok: boolean; message: string }

function changeWords(value: unknown) {
  if (value === "" || value === null || value === undefined) return "empty"
  if (typeof value === "string") return `“${value.length > 28 ? `${value.slice(0, 27)}…` : value}”`
  if (typeof value === "object") return Array.isArray(value) ? value.join(", ") || "none" : "updated"
  return String(value)
}

function summary(result: unknown): Run["message"] {
  const res = result as { ok?: boolean; error?: { message?: string }; steps?: { changes?: { key: string; value: unknown }[] }[] }
  if (!res || res.ok === false) return res?.error?.message ?? "The action did not run."
  const changes = res.steps?.flatMap((step) => step.changes ?? []) ?? []
  if (!changes.length) return "Done. Nothing an agent reads changed."
  return changes.slice(0, 3).map((change) => `${change.key} → ${changeWords(change.value)}`).join(" · ")
}

const sourceWords: Record<string, string> = {
  agent: "by the agent", mouse: "by you", touch: "by you", pen: "by you", keyboard: "by you",
  virtual: "by the page", programmatic: "by the page",
}

export function AgentInspector({ id: inspectorId, scope, label = "this preview" }: {
  id?: string
  scope: React.RefObject<HTMLElement | null>
  label?: string
}) {
  const { components, ready, pending, error, result, changes, truncated, refresh, query, act } = useAgentPreview(scope)
  const aside = React.useRef<HTMLElement>(null)
  usePersistentLayer(aside)
  const [view, setView] = React.useState("list")
  const [copied, setCopied] = React.useState("")
  const [copyError, setCopyError] = React.useState<string | null>(null)
  const [hovered, setHovered] = React.useState<string | null>(null)
  const [pinned, setPinned] = React.useState<string | null>(null)
  const [runs, setRuns] = React.useState<Record<string, Run>>({})
  const [choices, setChoices] = React.useState<Record<string, Choice[] | string>>({})
  const [flash, setFlash] = React.useState<Record<string, Set<string>>>({})
  const previous = React.useRef<Map<string, Map<string, string>> | null>(null)
  const snapshot = json(components)
  const lastChange = changes.at(-1)

  /* Mark the facts that just changed, so a value an action or a person set is easy to spot. */
  React.useEffect(() => {
    const now = new Map(components.map((entry) => [entry.ref, new Map(facts(entry).map((fact) => [fact.key, fact.text]))]))
    const before = previous.current
    previous.current = now
    if (!before) return
    const changed: Record<string, Set<string>> = {}
    for (const [ref, keys] of now) {
      const old = before.get(ref)
      if (!old) continue
      for (const [key, text] of keys) if (old.get(key) !== text) (changed[ref] ??= new Set()).add(key)
    }
    if (!Object.keys(changed).length) return
    setFlash((current) => ({ ...current, ...changed }))
    const timer = setTimeout(() => setFlash((current) => {
      const next = { ...current }
      for (const ref of Object.keys(changed)) if (next[ref] === changed[ref]) delete next[ref]
      return next
    }), 1600)
    return () => clearTimeout(timer)
  }, [components])

  React.useEffect(() => {
    if (!pinned) return
    const timer = setTimeout(() => setPinned(null), 1800)
    return () => clearTimeout(timer)
  }, [pinned])

  const nameOf = (entry: AgentComponent) => entry.label || kindWords(entry.component)
  const focusRef = hovered ?? pinned
  const focusEntry = components.find((entry) => entry.ref === focusRef)

  const run = async (entry: AgentComponent, action: string, args: unknown[]) => {
    const call = callText(action, args)
    const res = await act({ ref: entry.ref, action, args })
    const ok = (res as { ok?: boolean }).ok !== false
    setRuns((current) => ({ ...current, [entry.ref]: { call, ok, message: summary(res) } }))
    return ok
  }

  const readChoices = async (entry: AgentComponent) => {
    const res = await query(entry.ref)
    if (!Array.isArray(res)) { setChoices((current) => ({ ...current, [entry.ref]: res.error })); return }
    const list = res.filter((item) => item.ref !== entry.ref).map((item) => {
      const value = typeof item.value === "string" ? item.value : item.label ?? item.component
      return { value, label: item.label ?? String(value) }
    })
    setChoices((current) => ({ ...current, [entry.ref]: list.length ? list : "No more choices to read." }))
  }

  const show = (entry: AgentComponent) => {
    setPinned(entry.ref)
    const node = elementForRef(entry.ref)
    if (!node) return
    const r = node.getBoundingClientRect()
    if (r.bottom < 0 || r.top > window.innerHeight) {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      node.scrollIntoView({ block: "center", behavior: smooth ? "smooth" : "auto" })
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snapshot)
      setCopied(snapshot)
      setCopyError(null)
    } catch { setCopyError("The browser could not copy this. Select the JSON below instead.") }
  }

  const count = components.length
  return (
    <aside ref={aside} id={inspectorId} data-agent-inspector data-agent-hidden aria-label={`Agent view for ${label}`}
      className="flex min-w-0 flex-col border-t border-border bg-muted/20 text-foreground @[720px]/agent-preview:border-t-0 @[720px]/agent-preview:border-s">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold tracking-tight">What an agent sees</span>
            <span className={cn("inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] leading-4 text-muted-foreground")}>
              <span aria-hidden className={cn("size-1.5 rounded-full", ready ? "bg-emerald-500" : "bg-muted-foreground/50")} />
              {ready ? "Live" : "Connecting"}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Each part as UI SDK hands it to an AI agent, and what the agent can do with it.</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon-sm" disabled={!ready} onClick={() => void copy()} aria-label="Copy agent snapshot as JSON" title="Copy JSON" className="size-7">
            {copied === snapshot ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
          </Button>
          <Button variant="ghost" size="icon-sm" disabled={!ready || pending} onClick={refresh} aria-label="Refresh agent snapshot" title="Refresh" className="size-7">
            <RefreshCw aria-hidden className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="px-4 pb-3">
        <SegmentedControl aria-label="Agent view mode" value={view} onValueChange={(next) => next && setView(String(next))} className="max-w-full">
          <SegmentedControlItem value="list">Parts</SegmentedControlItem>
          <SegmentedControlItem value="json">JSON</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <div className="min-h-[240px] max-h-[440px] min-w-0 flex-1 overflow-y-auto border-t border-border/70">
        {view === "list" ? (
          count ? (
            <ul data-agent-parts className="divide-y divide-border/70" onPointerLeave={() => setHovered(null)}>
              {components.map((entry) => (
                <Part key={entry.ref} entry={entry} name={nameOf(entry)} pending={pending} changed={flash[entry.ref]}
                  focused={focusRef === entry.ref} run={runs[entry.ref]} choices={choices[entry.ref]}
                  onHover={(on) => setHovered(on ? entry.ref : null)} onShow={() => show(entry)}
                  onRun={(action, args) => run(entry, action, args)} onChoices={() => void readChoices(entry)} />
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-[11.5px] leading-5 text-muted-foreground">
              {ready ? "Nothing in this preview is visible to an agent right now. UI SDK leaves out decorative and hidden parts on purpose, so a separator, for example, never shows up here." : "Connecting to this preview…"}
            </p>
          )
        ) : (
          <div className="space-y-3 px-4 py-3">
            <pre data-agent-snapshot tabIndex={0} aria-label="Live agent snapshot" className="min-w-0 overflow-auto rounded-lg border border-border/70 bg-background px-3 py-2.5 font-mono text-[11px] leading-[1.7] outline-none focus-visible:ring-2 focus-visible:ring-ring">{snapshot}</pre>
            {result !== null && result !== undefined && <div className="space-y-1.5"><p className="text-[11px] font-medium text-muted-foreground">Last tool response</p><pre data-agent-result tabIndex={0} aria-label="Agent tool response" className="max-h-44 overflow-auto rounded-lg border border-border/70 bg-background px-3 py-2 font-mono text-[10px] leading-[1.7] outline-none focus-visible:ring-2 focus-visible:ring-ring">{json(result)}</pre></div>}
          </div>
        )}
        {truncated && <p className="px-4 pb-3 text-[11px] leading-5 text-muted-foreground">UI SDK shortened this snapshot. “See choices” reads the rest of a list.</p>}
        {(copyError || (error && !Object.values(runs).some((r) => !r.ok && r.message === error))) && <p role="alert" className="px-4 pb-3 text-[11px] leading-5 text-destructive">{copyError || error}</p>}
      </div>
      <div className="flex min-h-9 items-center gap-2 border-t border-border/70 px-4 py-2 text-[10.5px] leading-4 text-muted-foreground">
        <span className="shrink-0 tabular-nums">{count} {count === 1 ? "part" : "parts"}</span>
        {lastChange && <span className="truncate border-s border-border ps-2" title={`${lastChange.label || lastChange.component}: ${lastChange.key} · ${lastChange.source}`}>
          {lastChange.label || kindWords(lastChange.component)}: {lastChange.key} changed {sourceWords[lastChange.source] ?? ""}
        </span>}
      </div>
      <Highlight target={focusEntry ? { ref: focusEntry.ref, name: nameOf(focusEntry) } : null} />
    </aside>
  )
}

function Part({ entry, name, pending, changed, focused, run, choices, onHover, onShow, onRun, onChoices }: {
  entry: AgentComponent
  name: string
  pending: boolean
  changed?: Set<string>
  focused: boolean
  run?: Run
  choices?: Choice[] | string
  onHover: (on: boolean) => void
  onShow: () => void
  onRun: (action: string, args: unknown[]) => Promise<boolean>
  onChoices: () => void
}) {
  const list = facts(entry)
  const text = shownText(entry)
  const offers = plans(entry)
  const [open, setOpen] = React.useState<number | null>(null)
  const form = open === null ? undefined : offers[open]
  const kind = kindWords(entry.component)
  return (
    <li data-agent-part={entry.ref} data-changed={changed?.size ? "" : undefined}
      onPointerEnter={(event) => event.pointerType === "mouse" && onHover(true)}
      onFocus={() => onHover(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) onHover(false) }}
      className={cn("px-4 py-3 transition-colors duration-500", focused && "bg-muted/60", changed?.size && "bg-emerald-500/[0.07] duration-150")}>
      <button type="button" onClick={onShow} title="Show it in the preview"
        className="flex w-full min-w-0 items-baseline gap-2 rounded-[6px] text-start outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="min-w-0 truncate text-[12.5px] leading-5 font-semibold">{name}</span>
        {entry.label && <span className="shrink-0 text-[11px] leading-5 text-muted-foreground">{kind}</span>}
      </button>
      {typeof entry.row === "string" && entry.row && <p className="truncate text-[11px] leading-4 text-muted-foreground">Next to “{entry.row}”</p>}
      {list.length > 0 && (
        <p className="mt-0.5 text-[11.5px] leading-[18px] text-muted-foreground">
          {list.map((fact, index) => (
            <React.Fragment key={fact.key}>
              {index > 0 && <span aria-hidden> · </span>}
              <span data-fact={fact.key} className={cn("transition-colors duration-500", changed?.has(fact.key) && "font-medium text-emerald-700 duration-150 dark:text-emerald-400")}>{fact.text}</span>
            </React.Fragment>
          ))}
        </p>
      )}
      {text && <p className="mt-1.5 line-clamp-2 border-s-2 border-border ps-2 text-[11px] leading-4 text-muted-foreground">{text}</p>}
      {typeof entry.confirm === "string" && <p className="mt-1.5 text-[11px] leading-4 text-amber-700 dark:text-amber-400">A person must approve this: {entry.confirm}</p>}
      {typeof entry.error === "string" && <p className="mt-1.5 text-[11px] leading-4 text-destructive">{entry.error}</p>}
      {offers.length > 0 || hasChoices(entry) ? (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label={`What an agent can do with ${name}`} role="group">
          {offers.map((plan, index) => (
            <Button key={`${plan.action}-${index}`} size="sm" disabled={pending}
              aria-expanded={plan.kind === "run" ? undefined : open === index}
              title={plan.kind === "run" ? callText(plan.action, plan.args) : plan.action}
              onClick={() => plan.kind === "run" ? void onRun(plan.action, plan.args) : setOpen(open === index ? null : index)}
              className={cn("h-6 rounded-[7px] px-2 text-[11px]", open === index && "bg-muted")}>
              {plan.label}
            </Button>
          ))}
          {hasChoices(entry) && <Button size="sm" variant="ghost" disabled={pending} onClick={onChoices} className="h-6 rounded-[7px] px-2 text-[11px] text-muted-foreground">See choices</Button>}
        </div>
      ) : (
        <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground/80">Read-only: an agent can read it, not change it.</p>
      )}
      {form && form.kind !== "run" && <ActionForm key={`${entry.ref}-${open}`} plan={form} pending={pending} onRun={(args) => void onRun(form.action, args).then((ok) => { if (ok) setOpen(null) })} onClose={() => setOpen(null)} />}
      {choices && (
        typeof choices === "string" ? <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{choices}</p> : (
          <div className="mt-2 flex flex-wrap gap-1">
            {choices.slice(0, 12).map((choice) => entry.actions.includes("setValue") ? (
              <Button key={choice.value} size="sm" variant="ghost" disabled={pending} onClick={() => void onRun("setValue", [choice.value])}
                title={callText("setValue", [choice.value])} className="h-6 rounded-[7px] border border-border/70 px-2 text-[11px]">{choice.label}</Button>
            ) : <span key={choice.value} className="rounded-[7px] border border-border/70 px-2 py-0.5 text-[11px]">{choice.label}</span>)}
            {choices.length > 12 && <span className="px-1 text-[11px] leading-6 text-muted-foreground">+{choices.length - 12} more</span>}
          </div>
        )
      )}
      {run && (
        <p data-agent-run className={cn("mt-2 flex items-start gap-1.5 text-[11px] leading-4", run.ok ? "text-muted-foreground" : "text-destructive")}>
          {run.ok ? <Check aria-hidden className="mt-px size-3 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <X aria-hidden className="mt-px size-3 shrink-0" />}
          <span className="min-w-0"><code className="font-mono text-[10.5px] text-foreground">{run.call}</code> <span>{run.message}</span></span>
        </p>
      )}
    </li>
  )
}

function ActionForm({ plan, pending, onRun, onClose }: {
  plan: Exclude<ActionPlan, { kind: "run" }>
  pending: boolean
  onRun: (args: unknown[]) => void
  onClose: () => void
}) {
  const [text, setText] = React.useState(plan.kind === "choose" ? "" : plan.initial)
  const [problem, setProblem] = React.useState<string | null>(null)
  const id = React.useId()

  if (plan.kind === "choose") {
    return (
      <div className="mt-2 rounded-lg border border-border/70 bg-background p-2">
        <p className="mb-1.5 px-0.5 text-[11px] leading-4 text-muted-foreground">Pick a choice to run <code className="font-mono text-[10.5px] text-foreground">{plan.action}</code>:</p>
        <div className="flex flex-wrap gap-1">
          {plan.choices.slice(0, 16).map((choice) => (
            <Button key={choice.value} size="sm" variant="ghost" disabled={pending}
              onClick={() => onRun([plan.multiple ? [choice.value] : choice.value])}
              title={callText(plan.action, [plan.multiple ? [choice.value] : choice.value])}
              className="h-6 rounded-[7px] border border-border/70 px-2 text-[11px]">{choice.label}</Button>
          ))}
        </div>
      </div>
    )
  }

  const args = (): unknown[] | null => {
    if (plan.kind === "json") {
      try {
        const parsed: unknown = JSON.parse(text)
        if (!Array.isArray(parsed)) { setProblem('Write the arguments as a list, like ["Atlas"] or [].'); return null }
        return parsed
      } catch { setProblem('That isn’t valid JSON. Arguments look like ["Atlas"] or [3].'); return null }
    }
    if (plan.kind === "number") {
      const value = Number(text)
      if (text.trim() === "" || Number.isNaN(value)) { setProblem("Enter a number."); return null }
      return [value]
    }
    return [text]
  }
  const preview = plan.kind === "json" ? `${plan.action}(…)` : callText(plan.action, plan.kind === "number" ? [Number(text) || 0] : [text])
  const submit = () => { setProblem(null); const next = args(); if (next) onRun(next) }

  return (
    <form className="mt-2 rounded-lg border border-border/70 bg-background p-2" onSubmit={(event) => { event.preventDefault(); submit() }}>
      <label htmlFor={id} className="mb-1.5 block px-0.5 text-[11px] leading-4 text-muted-foreground">
        {plan.kind === "json" ? <>Arguments for <code className="font-mono text-[10.5px] text-foreground">{plan.action}</code>, as a JSON list</> : <>What should the agent enter?</>}
      </label>
      <div className="flex items-start gap-1.5">
        {plan.kind === "json" ? (
          <Textarea id={id} value={text} onValueChange={(value) => { setText(value); setProblem(null) }} autoResize={false} rows={2} spellCheck={false}
            aria-invalid={Boolean(problem)} disabled={pending} className="min-h-12 min-w-0 flex-1 font-mono text-[11px]" />
        ) : (
          <Input id={id} value={text} onValueChange={(value: string) => { setText(value); setProblem(null) }} inputMode={plan.kind === "number" ? "decimal" : undefined}
            aria-invalid={Boolean(problem)} disabled={pending} autoComplete="off" spellCheck={false} className="h-7 min-w-0 flex-1 text-[12px]" />
        )}
        <Button type="submit" size="sm" variant="primary" disabled={pending} className="h-7 shrink-0 px-2.5 text-[11px]">
          Run <CornerDownLeft aria-hidden className="size-3" />
        </Button>
        <Button type="button" size="icon-sm" variant="ghost" onClick={onClose} aria-label="Close" className="size-7 shrink-0"><X aria-hidden className="size-3.5" /></Button>
      </div>
      <p className="mt-1.5 truncate px-0.5 font-mono text-[10.5px] leading-4 text-muted-foreground">{preview}</p>
      {problem && <p role="alert" className="mt-1 px-0.5 text-[11px] leading-4 text-destructive">{problem}</p>}
    </form>
  )
}
