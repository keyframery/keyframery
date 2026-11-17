"use client"

import { Check, Copy, Play, RefreshCw } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useAgentPreview } from "@/lib/use-agent-preview"
import { cn } from "@/lib/utils"

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
  const [enabled, setEnabled] = React.useState(defaultEnabled)
  const inspectorId = React.useId()
  return (
    <div data-agent-preview-layout className={cn("@container/agent-preview min-w-0", className)}>
      <div data-agent-hidden className="flex justify-end border-b border-border px-4 py-2.5">
        <label className="relative inline-flex cursor-pointer items-center gap-2.5 rounded-[9px] border border-foreground/30 bg-muted/70 px-2 py-1 text-[12px] font-medium text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--background)_75%,transparent),0_1px_2px_color-mix(in_oklab,var(--foreground)_8%,transparent)] hover:border-foreground/45 hover:bg-muted before:pointer-events-none before:absolute before:-top-px before:-start-px before:size-[8px] before:rounded-ss-[9px] before:border-s before:border-t before:border-foreground/65 after:pointer-events-none after:absolute after:-end-px after:-bottom-px after:size-[8px] after:rounded-ee-[9px] after:border-e after:border-b after:border-foreground/65">
          Agent view
          <Switch aria-label={`Agent view for ${label}`} aria-controls={enabled ? inspectorId : undefined}
            checked={enabled} onCheckedChange={setEnabled} className="[--switch-width:32px] [--switch-height:20px] [--switch-thumb-size:16px]" />
        </label>
      </div>
      <div className={cn("grid min-w-0 items-stretch", enabled && "@[720px]/agent-preview:grid-cols-[minmax(0,1fr)_300px]")}>
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

function InspectorSelect({ id, label, value, items, disabled, onChange }: {
  id: string
  label: string
  value: string
  items: { value: string; label: string }[]
  disabled?: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[11px] font-medium text-muted-foreground">{label}</label>
      <Select items={items} value={value} disabled={disabled} onValueChange={(next) => next && onChange(next)}>
        <SelectTrigger id={id} aria-label={label} className="h-8 text-[12px]">
          <SelectValue className="truncate" />
        </SelectTrigger>
        <SelectContent data-agent-hidden sideOffset={6}>
          {items.map((item) => <SelectItem key={item.value} value={item.value} label={item.label}>{item.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

export function AgentInspector({ id: inspectorId, scope, label = "this preview" }: {
  id?: string
  scope: React.RefObject<HTMLElement | null>
  label?: string
}) {
  const { components, ready, pending, error, result, changes, truncated, refresh, query, act } = useAgentPreview(scope)
  const [view, setView] = React.useState("snapshot")
  const [target, setTarget] = React.useState("")
  const [action, setAction] = React.useState("")
  const [argumentsText, setArgumentsText] = React.useState("[]")
  const [localError, setLocalError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState("")
  const id = React.useId()
  const snapshot = json(components)
  const component = components.find((entry) => entry.ref === target) ?? components[0]
  const selectedAction = component?.actions.includes(action) ? action : component?.actions[0] ?? ""
  const lastChange = changes.at(-1)

  const run = async () => {
    if (!component || !selectedAction) return
    setLocalError(null)
    try {
      const args: unknown = JSON.parse(argumentsText)
      if (!Array.isArray(args)) throw new Error('Arguments must be a JSON array, such as ["Atlas"] or [].')
      await act({ ref: component.ref, action: selectedAction, args })
    } catch (failure) {
      setLocalError(failure instanceof Error ? failure.message : "The action could not run.")
    }
  }

  const choices = async () => {
    if (!component) return
    setLocalError(null)
    try { await query(component.ref) }
    catch (failure) { setLocalError(failure instanceof Error ? failure.message : "Choices could not be read.") }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snapshot)
      setCopied(snapshot)
      setLocalError(null)
    } catch { setLocalError("The browser could not copy this snapshot. You can select the JSON below.") }
  }

  return (
    <aside id={inspectorId} data-agent-inspector data-agent-hidden aria-label={`Agent view for ${label}`}
      className="flex min-w-0 flex-col border-t border-border bg-muted/20 text-foreground @[720px]/agent-preview:border-t-0 @[720px]/agent-preview:border-s">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold tracking-tight">Agent view</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] leading-4 text-muted-foreground">{ready ? "Live" : "Connecting"}</span>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">What UI SDK exposes to an agent.</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon-sm" disabled={!ready} onClick={() => void copy()} aria-label="Copy agent snapshot" title="Copy snapshot" className="size-7">
            {copied === snapshot ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
          </Button>
          <Button variant="ghost" size="icon-sm" disabled={!ready || pending} onClick={refresh} aria-label="Refresh agent snapshot" title="Refresh snapshot" className="size-7">
            <RefreshCw aria-hidden className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="px-4 pb-3">
        <SegmentedControl aria-label="Agent view mode" value={view} onValueChange={(next) => next && setView(String(next))} className="max-w-full">
          <SegmentedControlItem value="snapshot">Snapshot</SegmentedControlItem>
          <SegmentedControlItem value="actions">Actions</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <div className="min-h-[240px] max-h-[360px] min-w-0 flex-1 overflow-y-auto px-4 pb-4">
        {view === "snapshot" ? (
          <div className="space-y-3">
            <pre data-agent-snapshot tabIndex={0} aria-label="Live agent snapshot" className="max-h-[300px] min-w-0 overflow-auto rounded-lg border border-border/70 bg-background px-3 py-2.5 font-mono text-[11px] leading-[1.7] outline-none focus-visible:ring-2 focus-visible:ring-ring">{snapshot}</pre>
            {ready && components.length === 0 && <p className="text-[11px] leading-5 text-muted-foreground">No components are currently exposed. Hidden and decorative parts stay out of snapshots.</p>}
            {truncated && <p className="text-[11px] leading-5 text-muted-foreground">The SDK limited this snapshot. Use a component’s choices to inspect more items.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {component ? <>
              {components.length > 1 ? (
                <InspectorSelect id={`${id}-target`} label="Component" value={component.ref} disabled={pending}
                  items={components.map((entry) => ({ value: entry.ref, label: `${entry.label || entry.component} · ${entry.ref}` }))}
                  onChange={(next) => { setTarget(next); setAction(""); setArgumentsText("[]"); setLocalError(null) }} />
              ) : <div className="flex items-center justify-between gap-2 text-[12px]"><span className="truncate font-medium">{component.label || component.component}</span><code className="text-[10px] text-muted-foreground">{component.ref}</code></div>}
              {component.actions.length > 0 ? <>
                <InspectorSelect id={`${id}-action`} label="Action" value={selectedAction} disabled={pending}
                  items={component.actions.map((name) => ({ value: name, label: name }))}
                  onChange={(next) => { setAction(next); setArgumentsText("[]"); setLocalError(null) }} />
                <div className="space-y-1.5">
                  <label htmlFor={`${id}-arguments`} className="text-[11px] font-medium text-muted-foreground">Arguments <span className="font-normal">· JSON array</span></label>
                  <Textarea id={`${id}-arguments`} aria-label="Agent action arguments" value={argumentsText} onValueChange={(value) => { setArgumentsText(value); setLocalError(null) }}
                    disabled={pending} autoResize={false} rows={2} spellCheck={false} aria-invalid={Boolean(localError)} className="min-h-14 font-mono text-[11px]" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" size="sm" disabled={pending || !ready} onClick={() => void run()}><Play aria-hidden className="size-3" />{pending ? "Running…" : "Run action"}</Button>
                  <Button size="sm" disabled={pending || !ready} onClick={() => void choices()}>Query choices</Button>
                </div>
                <p className="text-[10px] leading-4 text-muted-foreground">Runs on the live component through UI SDK.</p>
              </> : <>
                <p className="text-[11px] leading-5 text-muted-foreground">Read-only. This component exposes state and content, with no actions to call.</p>
                <Button size="sm" disabled={pending || !ready} onClick={() => void choices()}>Query choices</Button>
              </>}
            </> : <p className="text-[11px] leading-5 text-muted-foreground">{ready ? "No exposed component is available to interact with." : "Waiting for this preview to mount."}</p>}
            {result !== null && result !== undefined && <div className="space-y-1.5"><p className="text-[11px] font-medium text-muted-foreground">Tool response</p><pre data-agent-result tabIndex={0} aria-label="Agent tool response" className="max-h-44 overflow-auto rounded-lg border border-border/70 bg-background px-3 py-2 font-mono text-[10px] leading-[1.7] outline-none focus-visible:ring-2 focus-visible:ring-ring">{json(result)}</pre></div>}
          </div>
        )}
        {(localError || error) && <p role="alert" className="mt-3 text-[11px] leading-5 text-destructive">{localError || error}</p>}
      </div>
      <div className="flex min-h-9 items-center gap-2 border-t border-border/70 px-4 py-2 text-[10px] leading-4 text-muted-foreground">
        <span className="shrink-0 tabular-nums">{components.length} {components.length === 1 ? "component" : "components"}</span>
        {lastChange && <span className="truncate border-s border-border ps-2" title={`${lastChange.label || lastChange.component}: ${lastChange.key} · ${lastChange.source}`}>{lastChange.key} · {lastChange.source}</span>}
      </div>
    </aside>
  )
}
