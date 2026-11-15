import type { MetadataRoute } from "next"

import { SITE } from "@site/lib/shared"
import { allPosts, AUTHORS, authorPath } from "@site/lib/blog"
import { source } from "@site/lib/source"

/* Every page that should be indexed: the home page, the legal pages, every docs page, the blog and its authors. The Markdown copies
   (.mdx, llms.txt) point search engines back at these with a canonical link, so they are left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-11-15")
  const docs = source.getPages().map((page) => ({
    url: `${SITE}${page.url}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: page.url === "/docs" ? 0.9 : page.url === "/docs/components" || page.url === "/docs/installation" ? 0.85 : page.data.component ? 0.7 : 0.75,
  }))
  return [
    { url: SITE, lastModified, changeFrequency: "weekly", priority: 1 },
    ...docs,
    { url: `${SITE}/blog`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    ...allPosts().map((p) => ({ url: `${SITE}${p.url}`, lastModified: new Date(p.data.updated ?? p.data.published), changeFrequency: "monthly" as const, priority: 0.65 })),
    ...Object.values(AUTHORS).map((a) => ({ url: `${SITE}${authorPath(a)}`, lastModified, changeFrequency: "monthly" as const, priority: 0.4 })),
    { url: `${SITE}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/terms`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ]
}
