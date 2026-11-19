import assert from "node:assert/strict"
import fs from "node:fs"
import http from "node:http"
import { createRequire } from "node:module"
import test from "node:test"
import ts from "typescript"

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8")
const compile = (path, dependencies = {}) => {
  const { outputText } = ts.transpileModule(read(path), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } })
  const exports = {}
  new Function("exports", "require", outputText)(exports, (name) => {
    if (!(name in dependencies)) throw new Error(`unexpected import ${name}`)
    return dependencies[name]
  })
  return exports
}

const require = createRequire(import.meta.url)
const neon = require("@neondatabase/serverless")
const { classifyClient, classifyRequest, recordUsage, recordEvent, recordHit, visitorCode, utcDay, requestFacts } = compile("../../site/lib/usage.ts", { "@neondatabase/serverless": neon })
const templates = compile("../../site/lib/templates.ts")
const copyEvents = compile("../../site/lib/copy-events.ts", { "./templates": templates })
const { parseCopyEvent } = copyEvents
const { parseBeacon, readBeacon, allowHit, externalReferrer } = compile("../../site/lib/beacon.ts", { "./copy-events": copyEvents })

test("names the client without keeping its user agent", () => {
  assert.equal(classifyClient("node"), "cli")
  assert.equal(classifyClient("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15"), "browser")
  assert.equal(classifyClient("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)"), "ClaudeBot")
  assert.equal(classifyClient("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot"), "GPTBot")
  assert.equal(classifyClient("claude-code/2.1.0"), "Claude Code")
  assert.equal(classifyClient("curl/8.7.1"), "script")
  assert.equal(classifyClient("SomeCrawler/2.0 (+https://example.com/bot)"), "other-bot")
  assert.equal(classifyClient("   "), "unknown")
  assert.equal(classifyClient(null), "unknown")
})

test("counts registry downloads, including presets and fonts, as install", () => {
  assert.deepEqual(classifyRequest("GET", "/r/tabs.json", false), { kind: "install", item: "tabs" })
  assert.deepEqual(classifyRequest("GET", "/r/registry.json", false), { kind: "install", item: "registry" })
  assert.deepEqual(classifyRequest("GET", "/r/preset-k0.json", false), { kind: "install", item: "preset-k0" })
  assert.deepEqual(classifyRequest("GET", "/r/preset-k2Bf9Q.json", false), { kind: "install", item: "preset-k2Bf9Q" })
  assert.deepEqual(classifyRequest("GET", "/r/font-geist-mono.json", false), { kind: "install", item: "font-geist-mono" })
  assert.equal(classifyRequest("HEAD", "/r/tabs.json", false), null)
  assert.equal(classifyRequest("GET", "/r/Tabs.json", false), null)
  assert.equal(classifyRequest("GET", "/r/../secret.json", false), null)
  assert.equal(classifyRequest("GET", "/r/tabs", false), null)
})

test("counts agent files and Markdown reads as agent, and nothing else", () => {
  assert.deepEqual(classifyRequest("GET", "/llms.txt", false), { kind: "agent", item: "/llms.txt" })
  assert.deepEqual(classifyRequest("GET", "/llms-full.txt", false), { kind: "agent", item: "/llms-full.txt" })
  assert.deepEqual(classifyRequest("GET", "/.well-known/agent-skills/index.json", false), { kind: "agent", item: "/.well-known/agent-skills/index.json" })
  assert.deepEqual(classifyRequest("GET", "/docs/components/tabs.mdx", false), { kind: "agent", item: "/docs/components/tabs.md" })
  assert.deepEqual(classifyRequest("GET", "/docs/components/tabs.md", false), { kind: "agent", item: "/docs/components/tabs.md" })
  assert.deepEqual(classifyRequest("GET", "/blog/shadcn-skill-vs-mcp.md", false), { kind: "agent", item: "/blog/shadcn-skill-vs-mcp.md" })
  assert.deepEqual(classifyRequest("GET", "/index.md", false), { kind: "agent", item: "/index.md" })
  assert.deepEqual(classifyRequest("GET", "/docs/installation", true), { kind: "agent", item: "/docs/installation.md" })
  assert.deepEqual(classifyRequest("GET", "/", true), { kind: "agent", item: "/index.md" })
  assert.equal(classifyRequest("GET", "/docs/installation", false), null)
  assert.equal(classifyRequest("GET", "/", false), null)
  assert.equal(classifyRequest("POST", "/llms.txt", false), null)
  assert.equal(classifyRequest("GET", "/docs/<script>.md", false), null)
})

