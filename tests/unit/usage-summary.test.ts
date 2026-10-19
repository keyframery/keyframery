import { describe, expect, it } from "vitest"

import { summarizeUsage, type UsageCount } from "../../apps/web/lib/admin/usage-summary"

const row = (kind: UsageCount["kind"], item: string, client: string, count: number): UsageCount => ({ day: "2026-10-19", kind, item, client, count })

describe("usage dashboard aggregation", () => {
  it("separates Cuts CLI-like requests from helper, dependency, index, browser and crawler requests", () => {
    const summary = summarizeUsage([
      row("install", "cuts", "cli", 3),
      row("install", "cuts", "browser", 4),
      row("install", "cuts", "OAI-SearchBot", 5),
      row("install", "cuts", "other-bot", 6),
      row("install", "cuts", "script", 7),
      row("install", "list-cut", "cli", 8),
      row("install", "engine", "cli", 9),
      row("install", "registry", "cli", 10),
    ], [{ kind: "install", count: 100 }])
    expect(summary.cutsByDay).toEqual([{ label: "2026-10-19", count: 3 }])
    expect(summary.otherRegistryByDay).toEqual([{ label: "2026-10-19", count: 17 }])
    expect(summary.registryByItem.find((item) => item.item === "cuts")).toEqual({ item: "cuts", cli: 3, browser: 4, crawler: 11, other: 7 })
    expect(summary.registryClients).toContainEqual({ label: "cli", count: 30 })
    expect(summary.totals.install).toBe(52)
    expect(summary.allTime.install).toBe(100)
  })

  it("groups successful copies by action, page and component without mixing them into agent reads", () => {
    const summary = summarizeUsage([
      row("install_copy", "/", "install-command", 2),
      { ...row("install_copy", "/", "install-command", 3), day: "2026-10-18" },
      row("install_copy", "/theme", "theme-builder", 4),
      row("agent_prompt_copy", "/", "agent-prompt-button", 6),
      row("agent", "/llms.txt", "ClaudeBot", 7),
      row("mcp", "tool:get_doc", "cli", 8),
      row("mcp", "initialize", "Cursor", 9),
    ], [{ kind: "install_copy", count: 20 }])
    expect(summary.copyEvents).toHaveLength(3)
    expect(summary.copyEvents).toContainEqual({ event: "install_copy", page: "/", component: "install-command", count: 5 })
    expect(summary.totals.install_copy).toBe(9)
    expect(summary.allTime.install_copy).toBe(20)
    expect(summary.totals.install).toBe(0)
    expect(summary.agentItems).toEqual([{ label: "/llms.txt", count: 7 }])
    expect(summary.mcpTools).toEqual([{ label: "get_doc", count: 8 }])
    expect(summary.mcpClients).toEqual([{ label: "Cursor", count: 9 }])
  })
})
