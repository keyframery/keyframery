import type { MetadataRoute } from "next"

import { CONTENT_MODIFIED } from "@/lib/content-modified"
import { PRO_ENABLED } from "@/lib/pro"
import { source } from "@/lib/source"
import { UI_ORDER } from "@/lib/ui-library"

const base = "https://keyframery.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/ui", ...UI_ORDER.map((c) => `/ui/${c.slug}`), "/cuts", "/theme", ...(PRO_ENABLED ? ["/pro"] : [])].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 }))
  const legal = ["/privacy", "/terms"].map((p) => ({ url: `${base}${p}`, changeFrequency: "yearly" as const, priority: 0.3 }))
  const docs = source.getPages().map((p) => ({ url: `${base}${p.url}`, changeFrequency: "weekly" as const, priority: 0.6 }))
  return [...pages, ...legal, ...docs].map((page) => {
    const modified = CONTENT_MODIFIED[new URL(page.url).pathname]
    return modified ? { ...page, lastModified: modified } : page
  })
}
