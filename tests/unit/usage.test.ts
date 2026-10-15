import { describe, expect, it } from "vitest"

import { classifyClient, classifyRequest, mcpHits } from "../../apps/web/lib/usage"

describe("usage counting", () => {
  it("names the client without keeping its user agent", () => {
    expect(classifyClient("node")).toBe("cli")
    expect(classifyClient("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15")).toBe("browser")
    expect(classifyClient("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)")).toBe("ClaudeBot")
    expect(classifyClient("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot")).toBe("GPTBot")
    expect(classifyClient("curl/8.7.1")).toBe("script")
    expect(classifyClient("SomeCrawler/2.0 (+https://example.com/bot)")).toBe("other-bot")
    expect(classifyClient(null)).toBe("unknown")
  })

  it("counts registry downloads, Markdown reads and agent files, and nothing else", () => {
    expect(classifyRequest("GET", "/r/cuts.json", false)).toEqual({ kind: "install", item: "cuts" })
    expect(classifyRequest("GET", "/r/registry.json", false)).toEqual({ kind: "install", item: "registry" })
    expect(classifyRequest("HEAD", "/r/cuts.json", false)).toBeNull()
    expect(classifyRequest("GET", "/llms.txt", false)).toEqual({ kind: "agent", item: "/llms.txt" })
    expect(classifyRequest("GET", "/.well-known/mcp/server-card.json", false)).toEqual({ kind: "agent", item: "/.well-known/mcp/server-card.json" })
    expect(classifyRequest("GET", "/docs/helpers/list-cut.mdx", false)).toEqual({ kind: "agent", item: "/docs/helpers/list-cut.md" })
    expect(classifyRequest("GET", "/docs/installation", true)).toEqual({ kind: "agent", item: "/docs/installation.md" })
    expect(classifyRequest("GET", "/", true)).toEqual({ kind: "agent", item: "/index.md" })
    expect(classifyRequest("GET", "/docs/installation", false)).toBeNull()
    expect(classifyRequest("GET", "/r/../secret.json", false)).toBeNull()
    expect(classifyRequest("GET", "/docs/<script>.md", false)).toBeNull()
  })

  it("counts MCP tool calls and the client named in initialize", () => {
    expect(mcpHits({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "search_docs", arguments: { query: "dialog" } } }, "cli")).toEqual([
      { kind: "mcp", item: "tool:search_docs", client: "cli" },
    ])
    expect(mcpHits({ jsonrpc: "2.0", id: 0, method: "initialize", params: { clientInfo: { name: "claude-code", version: "2.1" } } }, "cli")).toEqual([
      { kind: "mcp", item: "initialize", client: "claude-code" },
    ])
    expect(mcpHits([{ method: "tools/list" }, { method: "tools/call", params: { name: "get_doc" } }], "browser")).toEqual([
      { kind: "mcp", item: "tool:get_doc", client: "browser" },
    ])
    expect(mcpHits(null, "cli")).toEqual([])
    expect(mcpHits({ method: "tools/call", params: { name: "x".repeat(500) } }, "cli")[0].item).toHaveLength("tool:".length + 60)
  })
})
