import { templates } from "./templates"

/** Fixed aggregate actions: no clipboard contents, query strings, referrers or visitor identifiers. */
export const COPY_EVENTS = ["install_copy", "agent_prompt_copy"] as const
export type CopyEventName = (typeof COPY_EVENTS)[number] | "theme_copy" | "theme_share"
export type CopyEvent = { event: CopyEventName; page: string; component: string }

/* Pages that render the coding-agent prompt button: the home page and any docs page (it's an MDX component). */
const DOCS_PAGE = /^\/docs(\/[a-z0-9-]{1,48}){1,3}$/

/**
 * Allow only the combinations the site actually sends, keeping the stored rows few and predictable:
 * - the landing install command on /
 * - the coding-agent prompt button on / or a docs page
 * - a template's "Copy prompt" on its own docs page (/docs/templates/<slug>)
 * - the preset install command on /create
 */
export function parseCopyEvent(value: unknown): CopyEvent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const fields = Object.keys(value)
  if (fields.length !== 3 || fields.some((key) => !["event", "page", "component"].includes(key))) return null
  const { event, page, component } = value as Record<string, unknown>
  if (typeof page !== "string" || typeof component !== "string") return null
  if (event === "install_copy") {
    if ((page === "/" && component === "install-command") || (page === "/create" && component === "preset")) return { event, page, component }
    return null
  }
  if (event === "agent_prompt_copy") {
    if (component === "agent-prompt-button" && (page === "/" || DOCS_PAGE.test(page))) return { event, page, component }
    const slug = /^template-([a-z0-9-]+)$/.exec(component)?.[1]
    if (slug && templates.some((t) => t.slug === slug) && page === `/docs/templates/${slug}`) return { event, page, component }
    return null
  }
  return null
}
