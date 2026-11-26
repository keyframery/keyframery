/* Streaming markdown, as a UI SDK primitive. UI SDK ships none, so it is defined with its core: the
   same definition and the same parser render in React, Vue, Svelte, Solid and web components.

   It owns the parsing: a small in-house markdown parser (no package) that turns a string into
   blocks, built for text that is still arriving. Each block carries the exact source it came from,
   so a renderer can keep every finished block as it is and redraw only the one that is growing.
   While `streaming` is true, the last block is "live": what is unfinished there reads as it will
   once it is finished, instead of flashing raw syntax:

   - an unclosed ``` fence is a code block in progress (`complete: false`);
   - an unclosed `**`, `*`, `_`, `~~` or backtick formats the rest of the text as if it were closed;
   - a link whose URL is still arriving shows its text, without an address yet;
   - a table's half-written row is padded to the header's columns, and a table whose header has no
     divider line yet waits instead of showing pipes;
   - a last line that is only the start of a marker (`-`, `1.`, `##`, `>`, `|`, a short fence)
     waits for the next character before it shows.

   Raw HTML is never interpreted (renderers show it as text), and links keep only http, https,
   mailto, tel and relative addresses: anything else, like `javascript:`, renders as plain text. */

import { definePrimitive } from "@ui-sdk/core"

import { bindAgentContent } from "@/components/core/agent-content"
import type { CodeBlockLanguage } from "@/components/core/code-block"

/* ---------- The tree ---------- */

type MarkdownInline =
  | { type: "text"; text: string }
  | { type: "strong" | "em" | "del"; children: MarkdownInline[] }
  | { type: "code"; text: string }
  /** `href` is missing while the address is still arriving, or when it was unsafe. */
  | { type: "link"; href?: string; title?: string; children: MarkdownInline[] }
  | { type: "break" }

type MarkdownAlign = "left" | "center" | "right" | undefined

type MarkdownListItem = { checked?: boolean; children: MarkdownBlock[] }

type BlockBase = {
  /** The source lines the block came from: equal source, equal block. */
  source: string
  /** The block is the end of a stream that is still arriving. */
  live: boolean
}

type MarkdownBlock = BlockBase &
  (
    | { type: "paragraph"; children: MarkdownInline[] }
    | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; children: MarkdownInline[] }
    | { type: "code"; info: string; language: CodeBlockLanguage; code: string; complete: boolean }
    | { type: "list"; ordered: boolean; start: number; items: MarkdownListItem[] }
    | { type: "quote"; children: MarkdownBlock[] }
    | { type: "rule" }
    | { type: "table"; align: MarkdownAlign[]; head: MarkdownInline[][]; rows: MarkdownInline[][][] }
  )

/* A block without its source and live flag, kept per kind. */
type BlockBody = MarkdownBlock extends infer B ? (B extends unknown ? Omit<B, "source" | "live"> : never) : never

/* ---------- Safety ---------- */

/** An address a link may open, or undefined. Relative addresses and http, https, mailto and tel only. */
function safeHref(url: string): string | undefined {
  const href = url.trim()
  if (!href) return undefined
  const plain = href.replace(/[\u0000- \u007f-\u009f]/g, "").toLowerCase()
  const scheme = /^([a-z][a-z0-9+.-]*):/.exec(plain)
  if (!scheme) return href
  return ["http", "https", "mailto", "tel"].includes(scheme[1]) ? href : undefined
}

/* ---------- Code languages ---------- */

const languages: Record<string, CodeBlockLanguage> = {
  ts: "ts", typescript: "ts", tsx: "tsx", js: "js", javascript: "js", mjs: "js", cjs: "js", jsx: "jsx",
  json: "json", jsonc: "json", css: "css", scss: "css", html: "html", xml: "html", svg: "html", vue: "html",
  bash: "bash", sh: "bash", shell: "bash", zsh: "bash", console: "bash", terminal: "bash",
}

/** The code block tokenizer's language for a fence's info string; anything unknown is plain text. */
function codeLanguage(info: string): CodeBlockLanguage {
  return languages[info.trim().split(/\s+/)[0]?.toLowerCase() ?? ""] ?? "text"
}

/* ---------- Inline ---------- */

const ESCAPABLE = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/
const isSpace = (c: string | undefined) => c === undefined || /\s/.test(c)
const isWord = (c: string | undefined) => c !== undefined && /[\p{L}\p{N}]/u.test(c)

const runOf = (src: string, at: number) => {
  let end = at
  while (src[end] === src[at]) end++
  return end - at
}

