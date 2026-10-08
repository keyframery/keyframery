import type { MetadataRoute } from "next"

import { PRO_ENABLED } from "@/lib/pro"
import { source } from "@/lib/source"

const base = "https://keyframery.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/cuts", "/theme", ...(PRO_ENABLED ? ["/pro"] : [])].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 }))
  const legal = ["/privacy", "/terms"].map((p) => ({ url: `${base}${p}`, changeFrequency: "yearly" as const, priority: 0.3 }))
  const docs = source.getPages().map((p) => ({ url: `${base}${p.url}`, changeFrequency: "weekly" as const, priority: 0.6 }))
  return [...pages, ...legal, ...docs]
}
