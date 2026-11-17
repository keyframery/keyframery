import { createAgent, type AgentAction, type AgentComponent, type AgentStep, type ObservedChange } from "@ui-sdk/react/agent"
import { elementOf } from "@ui-sdk/react/observe"

type Bridge = ReturnType<typeof createAgent>
type ActionResult = Awaited<ReturnType<Bridge["act"]>>

export type AgentPreviewSnapshot = {
  components: AgentComponent[]
  ready: boolean
  pending: boolean
  error: string | null
  result: unknown
  changes: ObservedChange[]
  truncated: boolean
}

export const emptyAgentPreview: AgentPreviewSnapshot = {
  components: [], ready: false, pending: false, error: null, result: null, changes: [], truncated: false,
}

const scopes = new Set<HTMLElement>()
let bridge: Bridge | undefined
let authorized: { scope: HTMLElement; ref: string; action: string } | undefined
let actionQueue = Promise.resolve()

function elementFor(ref: string) {
  try { return elementOf(ref) } catch { return undefined }
}

function contentScope(scope: HTMLElement) {
  return scope.querySelector<HTMLElement>("[data-agent-preview-content]") ?? scope
}

/* A popup can live outside its trigger's DOM subtree. Follow its ARIA ownership, while never
   borrowing another mounted preview's canvas. Native top-layer popups remain descendants. */
function ownedRegions(scope: HTMLElement) {
  const content = contentScope(scope)
  const regions = new Set<HTMLElement>([content])
  const previews = new Set([...scopes, ...scope.ownerDocument.querySelectorAll<HTMLElement>("[data-agent-preview-canvas]")])
  for (const region of regions) {
    for (const control of region.querySelectorAll<HTMLElement>("[aria-controls], [aria-owns]")) {
      for (const id of `${control.getAttribute("aria-controls") ?? ""} ${control.getAttribute("aria-owns") ?? ""}`.split(/\s+/)) {
        if (!id) continue
        const target = scope.ownerDocument.getElementById(id)
        if (!target || target.contains(content) || [...previews].some((other) => other !== scope && (other.contains(target) || target.contains(other)))) continue
        regions.add(target)
      }
    }
    if (regions.size > 100) break
  }
  return regions
}

function owns(scope: HTMLElement, ref: string) {
  const el = elementFor(ref)
  return !!el?.isConnected && !el.closest("[data-agent-hidden]") && [...ownedRegions(scope)].some((region) => region.contains(el))
}

function pageBridge() {
  if (typeof document === "undefined") throw new Error("Agent previews are available in the browser.")
  return bridge ??= createAgent({
    allow: (step: AgentAction) => !!authorized && !step.confirm &&
      step.ref === authorized.ref && step.action === authorized.action && owns(authorized.scope, step.ref),
  })
}

function serializeAction<T>(run: () => Promise<T>) {
  const operation = actionQueue.then(run, run)
  actionQueue = operation.then(() => undefined, () => undefined)
  return operation
}

function failure(message: string): ActionResult {
  return { ok: false, steps: [], appeared: [], values: {}, error: { step: 0, message } }
}

function messageOf(error: unknown) { return error instanceof Error ? error.message : String(error) }

/* A global snapshot stops at 100 entries. Query the kinds actually rendered in this canvas
   when it is capped; data-slot prefixes include both component and part names. */
function renderedKinds(scope: HTMLElement) {
  const kinds = new Set<string>()
  for (const region of ownedRegions(scope)) {
    for (const el of [region, ...region.querySelectorAll<HTMLElement>("[data-slot]")]) {
      if (el.closest("[data-agent-hidden]")) continue
      const words = el.getAttribute("data-slot")?.split("-") ?? []
      while (words.length) {
        kinds.add(words.join("-"))
        words.pop()
      }
    }
  }
  return kinds
}

function renderedLabels(scope: HTMLElement) {
  const labels = new Set<string>()
  for (const region of ownedRegions(scope)) {
    for (const el of [region, ...region.querySelectorAll<HTMLElement>("[aria-label], [aria-labelledby], label")]) {
      if (el.closest('[data-agent-hidden], [aria-hidden="true"]')) continue
      const referenced = el.getAttribute("aria-labelledby")?.split(/\s+/)
        .map((id) => scope.ownerDocument.getElementById(id)?.textContent ?? "").join(" ")
      const name = el.getAttribute("aria-label") || referenced || (el.tagName === "LABEL" ? el.textContent : "")
      if (name?.trim()) labels.add(name.trim())
    }
  }
  return labels
}

function hasRef(refs: Set<string>, value: string) {
  return [...refs].some((ref) => value === ref || value.startsWith(`${ref} `))
}

