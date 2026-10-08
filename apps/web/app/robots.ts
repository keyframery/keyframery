import type { MetadataRoute } from "next"

import { SITE } from "@/lib/seo"

/**
 * One group for every crawler, search and AI alike (GPTBot, ClaudeBot, PerplexityBot…): the whole site is open.
 * Only the search API and the MCP endpoint are off limits; they are for tools, not crawling.
 */
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/mcp"] }], sitemap: `${SITE}/sitemap.xml` }
}
