/* Turns the docs' processed MDX into plain Markdown for AI tools (llms-full.txt and the .mdx routes):
   drops live demos, flattens Steps, Tabs, install tabs, callouts and cut cards, and renders TypeTable props as a Markdown table.
   Code blocks pass through untouched. No imports, so unit tests load it directly. */

const STR = String.raw`"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'`
// One prop per line: `key: { description: "…", type: "…", default: '…', required: true },`
const PROP_LINE = new RegExp(String.raw`^\s*(${STR}|[A-Za-z_$][\w$]*)\s*:\s*\{(.*)\},?\s*$`)
const FIELD = new RegExp(String.raw`(\w+)\s*:\s*(${STR}|true|false)`, "g")

// The guides <FrameworkGrid /> shows, in its order (site/lib/frameworks.ts holds the logos; kept here so this file has no imports).
const FRAMEWORK_GUIDES = [["next", "Next.js"], ["vite", "Vite"], ["tanstack", "TanStack Start"], ["laravel", "Laravel"], ["react-router", "React Router"], ["astro", "Astro"], ["manual", "Manual"]] as const

const ENTITIES: Record<string, string> = { "&#x22;": '"', "&#x27;": "'", "&quot;": '"', "&#39;": "'", "&lt;": "<", "&gt;": ">", "&amp;": "&" }
const decode = (s: string) => s.replace(/&#x22;|&#x27;|&quot;|&#39;|&lt;|&gt;|&amp;/g, (m) => ENTITIES[m])
const unquote = (s: string) => (/^["']/.test(s) ? s.slice(1, -1).replace(/\\(["'\\])/g, "$1") : s)
const cell = (s: string) => s.replace(/\|/g, "\\|")

/** The `type` attribute of one <TypeTable /> as a Markdown table. */
export function typeTableToMarkdown(typeAttr: string): string {
  const rows = decode(typeAttr)
    .split("\n")
    .flatMap((line) => {
      const m = PROP_LINE.exec(line)
      if (!m) return []
      const fields: Record<string, string> = {}
      for (const f of m[2].matchAll(FIELD)) fields[f[1]] = unquote(f[2])
      const fallback = fields.required === "true" ? "required" : fields.default ? `\`${cell(fields.default)}\`` : ""
      return [`| \`${cell(unquote(m[1]))}\` | \`${cell(fields.type ?? "")}\` | ${fallback} | ${cell(fields.description ?? "")} |`]
    })
  return ["| Prop | Type | Default | Description |", "| --- | --- | --- | --- |", ...rows].join("\n")
}

const PREVIEW_OPEN = /^<HiddenFromMarkdown(\s[^>]*)?>$/
const DEMO = /^<(LiveDemo|MotionStylePlayground|ComponentGrid|MovesGrid)(\s[^>]*)?\/>$/
const WRAPPER_OPEN = /^<(Steps|Step|Tabs|Tab|Accordions|Accordion|Callout|Note|ComponentPreview)(\s[^>]*)?>$/
const WRAPPER_CLOSE = /^<\/(Steps|Step|Tabs|Tab|Accordions|Accordion|Callout|Note|ComponentPreview)>$/

/** A page's own questions, shared by the Markdown routes and llms-full.txt. */
function faqMarkdown(faq: { q: string; a: string }[] | undefined): string {
  if (!faq?.length) return ""
  return `\n\n## Questions\n\n${faq.map(({ q, a }) => `### ${q}\n\n${a}`).join("\n\n")}\n`
}

/** Include the HTML header's description in every text interface, without repeating an existing opening answer. */
export function renderDocMarkdown({ title, url, description, body, faq }: {
  title: string
  url: string
  description?: string
  body: string
  faq?: { q: string; a: string }[]
}): string {
  const content = cleanDocMarkdown(body).trim()
  const summary = description?.trim()
  const plain = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[`*_~]/g, "").replace(/\s+/g, " ").trim()
  const opening = plain(content.split(/\n\s*\n/)[0] ?? "")
  const hasSummary = summary && (opening === plain(summary) || opening.startsWith(`${plain(summary)} `))
  return `# ${title} (${url})\n\n${summary && !hasSummary ? `${summary}\n\n` : ""}${content}${faqMarkdown(faq)}`
}

export function cleanDocMarkdown(md: string): string {
  const lines = md.split("\n")
  const out: string[] = []
  let depth = 0 // open Steps/Step/Tabs/Tab wrappers; each one indents its content by two spaces
  let fence = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const text = line.trim()
    const dedented = line.replace(new RegExp(`^ {0,${depth * 2}}`), "")
    if (text.startsWith("```")) {
      fence = !fence
      out.push(dedented)
      continue
    }
    if (fence) {
      out.push(dedented)
      continue
    }
    if (PREVIEW_OPEN.test(text)) {
      while (i < lines.length - 1 && lines[i].trim() !== "</HiddenFromMarkdown>") i++
      continue
    }
    // The live playground carries a JSON source/edit map; text exports show its actual example instead.
    if (text.startsWith("<ComponentPreview ") && text.includes("source={") && text.endsWith("/>")) {
      const start = text.indexOf("source={") + "source={".length
      const serialized = text.slice(start, text.lastIndexOf("}"))
      try {
        const example = JSON.parse(serialized) as { code?: unknown }
        if (typeof example.code === "string") { out.push("```tsx", example.code, "```"); continue }
      } catch { /* A hand-written preview may contain expressions instead of generated JSON. */ }
    }
    if (DEMO.test(text)) continue
    // The installation pages' cards: the framework grid becomes a list of guides, the starting points a list of sections.
    if (text === "<FrameworkGrid />") {
      out.push(...FRAMEWORK_GUIDES.map(([slug, name]) => `- [${name}](/docs/installation/${slug})`))
      continue
    }
    if (text.startsWith("<StartingPoints")) {
      let block = line
      while (!lines[i].trim().endsWith("/>") && i < lines.length - 1) block += "\n" + lines[++i]
      for (const [, href, title, description] of decode(block).matchAll(/href: "([^"]+)", title: "([^"]+)", description: "([^"]+)"/g))
        out.push(`- [${title}](${href}): ${description}`)
      continue
    }
    // Install tabs (npm, pnpm, yarn, bun from a ```npm block): keep the first tab's command, as it was written.
    if (/^<CodeBlockTabs[\s>]/.test(text)) {
      const block: string[] = []
      let inFence = false
      let indent = 0
      while (i < lines.length - 1 && lines[i].trim() !== "</CodeBlockTabs>") {
        const l = lines[++i]
        if (block.length && !inFence) continue
        if (l.trim().startsWith("```")) {
          if (!inFence) indent = l.length - l.trimStart().length
          inFence = !inFence
          block.push(l.slice(indent))
        } else if (inFence) block.push(l.slice(indent))
      }
      out.push(...block)
      continue
    }
    if (text.startsWith("<TypeTable")) {
      let block = line
      while (!lines[i].trim().endsWith("/>") && i < lines.length - 1) block += "\n" + lines[++i]
      out.push(typeTableToMarkdown(/type="([^"]*)"/.exec(block)?.[1] ?? ""))
      continue
    }
    const open = WRAPPER_OPEN.exec(text)
    if (open) {
      // A tab's name, or a callout's title, becomes a bold line; CutCards keeps the Markdown table it wraps.
      const label = open[1] === "Tab" ? /value="([^"]*)"/.exec(text)?.[1] : open[1] === "Callout" || open[1] === "Note" || open[1] === "Accordion" ? /title="([^"]*)"/.exec(text)?.[1] : undefined
      if (label) out.push(`**${decode(label)}**`, "")
      depth++
      continue
    }
    if (WRAPPER_CLOSE.test(text)) {
      depth = Math.max(0, depth - 1)
      continue
    }
    out.push(dedented)
  }
  return out.join("\n")
}
