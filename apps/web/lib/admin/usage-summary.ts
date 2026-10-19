import { COPY_EVENTS, type CopyEventName } from "../copy-events"
import { isCrawlerClient, type UsageKind } from "../usage"

type Row = { label: string; count: number }
export type UsageCount = { day: string; kind: UsageKind; item: string; client: string; count: number }
export type Usage = {
  totals: Record<UsageKind, number>
  allTime: Record<UsageKind, number>
  registryByItem: { item: string; cli: number; browser: number; crawler: number; other: number }[]
  cutsByDay: Row[]
  otherRegistryByDay: Row[]
  registryClients: Row[]
  copyEvents: { event: CopyEventName; page: string; component: string; count: number }[]
  mcpTools: Row[]
  mcpClients: Row[]
  agentItems: Row[]
  agentClients: Row[]
}

const add = (map: Map<string, number>, key: string, count: number) => map.set(key, (map.get(key) ?? 0) + count)
const top = (map: Map<string, number>, limit = 20): Row[] => [...map].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, limit)
const daily = (map: Map<string, number>): Row[] => [...map].map(([label, count]) => ({ label, count })).sort((a, b) => b.label.localeCompare(a.label))
const emptyTotals = (): Record<UsageKind, number> => ({ install: 0, mcp: 0, agent: 0, install_copy: 0, agent_prompt_copy: 0, theme_copy: 0, theme_share: 0 })

/** Registry GETs and clipboard intent stay separate; neither measures unique users or successful installs. */
export function summarizeUsage(counts: UsageCount[], all: { kind: UsageKind; count: number }[]): Usage {
  const totals = emptyTotals()
  const allTime = emptyTotals()
  for (const r of all) if (Object.hasOwn(allTime, r.kind)) allTime[r.kind] = r.count
  const items = new Map<string, Usage["registryByItem"][number]>()
  const copies = new Map<string, Usage["copyEvents"][number]>()
  const [cuts, otherRegistry, registryClients, mcpTools, mcpClients, agentItems, agentClients] = Array.from({ length: 7 }, () => new Map<string, number>())

  for (const r of counts) {
    if (!Object.hasOwn(totals, r.kind)) continue
    totals[r.kind] += r.count
    if (r.kind === "install") {
      const entry = items.get(r.item) ?? { item: r.item, cli: 0, browser: 0, crawler: 0, other: 0 }
      if (r.client === "cli") entry.cli += r.count
      else if (r.client === "browser") entry.browser += r.count
      else if (isCrawlerClient(r.client)) entry.crawler += r.count
      else entry.other += r.count
      items.set(r.item, entry)
      add(registryClients, r.client, r.count)
      if (r.client === "cli" && r.item !== "registry") add(r.item === "cuts" ? cuts : otherRegistry, r.day, r.count)
    } else if (r.kind === "mcp") {
      if (r.item === "initialize") add(mcpClients, r.client, r.count)
      else add(mcpTools, r.item.replace(/^tool:/, ""), r.count)
    } else if (r.kind === "agent") {
      add(agentItems, r.item, r.count)
      add(agentClients, r.client, r.count)
    } else if (COPY_EVENTS.includes(r.kind)) {
      const key = `${r.kind}:${r.item}:${r.client}`
      const entry = copies.get(key) ?? { event: r.kind, page: r.item, component: r.client, count: 0 }
      entry.count += r.count
      copies.set(key, entry)
    }
  }
  return {
    totals,
    allTime,
    registryByItem: [...items.values()].sort((a, b) => b.cli - a.cli || b.browser - a.browser),
    cutsByDay: daily(cuts),
    otherRegistryByDay: daily(otherRegistry),
    registryClients: top(registryClients),
    copyEvents: [...copies.values()].sort((a, b) => b.count - a.count),
    mcpTools: top(mcpTools),
    mcpClients: top(mcpClients),
    agentItems: top(agentItems, 25),
    agentClients: top(agentClients),
  }
}
