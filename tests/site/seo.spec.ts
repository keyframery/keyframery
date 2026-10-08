import fs from "node:fs"
import http from "node:http"
import path from "node:path"

import type { Page } from "@playwright/test"

import { expect, test } from "./kit"

const BASE = "https://keyframery.com"

// Crawling every page once is enough: tags are the same in every browser.
test.beforeEach(({}, info) => test.skip(info.project.name !== "chromium", "one browser crawls"))

async function sitemapPaths(request: import("@playwright/test").APIRequestContext) {
  const xml = await (await request.get("/sitemap.xml")).text()
  return [...xml.matchAll(/<loc>https:\/\/keyframery\.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/")
}

const meta = (page: Page, selector: string) => page.locator(selector).first().getAttribute("content")

/** Every JSON-LD node on the page, with @graph flattened. */
async function structuredData(page: Page) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.flatMap((b) => {
    const data = JSON.parse(b)
    return Array.isArray(data["@graph"]) ? data["@graph"] : [data]
  }) as { "@type": string; [key: string]: unknown }[]
}

test("every page has a search title, a description, one H1, a canonical URL and full social tags", async ({ page, request }) => {
  test.setTimeout(180_000)
  const paths = await sitemapPaths(request)
  expect(paths.length).toBeGreaterThan(25)
  const titles = new Map<string, string>()
  const descriptions = new Map<string, string>()
  for (const p of paths) {
    await page.goto(p)
    const title = await page.title()
    expect(title.length, `${p} title "${title}"`).toBeLessThanOrEqual(60)
    expect(title, p).toContain("Keyframery")
    const description = (await meta(page, 'meta[name="description"]')) ?? ""
    expect(description.length, `${p} description "${description}"`).toBeGreaterThanOrEqual(70)
    expect(description.length, `${p} description "${description}"`).toBeLessThanOrEqual(160)
    await expect(page.locator("h1"), p).toHaveCount(1)
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href")
    expect(canonical?.replace(/\/$/, ""), p).toBe(`${BASE}${p === "/" ? "" : p}`)
    expect(await meta(page, 'meta[property="og:url"]'), p).toBe(canonical)
    expect(await meta(page, 'meta[property="og:site_name"]'), p).toBe("Keyframery")
    expect(await meta(page, 'meta[property="og:title"]'), p).toBeTruthy()
    expect(await meta(page, 'meta[property="og:description"]'), p).toBe(description)
    expect(await meta(page, 'meta[property="og:image"]'), p).toMatch(/^https:\/\/keyframery\.com\//)
    expect(await meta(page, 'meta[name="twitter:card"]'), p).toBe("summary_large_image")
    titles.set(title, (titles.get(title) ?? "") + ` ${p}`)
    descriptions.set(description, (descriptions.get(description) ?? "") + ` ${p}`)
  }
  expect([...titles.entries()].filter(([, ps]) => ps.trim().includes(" ")), "duplicate titles").toEqual([])
  expect([...descriptions.entries()].filter(([, ps]) => ps.trim().includes(" ")), "duplicate descriptions").toEqual([])
})

test("pages are titled the way people search, with headings that say what the page is", async ({ page }) => {
  for (const [p, title, h1] of [
    ["/", "Keyframery: the shadcn/ui animation library, in one line", "Add one line. Your shadcn/ui app animates."],
    ["/docs/components/dialog", "shadcn/ui Dialog animation: open and close | Keyframery", "Dialog animation"],
    ["/docs/helpers/list-cut", "React list animations for shadcn/ui | Keyframery", "List animations"],
    ["/docs/ai-tools", "Animations with Claude Code, Codex and Cursor | Keyframery", "Use with AI tools"],
  ]) {
    await page.goto(p)
    await expect(page, p).toHaveTitle(title)
    await expect(page.locator("h1"), p).toHaveText(h1)
  }
})

test("structured data describes the project, the maker, the FAQ and each docs page", async ({ page }) => {
  await page.goto("/")
  const home = await structuredData(page)
  const types = home.map((n) => n["@type"])
  for (const t of ["Organization", "WebSite", "SoftwareSourceCode", "FAQPage"]) expect(types, t).toContain(t)
  const code = home.find((n) => n["@type"] === "SoftwareSourceCode")!
  expect(code.codeRepository).toBe("https://github.com/keyframery/keyframery")
  const faq = home.find((n) => n["@type"] === "FAQPage") as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }
  const questions = await page.locator('section[aria-labelledby="faq-title"] h3').allTextContents()
  expect(faq.mainEntity.map((q) => q.name)).toEqual(questions.map((q) => q.trim()))
  for (const q of faq.mainEntity) expect(q.acceptedAnswer.text.length, q.name).toBeGreaterThan(20)

  await page.goto("/docs/helpers/list-cut")
  const doc = await structuredData(page)
  const article = doc.find((n) => n["@type"] === "TechArticle")!
  expect(article.url).toBe(`${BASE}/docs/helpers/list-cut`)
  const crumbs = doc.find((n) => n["@type"] === "BreadcrumbList") as { itemListElement: { position: number; name: string; item?: string }[] }
  expect(crumbs.itemListElement.map((c) => c.item ?? c.name)).toEqual([BASE, `${BASE}/docs`, `${BASE}/docs/helpers/list-cut`])
})

test("robots.txt lets every crawler in, AI ones included, and keeps them out of the API", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text()
  expect(robots).toMatch(/User-Agent: \*\nAllow: \/\nDisallow: \/api\/\nDisallow: \/mcp/)
  expect(robots).toContain(`Sitemap: ${BASE}/sitemap.xml`)
  // One group for everyone: no crawler, GPTBot or ClaudeBot included, gets its own rules.
  expect(robots.match(/User-Agent:/g)).toHaveLength(1)
})

