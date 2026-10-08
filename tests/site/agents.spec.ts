import { expect, test } from "./kit"

// Content negotiation: an AI agent that asks for Markdown (Accept: text/markdown) gets Markdown at the same address,
// and a browser still gets HTML. Headers are the same in every browser, so one runs it.
test.beforeEach(({}, info) => test.skip(info.project.name !== "chromium", "one browser is enough"))

const NEGOTIATED = ["/", "/cuts", "/theme", "/docs", "/docs/installation", "/docs/compare"]

test("an agent asking for Markdown gets Markdown at the same address, in UTF-8", async ({ request }) => {
  for (const p of NEGOTIATED) {
    const res = await request.get(p, { headers: { Accept: "text/markdown" } })
    expect(res.status(), p).toBe(200)
    expect(res.headers()["content-type"], p).toBe("text/markdown; charset=utf-8")
    expect((await res.text()).startsWith("# "), p).toBe(true)
  }
})

test("a browser still gets HTML, and caches are told the address has both versions", async ({ request }) => {
  for (const p of NEGOTIATED) {
    for (const accept of ["text/markdown", "text/html,application/xhtml+xml"]) {
      const res = await request.get(p, { headers: { Accept: accept } })
      expect(res.headers()["vary"]?.toLowerCase(), `${p} ${accept}`).toContain("accept")
    }
    expect((await request.get(p, { headers: { Accept: "text/html" } })).headers()["content-type"], p).toContain("text/html")
  }
})

test("the home page's Markdown tells an agent what Keyframery is and how to install it", async ({ request }) => {
  const md = await (await request.get("/", { headers: { Accept: "text/markdown" } })).text()
  for (const fact of [
    "open-source motion layer for shadcn/ui",
    'npx shadcn registry add "@keyframery=https://keyframery.com/r/{name}.json"',
    "<Cuts />",
    "https://keyframery.com/mcp",
    "https://keyframery.com/docs/installation",
  ])
    expect(md, fact).toContain(fact)
})

test("pages with a Markdown version link to it, and the link works", async ({ page, request }) => {
  for (const [p, md] of [
    ["/", "/index.md"],
    ["/cuts", "/cuts.md"],
    ["/theme", "/theme.md"],
  ]) {
    await page.goto(p)
    await expect(page.locator('link[rel="alternate"][type="text/markdown"]'), p).toHaveAttribute("href", `https://keyframery.com${md}`)
    const res = await request.get(md)
    expect(res.status(), md).toBe(200)
    expect(res.headers()["content-type"], md).toBe("text/markdown; charset=utf-8")
  }
})

// Agent discovery files (isitagentready.com's checks), each describing only what Keyframery really offers.

test("the home page's Link headers point agents at the machine-readable files", async ({ request }) => {
  const link = (await request.get("/")).headers()["link"] ?? ""
  for (const rel of ['</.well-known/api-catalog>; rel="api-catalog"', 'rel="service-doc"', 'rel="service-desc"', 'rel="describedby"', '</index.md>; rel="alternate"; type="text/markdown"'])
    expect(link, rel).toContain(rel)
})

test("the API catalog lists the MCP server and the shadcn registry, each with a description and docs", async ({ request }) => {
  const res = await request.get("/.well-known/api-catalog")
  expect(res.status()).toBe(200)
  expect(res.headers()["content-type"]).toContain("application/linkset+json")
  const { linkset } = (await res.json()) as { linkset: { anchor: string; "service-desc": { href: string }[]; "service-doc": { href: string }[] }[] }
  expect(linkset.map((e) => e.anchor)).toEqual(["https://keyframery.com/mcp", "https://keyframery.com/r/registry.json"])
  for (const e of linkset) {
    expect(e["service-desc"].length, e.anchor).toBeGreaterThan(0)
    expect(e["service-doc"].length, e.anchor).toBeGreaterThan(0)
  }
})

test("the MCP server card matches the server it describes", async ({ request }) => {
  const card = await (await request.get("/.well-known/mcp/server-card.json")).json()
  expect(card.serverInfo).toEqual({ name: "keyframery", version: "0.2.0" })
  expect(card.url).toBe("https://keyframery.com/mcp")
  expect(card.transport).toEqual({ type: "streamable-http" })
  expect(card.capabilities).toEqual({ tools: true })
  const listed = await request.post("/mcp", {
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    data: { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } } },
  })
  expect(await listed.text()).toContain('"name":"keyframery","version":"0.2.0"')
})

