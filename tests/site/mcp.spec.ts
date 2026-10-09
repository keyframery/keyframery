import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client"

import { KINDS } from "../../apps/web/lib/kinds"
import { decode, PROFILES, serializeTheme, themeAgentPrompt, toCode, toInstall } from "../../apps/web/lib/theme-url"
import { expect, test } from "./kit"

// The server doesn't depend on the browser: run it once, in the chromium project.
test.beforeEach(({}, info) => test.skip(info.project.name !== "chromium", "browser-independent"))

type ToolResult = { content: { type: string; text?: string }[]; isError?: boolean }
const textOf = (r: ToolResult) => r.content.map((c) => c.text ?? "").join("\n")

async function connect() {
  const client = new Client({ name: "keyframery-tests", version: "1.0.0" })
  await client.connect(new StreamableHTTPClientTransport(new URL("http://localhost:4500/mcp")))
  return client
}
const call = async (client: Client, name: string, args: Record<string, unknown> = {}) => (await client.callTool({ name, arguments: args })) as ToolResult

test("the server names itself, explains Keyframery and offers exactly four read-only tools", async () => {
  const client = await connect()
  expect(client.getServerVersion()?.name).toBe("keyframery")
  expect(client.getInstructions()).toContain("list_kinds")
  expect(client.getInstructions()).toContain("npx shadcn add @keyframery/cuts")
  expect(client.getInstructions()).toContain('Unknown registry "@keyframery"')
  const { tools } = await client.listTools()
  expect(tools.map((t) => t.name).sort()).toEqual(["get_doc", "list_kinds", "make_theme", "search_docs"])
  for (const t of tools) expect(t.annotations?.readOnlyHint).toBe(true)
  await client.close()
})

test("list_kinds names <Cuts />, the five helpers and links their docs", async () => {
  const client = await connect()
  const md = textOf(await call(client, "list_kinds"))
  expect(md).toContain("<Cuts />")
  for (const h of ["MatchCut", "ListCut", "ValueCut", "LoadCut", "StateCut"]) expect(md).toContain(h)
  expect(md).toContain("https://keyframery.com/docs/helpers/list-cut")
  expect(md).toContain("https://keyframery.com/docs/helpers/state-cut")
  await client.close()
})

test("search_docs finds pages, strips highlight tags, and never errors on odd queries", async () => {
  const client = await connect()
  const hit = await call(client, "search_docs", { query: "ListCut" })
  expect(hit.isError).toBeFalsy()
  expect(textOf(hit)).toContain("https://keyframery.com/docs/helpers/list-cut")
  expect(textOf(hit)).not.toContain("<mark>")
  const none = await call(client, "search_docs", { query: "zzqxvy" })
  expect(none.isError).toBeFalsy()
  expect(textOf(none)).toContain("No docs match")
  expect((await call(client, "search_docs", { query: "<Cuts />" })).isError).toBeFalsy()
  await client.close()
})

test("get_doc accepts every way of naming a page, and lists the valid paths for a wrong one", async () => {
  const client = await connect()
  for (const path of ["installation", "/docs/installation", "installation/", "installation.mdx", "https://keyframery.com/docs/installation#install-the-layer"]) {
    const r = await call(client, "get_doc", { path })
    expect(r.isError, path).toBeFalsy()
    expect(textOf(r), path).toContain("npx shadcn add @keyframery/cuts")
    expect(textOf(r), path).not.toContain("<Steps>")
  }
  for (const path of ["index", "", "   "]) expect(textOf(await call(client, "get_doc", { path })), JSON.stringify(path)).toContain("# Introduction")
  const wrong = await call(client, "get_doc", { path: "helpers/nope" })
  expect(wrong.isError).toBe(true)
  expect(textOf(wrong)).toContain("helpers/list-cut")
  for (const k of KINDS) expect((await call(client, "get_doc", { path: k.docs })).isError, k.docs).toBeFalsy()
  await client.close()
})

test("make_theme returns the <Cuts /> line, the CSS and a Theme page link, and rejects bad values", async () => {
  const client = await connect()
  const t = textOf(await call(client, "make_theme", { pace: 1.5, dialog: "punch-in", blur: 4 }))
  expect(t).toContain('<Cuts dialog="punch-in" pace={1.5} />')
  expect(t).toContain("--kf-blur: 4px;")
  expect(t).toContain("https://keyframery.com/theme?dialog=punch-in&pace=1.5&blur=4")
  const plain = textOf(await call(client, "make_theme", {}))
  expect(plain).toContain("<Cuts />")
  expect(plain).toContain("No CSS needed")
  const bad = await call(client, "make_theme", { pace: 9 })
  expect(bad.isError).toBe(true)
  await client.close()
})

test("make_theme applies a complete profile before overrides and uses the same reusable handoff as the builder", async () => {
  const client = await connect()
  for (const profile of ["quiet", "crisp", "expressive"] as const) {
    const preset = PROFILES[profile].settings
    const response = await call(client, "make_theme", { profile })
    expect(response.isError).toBeFalsy()
    const text = textOf(response)
    expect(text).toContain(toInstall(preset))
    expect(text).toContain(themeAgentPrompt(preset))
    expect(text).toContain(serializeTheme(preset, PROFILES[profile].label))
    const preview = text.match(/Open it in the Theme page: https:\/\/keyframery\.com\/theme(?:\?([^\n]*))?/)
    expect(preview).not.toBeNull()
    expect(decode(preview?.[1] ?? "")).toEqual(preset)
  }
  const changed = { menus: { ...PROFILES.quiet.settings.menus, dialog: "rack-focus" }, vars: { ...PROFILES.quiet.settings.vars, pace: 1.5, blur: 4 } }
  const overrides = textOf(await call(client, "make_theme", { profile: "quiet", dialog: "rack-focus", pace: 1.5, blur: 4 }))
  expect(overrides).toContain(toCode(changed).jsx)
  expect(overrides).toContain(toCode(changed).css)
  expect(overrides).toContain(toInstall(changed))
  expect(PROFILES.quiet.settings.vars.pace).toBe(0.9)
  for (const input of [{ profile: "loud" }, { ease: "toString" }, { profile: "crisp", unknown: true }]) {
    expect((await call(client, "make_theme", input)).isError).toBe(true)
  }
  await client.close()
})

test("a 2026-07-28 client can use the tools but can't hold a listen stream open", async () => {
  const client = new Client({ name: "keyframery-tests", version: "1.0.0" }, { versionNegotiation: { mode: { pin: "2026-07-28" } } })
  await client.connect(new StreamableHTTPClientTransport(new URL("http://localhost:4500/mcp")))
  expect(textOf(await call(client, "list_kinds"))).toContain("<Cuts />")
  // The tools never change, so a listen stream would only hold a serverless function open.
  await expect(client.listen({ toolsListChanged: true })).rejects.toThrow()
  await client.close()
})

test("opening /mcp in a browser doesn't crash the server", async ({ request }) => {
  const res = await request.get("/mcp")
  expect(res.status()).toBeLessThan(500)
})