export function createAgentPreviewSession(scope: HTMLElement) {
  const agent = pageBridge()
  scopes.add(scope)
  let state = emptyAgentPreview
  let disposed = false
  let visible = true
  let scheduled = false
  let dirty = false
  let refreshing: Promise<void> | undefined
  let activeChanges: ObservedChange[] | undefined
  const listeners = new Set<() => void>()

  const update = (next: Partial<AgentPreviewSnapshot>) => {
    if (disposed) return
    state = { ...state, ...next }
    for (const listener of listeners) listener()
  }

  const local = (entry: AgentComponent) => entry.component !== "more" && !entry.offPage && owns(scope, entry.ref)
  async function readComponents() {
    const snapshot = agent.snapshot()
    const found = new Map(snapshot.filter(local).map((entry) => [entry.ref, entry]))
    let truncated = false
    if (snapshot.some((entry) => entry.component === "more")) {
      for (const kind of renderedKinds(scope)) {
        if (disposed) break
        const result = await agent.query({ kind })
        if ("error" in result) continue
        truncated ||= result.some((entry) => entry.component === "more")
        for (const entry of result) if (local(entry)) found.set(entry.ref, entry)
      }
      /* A kind can itself exceed 100 components elsewhere on a documentation page. Names
         rendered in this example narrow that query without exposing other examples. */
      if (truncated) for (const text of renderedLabels(scope)) {
        if (disposed) break
        const result = await agent.query({ text })
        if ("error" in result) continue
        for (const entry of result) if (local(entry)) found.set(entry.ref, entry)
      }
    }
    return { components: [...found.values()], truncated }
  }

  async function refresh() {
    if (disposed) return
    if (refreshing) { dirty = true; return refreshing }
    refreshing = (async () => {
      do {
        dirty = false
        try {
          const next = await readComponents()
          if (!state.ready || state.truncated !== next.truncated || JSON.stringify(state.components) !== JSON.stringify(next.components)) {
            update({ ...next, ready: true })
          }
        } catch (error) {
          update({ ready: true, error: messageOf(error) })
        }
      } while (dirty && !disposed)
    })().finally(() => { refreshing = undefined })
    return refreshing
  }

  const schedule = () => {
    if (disposed || scheduled || !visible) return
    scheduled = true
    queueMicrotask(() => { scheduled = false; void refresh() })
  }

  const unsubscribe = agent.subscribe((change) => {
    if (!owns(scope, change.ref)) return
    activeChanges?.push(change)
    update({ changes: [...state.changes, change].slice(-10) })
    schedule()
  })
  const mutations = new MutationObserver(schedule)
  mutations.observe(scope, { subtree: true, childList: true, characterData: true, attributes: true })
  const events = ["input", "change", "click", "keydown", "pointerup"]
  events.forEach((name) => scope.addEventListener(name, schedule, true))
  const intersection = typeof IntersectionObserver === "undefined" ? undefined : new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) schedule()
  })
  intersection?.observe(scope.closest("[data-agent-preview-layout]") ?? scope)
  /* Some primitive state is programmatic and changes no DOM. A bounded fallback keeps that
     state live too; inactive examples do no polling, and inspector DOM is outside this scope. */
  const interval = setInterval(() => { if (visible && !scope.ownerDocument.hidden) schedule() }, 1000)

  function target(ref: string) {
    return state.components.find((entry) => entry.ref === ref && owns(scope, ref))
  }

  async function query(ref: string): Promise<AgentComponent[] | { error: string }> {
    if (disposed) return { error: "This preview is no longer mounted." }
    await refresh()
    if (disposed) return { error: "This preview is no longer mounted." }
    if (!target(ref)) {
      const result = { error: "Choose a component from this preview." }
      update({ error: result.error, result })
      return result
    }
    update({ pending: true, error: null })
    try {
      const response = await agent.query({ within: ref })
      const result = "error" in response ? response : response.filter(local)
      update({ result, error: "error" in result ? result.error : null })
      return result
    } catch (error) {
      const result = { error: messageOf(error) }
      update({ error: result.error, result })
      return result
    } finally { update({ pending: false }); await refresh() }
  }

  async function act(step: AgentStep) {
    if (disposed) return failure("This preview is no longer mounted.")
    update({ pending: true, error: null })
    try {
      return await serializeAction(async () => {
        if (disposed) return failure("This preview is no longer mounted.")
        await refresh()
        if (disposed) return failure("This preview is no longer mounted.")
        const entry = target(step.ref)
        if (!entry || !entry.actions.includes(step.action)) {
          const result = failure("Choose an available action on a component in this preview.")
          update({ error: result.error!.message, result })
          return result
        }
        if (entry.confirm) {
          const result = failure("This action needs confirmation in the component.")
          update({ error: result.error!.message, result })
          return result
        }
        const refs = new Set(state.components.map((component) => component.ref))
        scope.dispatchEvent(new CustomEvent("keyframery:agent-action", { bubbles: true }))
        authorized = { scope, ref: step.ref, action: step.action }
        activeChanges = []
        let raw: ActionResult
        try { raw = await agent.act({ steps: [step] }) } finally { authorized = undefined }
        const changes = activeChanges
        activeChanges = undefined
        await refresh()
        state.components.forEach((component) => refs.add(component.ref))
        const result: ActionResult = {
          ...raw,
          appeared: raw.appeared.filter(local),
          values: Object.fromEntries(Object.entries(raw.values).filter(([key]) => hasRef(refs, key))),
          ...(raw.open ? { open: raw.open.filter(local) } : {}),
          steps: raw.steps.filter((done) => refs.has(done.ref)).map((done) => ({
            ...done,
            changes: changes.map(({ component, label, key, value }) => ({ component, label, key, value })),
            ...(done.gone ? { gone: done.gone.filter((ref) => hasRef(refs, ref)) } : {}),
          })),
        }
        update({ result, error: result.error?.message ?? null })
        return result
      })
    } catch (error) {
      activeChanges = undefined
      const result = failure(messageOf(error))
      update({ error: result.error!.message, result })
      return result
    } finally { update({ pending: false }); await refresh() }
  }

  void refresh()
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    refresh,
    query,
    act,
    destroy() {
      disposed = true
      scopes.delete(scope)
      listeners.clear()
      unsubscribe()
      mutations.disconnect()
      intersection?.disconnect()
      clearInterval(interval)
      events.forEach((name) => scope.removeEventListener(name, schedule, true))
    },
  }
}

export type AgentPreviewSession = ReturnType<typeof createAgentPreviewSession>