/* The end of a code span that opens at `at`, or -1. */
function codeSpanEnd(src: string, at: number) {
  const run = runOf(src, at)
  let j = at + run
  while (j < src.length) {
    if (src[j] === "`") {
      const close = runOf(src, j)
      if (close === run) return j + close
      j += close
    } else j++
  }
  return -1
}

/* Where the closing `delim` (`*`, `**`, `_`, `__` or `~~`) for an opener whose content starts at
   `from` begins, or -1. Code spans and escapes are skipped; a run that also opens (space before it)
   is not a closer. */
function findCloser(src: string, from: number, delim: string) {
  const ch = delim[0]
  const size = delim.length
  let j = from
  while (j < src.length) {
    const c = src[j]
    if (c === "\\") {
      j += 2
      continue
    }
    if (c === "`") {
      const end = codeSpanEnd(src, j)
      if (end > 0) {
        j = end
        continue
      }
    }
    if (c === ch) {
      const run = runOf(src, j)
      const fits = ch === "~" ? run >= 2 : size === 1 ? run === 1 || run >= 3 : run >= 2
      const after = src[j + run]
      if (fits && j > from && !isSpace(src[j - 1]) && !(ch === "_" && isWord(after))) return j + run - size
      j += run
      continue
    }
    j++
  }
  return -1
}

/* The `]` that closes a `[` at `at`, or -1. */
function bracketEnd(src: string, at: number) {
  let depth = 0
  for (let j = at; j < src.length; j++) {
    const c = src[j]
    if (c === "\\") j++
    else if (c === "`") {
      const end = codeSpanEnd(src, j)
      if (end > 0) j = end - 1
    } else if (c === "[") depth++
    else if (c === "]" && --depth === 0) return j
  }
  return -1
}

/* The `)` that closes a `(` at `at`, or -1. */
function parenEnd(src: string, at: number) {
  let depth = 0
  for (let j = at; j < src.length; j++) {
    const c = src[j]
    if (c === "\\") j++
    else if (c === "(") depth++
    else if (c === ")" && --depth === 0) return j
    else if (c === "\n") return -1
  }
  return -1
}