test("recordUsage does nothing without DATABASE_URL and never throws when the database is unreachable", async () => {
  const saved = process.env.DATABASE_URL
  const warn = console.warn
  const warnings = []
  console.warn = (...args) => warnings.push(args.join(" "))
  try {
    delete process.env.DATABASE_URL
    assert.equal(await recordUsage({ kind: "install", item: "tabs", client: "cli" }), undefined)
    assert.equal(await recordEvent({ kind: "install", item: "tabs", client: "cli", visitor: null, country: null }), undefined)
    assert.equal(await recordHit({ kind: "install", item: "tabs", client: "cli" }, { kind: "install", item: "tabs" }, { ip: "203.0.113.42", country: null, client: "cli" }), undefined)
    assert.equal(warnings.length, 0)

    // A port nothing listens on, on this machine: the write fails, and the failure is only logged.
    process.env.DATABASE_URL = "postgresql://user:password@127.0.0.1:9/nowhere"
    const started = Date.now()
    await assert.doesNotReject(recordUsage({ kind: "install", item: "tabs", client: "cli" }))
    assert.ok(Date.now() - started < 5000, "gives up within the timeout")
    assert.equal(warnings.length, 1)
    assert.match(warnings[0], /^usage: not recorded:/)

    // A database that accepts the request and never answers: the 4 s timeout ends the wait, and nothing is thrown.
    const silent = http.createServer(() => {})
    await new Promise((resolve) => silent.listen(0, "127.0.0.1", resolve))
    const endpoint = neon.neonConfig.fetchEndpoint
    neon.neonConfig.fetchEndpoint = () => `http://127.0.0.1:${silent.address().port}/sql`
    try {
      process.env.DATABASE_URL = "postgresql://user:password@ep-silent.example.com/nowhere"
      const waited = Date.now()
      await assert.doesNotReject(recordUsage({ kind: "agent", item: "/llms.txt", client: "ClaudeBot" }))
      const took = Date.now() - waited
      assert.ok(took >= 3500 && took < 6000, `gave up after ${took} ms`)
      assert.equal(warnings.length, 2)
    } finally {
      neon.neonConfig.fetchEndpoint = endpoint
      silent.closeAllConnections()
      silent.close()
    }
  } finally {
    console.warn = warn
    if (saved === undefined) delete process.env.DATABASE_URL
    else process.env.DATABASE_URL = saved
  }
})

test("copy events accept only the actions the site sends", () => {
  const ok = (event, page, component) => assert.deepEqual(parseCopyEvent({ event, page, component }), { event, page, component })
  const no = (value) => assert.equal(parseCopyEvent(value), null)
  ok("install_copy", "/", "install-command")
  ok("install_copy", "/create", "preset")
  ok("agent_prompt_copy", "/", "agent-prompt-button")
  ok("agent_prompt_copy", "/docs/ai-tools", "agent-prompt-button")
  ok("agent_prompt_copy", "/docs/templates/round", "template-round")
  no({ event: "install_copy", page: "/create", component: "install-command" })
  no({ event: "agent_prompt_copy", page: "/docs/templates/round", component: "template-nope" })
  no({ event: "agent_prompt_copy", page: "/docs/templates/other", component: "template-round" })
  no({ event: "agent_prompt_copy", page: "/docs/../admin", component: "agent-prompt-button" })
  no({ event: "theme_copy", page: "/create", component: "preset" })
  no({ event: "install_copy", page: "/", component: "install-command", clipboard: "secret" })
  no(null)
  no([])
})

