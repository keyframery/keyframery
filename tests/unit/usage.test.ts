import { describe, expect, it } from "vitest"

import { classifyClient, classifyRequest } from "../../apps/web/lib/usage"

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
    expect(classifyRequest("GET", "/.well-known/agent-skills/index.json", false)).toEqual({ kind: "agent", item: "/.well-known/agent-skills/index.json" })
    expect(classifyRequest("GET", "/docs/helpers/list-cut.mdx", false)).toEqual({ kind: "agent", item: "/docs/helpers/list-cut.md" })
    expect(classifyRequest("GET", "/docs/installation", true)).toEqual({ kind: "agent", item: "/docs/installation.md" })
    expect(classifyRequest("GET", "/", true)).toEqual({ kind: "agent", item: "/index.md" })
    expect(classifyRequest("GET", "/docs/installation", false)).toBeNull()
    expect(classifyRequest("GET", "/r/../secret.json", false)).toBeNull()
    expect(classifyRequest("GET", "/docs/<script>.md", false)).toBeNull()
  })
})
