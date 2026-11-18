import type { AgentComponent } from "@ui-sdk/react/agent"

/* Plain-language reading of one UI SDK agent entry, for the Agent view list. Nothing here
   changes what an agent gets: the JSON tab shows the raw snapshot unchanged. */

const structural = new Set(["ref", "component", "label", "actions", "row", "items", "text", "buttons", "source",
  "offPage", "confirm", "content", "pending", "error"])

const falseWords: Record<string, string> = {
  open: "Closed", checked: "Unchecked", pressed: "Off", expanded: "Collapsed", playing: "Paused",
  visible: "Hidden", collapsed: "Expanded", openMobile: "Closed on phones",
}

const trueWords: Record<string, string> = {
  pressed: "On", openMobile: "Open on phones", multiline: "Several lines", multiple: "Several choices",
}

export function words(key: string) {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function short(text: string, max = 36) {
  const flat = text.replace(/\s+/g, " ").trim()
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat
}

function brief(value: unknown, entry: AgentComponent): string {
  if (value === null || value === undefined) return "none"
  if (typeof value === "string") return value === "" ? "empty" : `“${short(value)}”`
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) {
    if (!value.length) return "none"
    const labels = value.map((item) => {
      const match = entry.items?.find((choice) => choice.value === item)
      return match?.label ?? (typeof item === "object" ? "…" : String(item))
    })
    return labels.length > 3 ? `${labels.slice(0, 3).join(", ")} +${labels.length - 3}` : labels.join(", ")
  }
  return "{…}"
}

export type Fact = { key: string; text: string }

/** The facts an agent reads about a component, value first, in a person's words. */
export function facts(entry: AgentComponent): Fact[] {
  const out: Fact[] = []
  if ("value" in entry) {
    const value = entry.value
    const label = typeof value === "string" && entry.items
      ? entry.items.find((choice) => choice.value === value)?.label
      : undefined
    out.push({ key: "value", text: value === "" || value === null || (Array.isArray(value) && !value.length)
      ? "Empty" : `Value ${label ? `“${short(label)}”` : brief(value, entry)}` })
  }
  for (const [key, value] of Object.entries(entry)) {
    if (key === "value" || structural.has(key) || value === undefined || value === null || value === "") continue
    if (Array.isArray(value) && !value.length) continue
    if (typeof value === "boolean") {
      const text = value ? trueWords[key] ?? words(key) : falseWords[key]
      if (text) out.push({ key, text })
      continue
    }
    out.push({ key, text: `${words(key)} ${brief(value, entry)}` })
  }
  if (entry.items?.length) out.push({ key: "items", text: `${entry.items.length} ${entry.items.length === 1 ? "choice" : "choices"}` })
  if (entry.pending) out.push({ key: "pending", text: "Working…" })
  return out
}

/** Text the component shows, like a dialog's title or a message. */
export function shownText(entry: AgentComponent): string | undefined {
  if (typeof entry.content === "string" && entry.content.trim()) return entry.content.trim()
  if (Array.isArray(entry.text) && entry.text.length) return entry.text.join(" · ")
  return undefined
}

export function kindWords(kind: string) {
  return words(kind.replace(/-/g, " "))
}

/* Actions that take no arguments in UI SDK, so one click runs them. */
const immediate = new Set(["clear", "toggle", "previous", "next", "close", "open", "openAll", "closeAll", "submit",
  "selectAll", "increment", "decrement", "first", "last", "expandAll", "collapseAll", "dismiss", "play", "pause",
  "reset", "rotate", "scrollToEnd", "toggleVisible", "skip", "copy", "run", "clearActive"])

const booleanSetter: Record<string, [on: string, off: string]> = {
  open: ["Open", "Close"], checked: ["Check", "Uncheck"], pressed: ["Turn on", "Turn off"],
  expanded: ["Expand", "Collapse"], playing: ["Play", "Pause"], visible: ["Show", "Hide"],
  collapsed: ["Collapse", "Expand"], openMobile: ["Open on phones", "Close on phones"],
}

export type Choice = { value: string; label: string }

/** How the list offers one action: a button that runs it, or a small form for its argument. */
export type ActionPlan =
  | { kind: "run"; action: string; label: string; args: unknown[] }
  | { kind: "choose"; action: string; label: string; choices: Choice[]; multiple: boolean }
  | { kind: "text" | "number"; action: string; label: string; initial: string }
  | { kind: "json"; action: string; label: string; initial: string }

export function plans(entry: AgentComponent): ActionPlan[] {
  const out: ActionPlan[] = []
  for (const action of entry.actions) {
    if (action === "press") {
      const buttons = Array.isArray(entry.buttons) ? entry.buttons.filter((b): b is string => typeof b === "string") : []
      if (buttons.length) for (const name of buttons) out.push({ kind: "run", action, label: `Press “${short(name, 18)}”`, args: [name] })
      else out.push({ kind: "run", action, label: "Press", args: [] })
      continue
    }
    if (immediate.has(action)) { out.push({ kind: "run", action, label: words(action), args: [] }); continue }
    const setter = /^set([A-Z].*)$/.exec(action)
    if (setter) {
      const key = setter[1].charAt(0).toLowerCase() + setter[1].slice(1)
      const current = entry[key]
      if (typeof current === "boolean" || key in booleanSetter) {
        const [on, off] = booleanSetter[key] ?? [`${words(key)} on`, `${words(key)} off`]
        const next = !current
        out.push({ kind: "run", action, label: next ? on : off, args: [next] })
        continue
      }
      if (key === "value" && entry.items?.length) {
        out.push({ kind: "choose", action, label: "Set value", choices: entry.items, multiple: Array.isArray(entry.value) })
        continue
      }
      if (key === "value" && Array.isArray(entry.value)) {
        out.push({ kind: "json", action, label: "Set value", initial: JSON.stringify([entry.value]) })
        continue
      }
      if (typeof current === "number" || (key === "value" && ("min" in entry || "max" in entry))) {
        out.push({ kind: "number", action, label: words(action), initial: current === undefined || current === null ? "" : String(current) })
        continue
      }
      if (typeof current === "string" || current === null || current === undefined) {
        out.push({ kind: "text", action, label: words(action), initial: "" })
        continue
      }
    }
    out.push({ kind: "json", action, label: words(action), initial: "[]" })
  }
  return out
}

/** The call as an agent would write it, for the line under a run. */
export function callText(action: string, args: unknown[]) {
  return `${action}(${args.map((arg) => JSON.stringify(arg)).join(", ")})`
}

/** Whether a component's options can be read with `query`, beyond those in the snapshot. */
export function hasChoices(entry: AgentComponent) {
  return !entry.items?.length && (entry.actions.includes("setQuery") ||
    ["select", "combobox", "autocomplete", "listbox", "command", "radio-group", "toggle-group"].includes(entry.component))
}