const BARE_URL = /^https?:\/\/[^\s<>"]*[^\s<>".,:;'!?)\]*_~]/

/** Inline markdown to nodes. `live`: the text is the end of a stream that is still arriving. */
function parseInline(src: string, live = false): MarkdownInline[] {
  const out: MarkdownInline[] = []
  let text = ""
  const flush = () => {
    if (text) out.push({ type: "text", text })
    text = ""
  }
  const push = (...nodes: MarkdownInline[]) => {
    flush()
    out.push(...nodes)
  }

  let i = 0
  while (i < src.length) {
    const c = src[i]
    const next = src[i + 1]

    if (c === "\\") {
      if (next === "\n") {
        push({ type: "break" })
        i += 2
      } else if (next !== undefined && ESCAPABLE.test(next)) {
        text += next
        i += 2
      } else {
        if (!(live && next === undefined)) text += c
        i++
      }
      continue
    }

    if (c === "\n") {
      const hard = / {2,}$/.test(text)
      text = text.replace(/ +$/, "")
      if (hard) push({ type: "break" })
      else text += "\n"
      i++
      continue
    }

    if (c === "`") {
      const run = runOf(src, i)
      const end = codeSpanEnd(src, i)
      if (end > 0) {
        let code = src.slice(i + run, end - run).replace(/\n/g, " ")
        if (code.length > 2 && code.startsWith(" ") && code.endsWith(" ") && code.trim()) code = code.slice(1, -1)
        push({ type: "code", text: code })
        i = end
      } else if (live) {
        const code = src.slice(i + run).replace(/\n/g, " ")
        if (code) push({ type: "code", text: code })
        i = src.length
      } else {
        text += src.slice(i, i + run)
        i += run
      }
      continue
    }

    if (c === "<") {
      const auto = /^<((?:https?:\/\/|mailto:)[^\s<>]+)>/i.exec(src.slice(i))
      if (auto) {
        const href = safeHref(auto[1])
        push({ type: "link", href, children: [{ type: "text", text: auto[1].replace(/^mailto:/i, "") }] })
        i += auto[0].length
        continue
      }
      const br = /^<br\s*\/?>/i.exec(src.slice(i))
      if (br) {
        push({ type: "break" })
        i += br[0].length
        continue
      }
    }

    if (c === "h" && !isWord(src[i - 1]) && (src.startsWith("http://", i) || src.startsWith("https://", i))) {
      const url = BARE_URL.exec(src.slice(i))
      if (url) {
        push({ type: "link", href: safeHref(url[0]), children: [{ type: "text", text: url[0] }] })
        i += url[0].length
        continue
      }
    }

    if (c === "[" || (c === "!" && next === "[")) {
      const at = c === "!" ? i + 1 : i
      const close = bracketEnd(src, at)
      if (close < 0) {
        if (live) {
          /* Maybe a link, maybe not: show its words without the bracket for now. */
          push(...parseInline(src.slice(at + 1), live))
          i = src.length
          continue
        }
      } else {
        const label = src.slice(at + 1, close)
        const children = parseInline(label, false)
        if (src[close + 1] === "(") {
          const end = parenEnd(src, close + 1)
          if (end > 0) {
            const target = /^\s*<?([^\s>]*)>?(?:\s+["'(](.*)["')])?\s*$/.exec(src.slice(close + 2, end))
            const href = target ? safeHref(target[1]) : undefined
            /* An unsafe address (javascript:, data: and the like) leaves only the words. */
            if (href === undefined) push(...children)
            else push({ type: "link", href, title: target?.[2], children })
            i = end + 1
            continue
          }
          if (live) {
            /* The address is still arriving. */
            push({ type: "link", children })
            i = src.length
            continue
          }
        } else if (live && close === src.length - 1) {
          push(...children)
          i = src.length
          continue
        }
      }
      text += c
      i++
      continue
    }

    if (c === "*" || c === "_" || c === "~") {
      const run = runOf(src, i)
      const after = src[i + run]
      if (live && after === undefined) {
        /* A marker with nothing after it yet: wait for the next character. */
        i += run
        continue
      }
      const opens = !isSpace(after) && !(c === "_" && isWord(src[i - 1])) && (c !== "~" || run >= 2)
      if (opens) {
        const size = c === "~" ? 2 : Math.min(run, 2)
        const delim = c.repeat(size)
        const type = c === "~" ? "del" : size === 2 ? "strong" : "em"
        const from = i + size
        const close = findCloser(src, from, delim)
        if (close > 0) {
          push({ type, children: parseInline(src.slice(from, close), false) })
          i = close + size
          continue
        }
        if (live) {
          const rest = src.slice(from)
          if (rest.trim()) push({ type, children: parseInline(rest, live) })
          i = src.length
          continue
        }
      }
      text += src.slice(i, i + run)
      i += run
      continue
    }

    text += c
    i++
  }
  flush()
  return out
}

/* ---------- Blocks ---------- */

const FENCE = /^( {0,3})(`{3,}|~{3,})(.*)$/
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/
const RULE = /^ {0,3}([-*_])[ \t]*(?:\1[ \t]*){2,}$/
const QUOTE = /^ {0,3}>/
const LIST = /^( *)([-*+]|\d{1,9}[.)])(?:([ \t]+)(.*)|$)/
const DELIMITER = /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/
const PARTIAL_DELIMITER = /^\s*\|?[\s:|-]*$/
/* A last line that is only the start of something: wait for the next character. */
const PARTIAL = /^\s*(?:[-*+_=>|~]{1,3}|`{1,3}|#{1,6}|\d{1,9}[.)]?)\s*$/

const blank = (line: string | undefined) => line === undefined || !line.trim()
const indentOf = (line: string) => line.length - line.trimStart().length

function splitRow(line: string): string[] {
  let row = line.trim()
  if (row.startsWith("|")) row = row.slice(1)
  if (row.endsWith("|") && !row.endsWith("\\|")) row = row.slice(0, -1)
  const cells: string[] = []
  let cell = ""
  for (let j = 0; j < row.length; j++) {
    const c = row[j]
    if (c === "\\" && row[j + 1] === "|") {
      cell += "|"
      j++
    } else if (c === "`") {
      const end = codeSpanEnd(row, j)
      if (end > 0) {
        cell += row.slice(j, end)
        j = end - 1
      } else cell += c
    } else if (c === "|") {
      cells.push(cell.trim())
      cell = ""
    } else cell += c
  }
  cells.push(cell.trim())
  return cells
}

const alignOf = (cell: string): MarkdownAlign => {
  const left = cell.startsWith(":")
  const right = cell.endsWith(":")
  return left && right ? "center" : right ? "right" : left ? "left" : undefined
}

/* A table starts here: a row with pipes over a divider line, or, at the live end of a stream, a row
   that starts with a pipe and may yet get one. */
function tableStarts(lines: string[], i: number, live: boolean) {
  const line = lines[i]
  if (!line.includes("|")) return false
  const next = lines[i + 1]
  if (next !== undefined && DELIMITER.test(next) && next.includes("|") && !(live && i + 1 === lines.length - 1 && !next.includes("-"))) return true
  if (!live || !line.trimStart().startsWith("|")) return false
  return i === lines.length - 1 || (i + 1 === lines.length - 1 && PARTIAL_DELIMITER.test(next))
}

function startsBlock(lines: string[], i: number, live: boolean) {
  const line = lines[i]
  return FENCE.test(line) || HEADING.test(line) || RULE.test(line) || QUOTE.test(line) || LIST.test(line) || tableStarts(lines, i, live)
}

/** Block markdown to blocks. `live`: the lines are the end of a stream that is still arriving. */
function parseBlocks(lines: string[], live: boolean): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  const last = lines.length - 1
  let i = 0

  /* Each block is live when the stream is and the block reaches the end of the lines. */
  const add = (block: BlockBody, from: number, to: number) =>
    blocks.push({ ...block, source: lines.slice(from, to).join("\n"), live: live && to > last } as MarkdownBlock)
  const reachesEnd = (to: number) => live && to > last

  while (i <= last) {
    const line = lines[i]
    if (blank(line)) {
      i++
      continue
    }
    if (live && i === last && PARTIAL.test(line)) break
    const from = i

    const fence = FENCE.exec(line)
    if (fence && !(fence[2][0] === "`" && fence[3].includes("`"))) {
      const [, indent, marks, info] = fence
      const close = new RegExp(`^ {0,3}${marks[0] === "`" ? "`" : "~"}{${marks.length},}\\s*$`)
      const code: string[] = []
      let complete = false
      i++
      while (i <= last) {
        if (close.test(lines[i])) {
          complete = true
          i++
          break
        }
        code.push(lines[i].startsWith(indent) ? lines[i].slice(indent.length) : lines[i].trimStart())
        i++
      }
      /* A closing fence still being typed is not code. */
      if (!complete && live && code.length && new RegExp(`^ {0,3}\\${marks[0]}{1,${marks.length}}\\s*$`).test(code[code.length - 1])) code.pop()
      add({ type: "code", info: info.trim(), language: codeLanguage(info), code: code.join("\n"), complete }, from, i)
      continue
    }

    const heading = HEADING.exec(line)
    if (heading) {
      i++
      add({ type: "heading", level: heading[1].length as 1 | 2 | 3 | 4 | 5 | 6, children: parseInline(heading[2] ?? "", reachesEnd(i)) }, from, i)
      continue
    }

    if (RULE.test(line)) {
      i++
      add({ type: "rule" }, from, i)
      continue
    }

    if (QUOTE.test(line)) {
      const inner: string[] = []
      while (i <= last && !blank(lines[i]) && (QUOTE.test(lines[i]) || !startsBlock(lines, i, live))) {
        inner.push(lines[i].replace(/^ {0,3}> ?/, ""))
        i++
      }
      add({ type: "quote", children: parseBlocks(inner, reachesEnd(i)) }, from, i)
      continue
    }

    const first = LIST.exec(line)
    if (first) {
      const ordered = /\d/.test(first[2])
      const indent = first[1].length
      const items: { checked?: boolean; lines: string[] }[] = []
      while (i <= last) {
        const m = LIST.exec(lines[i])
        if (!m || /\d/.test(m[2]) !== ordered || m[1].length > indent + 1 || m[1].length < indent) break
        if (live && i === last && PARTIAL.test(lines[i])) break
        const gap = m[3]?.length ?? 1
        const contentIndent = m[1].length + m[2].length + (gap > 4 ? 1 : gap)
        const item = { lines: [m[4] ?? ""] } as { checked?: boolean; lines: string[] }
        i++
        while (i <= last) {
          const l = lines[i]
          if (blank(l)) {
            let j = i
            while (j <= last && blank(lines[j])) j++
            if (j > last || indentOf(lines[j]) <= indent) break
            item.lines.push("")
            i++
            continue
          }
          if (indentOf(l) > indent) {
            item.lines.push(l.slice(Math.min(indentOf(l), contentIndent)))
            i++
            continue
          }
          /* A line that carries on the paragraph before it, without indenting. */
          if (!blank(lines[i - 1]) && !startsBlock(lines, i, live)) {
            item.lines.push(l.trimStart())
            i++
            continue
          }
          break
        }
        const task = /^\[([ xX])\](?:\s+|$)/.exec(item.lines[0])
        if (task) {
          item.checked = task[1] !== " "
          item.lines[0] = item.lines[0].slice(task[0].length)
        } else if (live && i > last && item.lines.length === 1 && /^\[[ xX]?$/.test(item.lines[0])) {
          item.lines[0] = ""
        }
        items.push(item)
        /* Blank lines between items: the next item continues the list. */
        let j = i
        while (j <= last && blank(lines[j])) j++
        if (j > i && j <= last && LIST.test(lines[j])) i = j
      }
      if (items.length) {
        const start = ordered ? parseInt(first[2], 10) : 1
        add(
          {
            type: "list",
            ordered,
            start,
            items: items.map((item, n) => ({
              checked: item.checked,
              children: parseBlocks(item.lines, reachesEnd(i) && n === items.length - 1),
            })),
          },
          from,
          i,
        )
        continue
      }
      if (i === from) break
      continue
    }

    if (tableStarts(lines, i, live)) {
      const head = splitRow(line)
      const divider = lines[i + 1]
      if (divider === undefined || !DELIMITER.test(divider) || !divider.includes("-")) {
        /* A header with no divider yet: wait, rather than show pipes. */
        if (live && i + 2 > last) break
      }
      const align = head.map((_, n) => alignOf(splitRow(divider ?? "")[n] ?? ""))
      i += divider === undefined ? 1 : 2
      const rows: string[][] = []
      while (i <= last && !blank(lines[i]) && lines[i].includes("|")) {
        rows.push(splitRow(lines[i]))
        i++
      }
      const end = reachesEnd(i)
      const fit = (cells: string[]) => head.map((_, n) => cells[n] ?? "")
      add(
        {
          type: "table",
          align,
          head: head.map((cell) => parseInline(cell, false)),
          rows: rows.map((cells, r) =>
            fit(cells).map((cell, n) => parseInline(cell, end && r === rows.length - 1 && n === Math.min(cells.length, head.length) - 1)),
          ),
        },
        from,
        i,
      )
      continue
    }

    const text: string[] = []
    while (i <= last && !blank(lines[i]) && (i === from || !startsBlock(lines, i, live))) {
      if (live && i === last && i > from && PARTIAL.test(lines[i])) break
      text.push(i === from ? lines[i].trimStart() : lines[i])
      i++
    }
    if (!text.length) break
    add({ type: "paragraph", children: parseInline(text.join("\n"), reachesEnd(i)) }, from, i)
  }
  return blocks
}

/** Markdown to blocks. While `streaming`, the end is read as unfinished (see the top of this file). */
function parseMarkdown(source: string, { streaming = false }: { streaming?: boolean } = {}): MarkdownBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").replace(/^\t+/gm, (tabs) => "    ".repeat(tabs.length)).split("\n")
  return parseBlocks(lines, streaming)
}

/** The plain text of inline nodes, for labels and agents. */
function inlineText(nodes: MarkdownInline[]): string {
  return nodes.map((node) => ("text" in node ? node.text : node.type === "break" ? "\n" : inlineText(node.children))).join("")
}

/* ---------- The primitive ---------- */

type MarkdownOptions = {
  /** True while the text is still arriving: the end reads as unfinished, and the caret shows. */
  streaming?: boolean
}

const markdown = definePrimitive({
  name: "markdown",
  options: { streaming: "boolean" },
  state: (options: MarkdownOptions) => ({ content: "", streaming: options.streaming ?? false }),
  sync: (options) => ({ streaming: options.streaming ?? false }),
  controlled: ["content"],
  api: () => ({}),
  slots: (slot) => ({
    root: slot<{}, { streaming: boolean }>({
      state: (state) => ({ streaming: state.streaming }),
      attrs: (state) => ({
        "data-streaming": state.streaming ? "" : undefined,
        "aria-busy": state.streaming ? "true" : undefined,
      }),
      /* An agent reads the answer as text. */
      bind: (el, part) => bindAgentContent(el, (content) => part.store.set({ content })),
    }),
    /* Decorative: shows where the text is arriving. */
    caret: slot({
      attrs: () => ({ "aria-hidden": "true" }),
    }),
  }),
  agent: { actions: [] },
})

export {
  codeLanguage,
  inlineText,
  markdown,
  parseInline,
  parseMarkdown,
  safeHref,
  type MarkdownAlign,
  type MarkdownBlock,
  type MarkdownInline,
  type MarkdownListItem,
  type MarkdownOptions,
}
