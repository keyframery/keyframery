import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

// Resolved from the tests package, like css.test.ts.
const root = path.resolve(process.cwd(), "..")
const file = (p: string) => path.join(root, p)
const json = (p: string) => JSON.parse(fs.readFileSync(file(p), "utf8"))

describe("Claude Code plugin", () => {
  it("lists the keyframery plugin in the keyframery marketplace, with matching names", () => {
    const market = json(".claude-plugin/marketplace.json")
    const plugin = json("plugins/keyframery/.claude-plugin/plugin.json")
    expect(market.name).toBe("keyframery")
    expect(market.plugins).toEqual([expect.objectContaining({ name: "keyframery", source: "./plugins/keyframery" })])
    expect(plugin.name).toBe("keyframery")
    expect(plugin.author).toEqual({ name: "Briyan Hingrajiya", email: "briyan@keyframery.com", url: "https://x.com/briyan_dev" })
    expect(plugin.privacyPolicyUrl).toBe("https://keyframery.com/privacy")
    expect(fs.existsSync(file("plugins/keyframery/logo.png"))).toBe(true)
  })

  it("connects the hosted MCP server and ships the skill", () => {
    expect(json("plugins/keyframery/.mcp.json")).toEqual({ mcpServers: { keyframery: { type: "http", url: "https://keyframery.com/mcp" } } })
    const skill = fs.readFileSync(file("plugins/keyframery/skills/keyframery/SKILL.md"), "utf8")
    expect(skill).toMatch(/^---\nname: keyframery\ndescription: .+\n---\n/)
    for (const tool of ["list_kinds", "search_docs", "get_doc", "make_theme"]) expect(skill).toContain(tool)
  })
})
