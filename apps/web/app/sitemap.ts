import type { MetadataRoute } from "next"

import { allPosts, AUTHORS, authorPath } from "@/lib/blog"
import { CONTENT_MODIFIED } from "@/lib/content-modified"
import CONTENT_DATES from "@/lib/content-dates.json"
import { PRO_ENABLED } from "@/lib/pro"
import { source } from "@/lib/source"
import { UI_ORDER } from "@/lib/ui-library"

const base = "https://keyframery.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/ui", ...UI_ORDER.map((c) => `/ui/${c.slug}`), "/cuts", "/theme", ...(PRO_ENABLED ? ["/pro"] : [])].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 }))
  const legal = ["/privacy", "/terms"].map((p) => ({ url: `${base}${p}`, changeFrequency: "yearly" as const, priority: 0.3 }))
  const docs = source.getPages().filter((p) => !p.data.noindex).map((p) => ({ url: `${base}${p.url}`, changeFrequency: "weekly" as const, priority: 0.6 }))
  const posts = allPosts().map((p) => ({ url: `${base}${p.url}`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: p.data.updated ?? p.data.published }))
  const blogIndex = { url: `${base}/blog`, changeFrequency: "weekly" as const, priority: 0.7, lastModified: posts[0]?.lastModified }
  const authors = Object.values(AUTHORS).map((a) => ({ url: `${base}${authorPath(a)}`, changeFrequency: "monthly" as const, priority: 0.5 }))
  return [...pages, blogIndex, ...posts, ...authors, ...legal, ...docs].map((page) => {
    const path = new URL(page.url).pathname
    // The newer of a hand-checked date and the git content date (scripts/gen-content-dates.mjs).
    const modified = [CONTENT_MODIFIED[path], (CONTENT_DATES as Record<string, { modified: string }>)[path]?.modified].filter(Boolean).sort().at(-1)
    return modified ? { ...page, lastModified: modified } : page
  })
}