test("docs pages point AI tools at their Markdown version", async ({ page, request }) => {
  for (const p of ["/docs", "/docs/helpers/list-cut"]) {
    await page.goto(p)
    const href = await page.locator('link[rel="alternate"][type="text/markdown"]').getAttribute("href")
    expect(href, p).toBe(`${BASE}${p}.mdx`)
    expect((await request.get(`${p}.mdx`)).status(), p).toBe(200)
  }
})

test("the vercel.app address redirects to keyframery.com, keeping the path", async ({}, info) => {
  const port = Number(new URL(info.project.use.baseURL ?? "http://localhost:4500").port || 4500)
  const res = await new Promise<http.IncomingMessage>((resolve, reject) =>
    http.get({ host: "localhost", port, path: "/docs/installation?x=1", headers: { Host: "keyframery.vercel.app" } }, resolve).on("error", reject),
  )
  res.resume()
  expect(res.statusCode).toBe(308)
  expect(res.headers.location).toBe(`${BASE}/docs/installation?x=1`)
})

test("the IndexNow key is published, so Bing accepts the site's URL submissions", async ({ request }) => {
  const dir = path.resolve(process.cwd(), "../apps/web/public")
  const keys = fs.readdirSync(dir).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f))
  expect(keys).toHaveLength(1)
  const key = keys[0].replace(".txt", "")
  expect((await (await request.get(`/${key}.txt`)).text()).trim()).toBe(key)
})

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#x27": "'", "#39": "'" }
const squash = (text: string) => text.replace(/\s+/g, " ").trim()

/** The text in the HTML the server sends, scripts left out: what a crawler that doesn't run JavaScript reads. */
async function crawlerText(request: import("@playwright/test").APIRequestContext, p: string) {
  const html = (await (await request.get(p)).text()).replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
  return squash(html.replace(/<[^>]+>/g, " ").replace(/&(amp|lt|gt|quot|#x27|#39);/g, (_, e) => ENTITIES[e]))
}

test("the home page's FAQ answers are in the HTML, not only behind a click", async ({ page, request }) => {
  const html = await crawlerText(request, "/")
  await page.goto("/")
  const faq = (await structuredData(page)).find((n) => n["@type"] === "FAQPage") as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }
  // Each answer's opening words, as written on the page.
  for (const q of faq.mainEntity) expect(html, q.name).toContain(squash(q.acceptedAnswer.text).slice(0, 40))
})

test("every framework's setup code is in the HTML, not only the first tab", async ({ request }) => {
  const html = await crawlerText(request, "/docs/installation")
  for (const file of ["app/layout.tsx", "src/main.tsx", "app/root.tsx"]) expect(html, file).toContain(file)
})

test("docs pages answer their own questions on the page and in structured data", async ({ page }) => {
  await page.goto("/docs/helpers/list-cut")
  const section = page.locator('section[aria-labelledby="questions"]')
  await expect(section.getByRole("heading", { level: 2, name: "Questions" })).toBeVisible()
  const questions = (await section.locator("h3").allTextContents()).map((q) => q.trim())
  expect(questions.length).toBeGreaterThanOrEqual(2)
  const faq = (await structuredData(page)).find((n) => n["@type"] === "FAQPage") as { mainEntity: { name: string }[] }
  expect(faq.mainEntity.map((q) => q.name)).toEqual(questions)
  // The same questions reach AI tools through the page's Markdown.
  expect(await (await page.request.get("/docs/helpers/list-cut.mdx")).text()).toContain(`### ${questions[0]}`)
})