test("the agent skills index publishes the Keyframery skill, and its digest matches the file", async ({ request }) => {
  const index = await (await request.get("/.well-known/agent-skills/index.json")).json()
  expect(index.$schema).toBe("https://schemas.agentskills.io/discovery/0.2.0/schema.json")
  expect(index.skills).toHaveLength(1)
  const [skill] = index.skills
  expect(skill).toMatchObject({ name: "keyframery", type: "skill-md", url: "/.well-known/agent-skills/keyframery/SKILL.md" })
  const res = await request.get(skill.url)
  expect(res.headers()["content-type"]).toBe("text/markdown; charset=utf-8")
  const bytes = await res.body()
  const { createHash } = await import("node:crypto")
  expect(skill.digest).toBe(`sha256:${createHash("sha256").update(bytes).digest("hex")}`)
  const { readFileSync } = await import("node:fs")
  expect(bytes.toString()).toBe(readFileSync(new URL("../../plugins/keyframery/skills/keyframery/SKILL.md", import.meta.url), "utf8"))
})

test("the ARD catalog lists the MCP server and the skill, with stable identifiers", async ({ page, request }) => {
  const res = await request.get("/.well-known/ai-catalog.json")
  expect(res.headers()["access-control-allow-origin"]).toBe("*")
  const catalog = await res.json()
  expect(catalog.specVersion).toBeTruthy()
  expect(catalog.host).toEqual({ displayName: "Keyframery", identifier: "did:web:keyframery.com" })
  for (const e of catalog.entries) {
    expect(e.identifier, e.displayName).toMatch(/^urn:air:keyframery\.com:/)
    expect("url" in e !== "data" in e, e.displayName).toBe(true)
    expect(e.representativeQueries.length, e.displayName).toBeGreaterThanOrEqual(2)
    // Entry URLs are absolute (keyframery.com); fetch them from the server under test.
    expect((await request.get(e.url.replace("https://keyframery.com", ""))).status(), e.url).toBe(200)
  }
  await page.goto("/")
  await expect(page.locator('link[rel="ai-catalog"]')).toHaveAttribute("href", "/.well-known/ai-catalog.json")
})

test("auth.md tells agents there's nothing to register for", async ({ request }) => {
  const res = await request.get("/auth.md")
  expect(res.headers()["content-type"]).toBe("text/markdown; charset=utf-8")
  const md = await res.text()
  expect(md.split("\n")[0]).toMatch(/^# .*auth\.md/)
  expect(md).toContain("No registration")
})

test("WebMCP: an in-browser agent gets read-only tools to search the docs and read pages", async ({ page }) => {
  // Stand in for a browser with WebMCP, recording what the page registers.
  await page.addInitScript(() => {
    const tools: Record<string, { description: string; execute: (input: unknown) => Promise<unknown> }> = {}
    ;(window as unknown as { __tools: typeof tools }).__tools = tools
    Object.defineProperty(document, "modelContext", { value: { registerTool: async (t: { name: string } & (typeof tools)[string]) => void (tools[t.name] = t) } })
  })
  await page.goto("/")
  await expect.poll(() => page.evaluate(() => Object.keys((window as unknown as { __tools: object }).__tools).sort())).toEqual(["get_install_steps", "read_page", "search_docs"])
  const found = await page.evaluate(() => (window as unknown as { __tools: Record<string, { execute: (i: unknown) => Promise<unknown> }> }).__tools.search_docs.execute({ query: "list" }))
  expect(JSON.stringify(found)).toContain("/docs/helpers/list-cut")
  expect((found as { path: string }[])[0].path).toBe("/docs/helpers/list-cut")
  const md = await page.evaluate(() => (window as unknown as { __tools: Record<string, { execute: (i: unknown) => Promise<unknown> }> }).__tools.read_page.execute({ path: "/docs/installation" }))
  expect(JSON.stringify(md)).toContain("# Quick start")
})