test("the collector validates same-origin JSON or beacon text, and caps the body", async () => {
  const copy = { type: "copy", event: "install_copy", page: "/", component: "install-command" }
  const request = (body, headers = {}) => new Request("https://keyframery.com/api/events", {
    method: "POST",
    headers: { Origin: "https://keyframery.com", "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  })
  const accepted = { ok: true, beacon: { type: "copy", copy: { event: "install_copy", page: "/", component: "install-command" } } }
  assert.deepEqual(await readBeacon(request(copy, { "Sec-Fetch-Site": "same-origin" })), accepted)
  assert.deepEqual(await readBeacon(request(copy, { "Content-Type": "text/plain;charset=UTF-8" })), accepted)
  assert.deepEqual(await readBeacon(request(copy, { Origin: "https://elsewhere.example" })), { ok: false, status: 403 })
  assert.deepEqual(await readBeacon(request(copy, { Origin: "null" })), { ok: false, status: 403 })
  assert.deepEqual(await readBeacon(request(copy, { "Sec-Fetch-Site": "cross-site" })), { ok: false, status: 403 })
  assert.deepEqual(await readBeacon(request(copy, { "Content-Type": "application/x-www-form-urlencoded" })), { ok: false, status: 415 })
  assert.deepEqual(await readBeacon(request(copy, { "Content-Length": "10000" })), { ok: false, status: 413 })
  assert.deepEqual(await readBeacon(request({ type: "view", path: "/" + "x".repeat(1100) })), { ok: false, status: 413 })
  assert.deepEqual(await readBeacon(request("{")), { ok: false, status: 400 })
  assert.deepEqual(await readBeacon(request({ type: "view", path: "/docs" })), { ok: true, beacon: { type: "view", path: "/docs", referrer: null } })
})

test("beacon bodies: page views and copies of the right shape only", () => {
  assert.deepEqual(parseBeacon({ type: "view", path: "/" }), { type: "view", path: "/", referrer: null })
  assert.deepEqual(parseBeacon({ type: "view", path: "/docs/components/tabs", referrer: "www.google.com" }), { type: "view", path: "/docs/components/tabs", referrer: "www.google.com" })
  assert.deepEqual(parseBeacon({ type: "copy", event: "agent_prompt_copy", page: "/docs/ai-tools", component: "agent-prompt-button" }), {
    type: "copy",
    copy: { event: "agent_prompt_copy", page: "/docs/ai-tools", component: "agent-prompt-button" },
  })
  for (const bad of [
    null,
    [],
    "view",
    { type: "click", path: "/" },
    { type: "view" },
    { type: "view", path: "docs" },
    { type: "view", path: "/docs?q=secret" },
    { type: "view", path: "/docs/../admin" },
    { type: "view", path: "//evil.example/x" },
    { type: "view", path: "/a<b>" },
    { type: "view", path: "/" + "a".repeat(201) },
    { type: "view", path: "/", referrer: "https://www.google.com/search?q=me" },
    { type: "view", path: "/", referrer: "localhost" },
    { type: "view", path: "/", referrer: 5 },
    { type: "view", path: "/", visitor: "abc" },
    { type: "copy", event: "install_copy", page: "/", component: "install-command", text: "copied" },
    { type: "copy", event: "theme_copy", page: "/create", component: "preset" },
  ]) assert.equal(parseBeacon(bad), null, JSON.stringify(bad))
  assert.equal(externalReferrer("keyframery.com", "https://keyframery.com/api/events"), null)
  assert.equal(externalReferrer("github.com", "https://keyframery.com/api/events"), "github.com")
})

test("the per-visitor rate limit lets a person through and stops a flood", () => {
  const t = 1_000_000
  for (let i = 0; i < 30; i++) assert.equal(allowHit("rate-a", t + i), true)
  assert.equal(allowHit("rate-a", t + 31), false)
  assert.equal(allowHit("rate-b", t + 31), true, "another visitor has its own budget")
  assert.equal(allowHit("rate-a", t + 60_000), true, "a new minute starts again")
})

test("the visitor code: one per IP per UTC day, never the IP itself", async () => {
  const secret = "postgresql://user:password@ep-example.neon.tech/db"
  const ip = "203.0.113.42"
  const a = await visitorCode(ip, "2026-11-19", secret)
  assert.match(a, /^[0-9a-f]{16}$/)
  assert.equal(await visitorCode(ip, "2026-11-19", secret), a, "same IP, same day")
  assert.notEqual(await visitorCode(ip, "2026-11-20", secret), a, "next day")
  assert.notEqual(await visitorCode("203.0.113.43", "2026-11-19", secret), a, "another IP")
  assert.notEqual(await visitorCode(ip, "2026-11-19", secret + "x"), a, "another secret")
  assert.ok(!a.includes(ip) && !a.includes(ip.replaceAll(".", "")), "the IP is not in the code")
  assert.equal(await visitorCode(null, "2026-11-19", secret), null)
  assert.equal(await visitorCode(ip, "2026-11-19", undefined), null)
  assert.equal(utcDay(new Date("2026-11-19T23:59:59Z")), "2026-11-19")
  assert.equal(utcDay(new Date("2026-11-20T00:00:00Z")), "2026-11-20")

  const headers = (h) => new Headers({ "user-agent": "node", ...h })
  assert.deepEqual(requestFacts(headers({ "x-forwarded-for": "203.0.113.42, 10.0.0.1", "x-real-ip": "10.9.9.9", "x-vercel-ip-country": "IN" })), { ip: "203.0.113.42", country: "IN", client: "cli" })
  assert.deepEqual(requestFacts(headers({ "x-real-ip": "198.51.100.7" })), { ip: "198.51.100.7", country: null, client: "cli" })
  assert.deepEqual(requestFacts(headers({ "x-vercel-ip-country": "India" })), { ip: null, country: null, client: "cli" })
})

test("a missing usage_events table is swallowed once and never retried", async () => {
  let calls = 0
  const fake = {
    neon: () => async () => {
      calls += 1
      throw Object.assign(new Error('relation "usage_events" does not exist'), { code: "42P01" })
    },
  }
  const fresh = compile("../../site/lib/usage.ts", { "@neondatabase/serverless": fake })
  const saved = process.env.DATABASE_URL
  const warn = console.warn
  const warnings = []
  console.warn = (...args) => warnings.push(args.join(" "))
  try {
    process.env.DATABASE_URL = "postgresql://user:password@ep-example.neon.tech/db"
    const event = { kind: "view", item: "/", client: "browser", visitor: null, country: null }
    await assert.doesNotReject(fresh.recordEvent(event))
    await assert.doesNotReject(fresh.recordEvent(event))
    await assert.doesNotReject(fresh.recordHit(null, { kind: "view", item: "/docs" }, { ip: "203.0.113.42", country: "IN", client: "browser" }))
    assert.equal(calls, 1, "one insert tried, then the event log stays off")
    assert.equal(warnings.length, 1)
    assert.match(warnings[0], /usage_events does not exist yet/)
    assert.ok(!warnings[0].includes("203.0.113.42"))
  } finally {
    console.warn = warn
    if (saved === undefined) delete process.env.DATABASE_URL
    else process.env.DATABASE_URL = saved
  }
})

