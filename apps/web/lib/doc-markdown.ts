/* Turns the docs' processed MDX into plain Markdown for AI tools (llms-full.txt, the .mdx routes, the MCP
   get_doc tool): drops live demos, flattens Steps, Tabs, install tabs, callouts and cut cards, and renders TypeTable props as a Markdown table.
   Code blocks pass through untouched. No imports, so unit tests load it directly. */

const STR = String.raw`"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'`
// One prop per line: `key: { description: "…", type: "…", default: '…', required: true },`
const PROP_LINE = new RegExp(String.raw`^\s*(${STR}|[A-Za-z_$][\w$]*)\s*:\s*\{(.*)\},?\s*$`)
const FIELD = new RegExp(String.raw`(\w+)\s*:\s*(${STR}|true|false)`, "g")

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

const PREVIEW_OPEN = /^<Preview(\s[^>]*)?>$/
const DEMO = /^<([A-Z]\w*Demo|Playground)(\s[^>]*)?\/>$/
const WRAPPER_OPEN = /^<(Steps|Step|Tabs|Tab|CutCards|Callout)(\s[^>]*)?>$/
const WRAPPER_CLOSE = /^<\/(Steps|Step|Tabs|Tab|CutCards|Callout)>$/

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
      while (i < lines.length - 1 && lines[i].trim() !== "</Preview>") i++
      continue
    }
    if (DEMO.test(text)) continue
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
      const label = open[1] === "Tab" ? /value="([^"]*)"/.exec(text)?.[1] : open[1] === "Callout" ? /title="([^"]*)"/.exec(text)?.[1] : undefined
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
