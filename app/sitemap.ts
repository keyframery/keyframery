import type { MetadataRoute } from "next"

import { SITE } from "@site/lib/shared"
import { allPosts, AUTHORS, authorPath } from "@site/lib/blog"
import { allDates as dateList, lastChanged } from "@site/lib/dates"
import { source } from "@site/lib/source"

/* Every page that should be indexed: the home page, the legal pages, every docs page, the blog and its authors. The Markdown copies
   (.mdx, llms.txt) point search engines back at these with a canonical link, so they are left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  // Real change dates from git (content/dates.json); the newest of them for pages that list others.
  const newest = Object.values(dateList()).sort().at(-1)
  const lastModified = new Date(newest ?? Date.now())
  const docs = source.getPages().map((page) => ({
    url: `${SITE}${page.url}`,
    lastModified: new Date(lastChanged(page.url) ?? lastModified),
    changeFrequency: "weekly" as const,
    priority: page.url === "/docs" ? 0.9 : page.url === "/docs/components" || page.url === "/docs/installation" ? 0.85 : page.data.component ? 0.7 : 0.75,
  }))
  return [
    { url: SITE, lastModified: new Date(lastChanged("/") ?? lastModified), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/create`, lastModified: new Date(lastChanged("/create") ?? lastModified), changeFrequency: "weekly", priority: 0.8 },
    ...docs,
    { url: `${SITE}/blog`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    ...allPosts().map((p) => ({ url: `${SITE}${p.url}`, lastModified: new Date(p.data.updated ?? p.data.published), changeFrequency: "monthly" as const, priority: 0.65 })),
    ...Object.values(AUTHORS).map((a) => ({ url: `${SITE}${authorPath(a)}`, lastModified, changeFrequency: "monthly" as const, priority: 0.4 })),
    { url: `${SITE}/privacy`, lastModified: new Date(lastChanged("/privacy") ?? lastModified), changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/terms`, lastModified: new Date(lastChanged("/terms") ?? lastModified), changeFrequency: "yearly", priority: 0.2 },
  ]
}
