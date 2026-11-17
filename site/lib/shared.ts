import { createGetUrl } from "fumadocs-core/source"

export const SITE = "https://keyframery.com"
export const SITE_NAME = "Keyframery"
export const REPO = "https://github.com/keyframery/keyframery"
/** One description everywhere (site, GitHub, directories), so search and AI engines learn one consistent entity. */
export const TAGLINE = "Keyframery is the open-source component library for UI SDK, animated in plain CSS, with Agent view to show what AI agents read."

export const docsRoute = "/docs"
export const docsContentRoute = "/llms.mdx/docs"

export const gitConfig = { user: "keyframery", repo: "keyframery", branch: "main" }

export const url = (path: string) => `${SITE}${path === "/" ? "" : path}`

const getContentUrl = createGetUrl(docsContentRoute)

/** Where a docs page is served as Markdown, for AI tools and the Copy Markdown button. */
export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, "content.md"]
  return { segments, url: getContentUrl(segments, page.locale) }
}
