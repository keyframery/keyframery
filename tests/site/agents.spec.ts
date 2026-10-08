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
