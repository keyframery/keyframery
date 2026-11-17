/* A code block, as a UI SDK primitive. UI SDK ships none, so it is defined with its core: the same
   definition renders in React, Vue, Svelte, Solid and web components.

   It owns the code: splitting it into lines, a small tokenizer for a few languages (no highlighting
   package), which lines are highlighted, added or removed, line numbers, and the copy button
   (UI SDK's own copy-button example from "Define a Primitive", plus a screen reader announcement). */

import { announce, css, definePrimitive } from "@ui-sdk/core"

/** What a piece of a line is, for colouring it. */
type CodeTokenKind =
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "function"
  | "type"
  | "property"
  | "tag"
  | "attribute"
  | "punctuation"
  | "variable"

type CodeToken = { text: string; kind?: CodeTokenKind }

/** The languages the tokenizer knows. Anything else shows as plain text. */
type CodeBlockLanguage = "ts" | "tsx" | "js" | "jsx" | "json" | "css" | "html" | "bash" | "text"

type Rule = [RegExp, CodeTokenKind | ((match: string, rest: string) => CodeTokenKind | undefined) | undefined]

const jsKeywords =
  "import|export|from|as|default|const|let|var|function|return|if|else|for|while|of|in|new|class|extends|async|await|try|catch|finally|throw|type|interface|enum|typeof|instanceof|void|null|undefined|true|false|this|switch|case|break|continue|satisfies|keyof|readonly"

const js: Rule[] = [
  [/\/\*[\s\S]*?(?:\*\/|$)/y, "comment"],
  [/\/\/[^\n]*/y, "comment"],
  [/`(?:\\.|[^`\\])*`?/y, "string"],
  [/"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/y, "string"],
  [/<\/?[A-Za-z][\w.]*/y, "tag"],
  [/\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?n?\b/iy, "number"],
  [new RegExp(`\\b(?:${jsKeywords})\\b`, "y"), "keyword"],
  [/[A-Za-z_$][\w$]*/y, (word, rest) => {
    if (/^\s*\(/.test(rest)) return "function"
    if (/^\s*=(?!=)/.test(rest) && /^[a-z]/.test(word)) return undefined
    if (/^[A-Z]/.test(word)) return "type"
    return undefined
  }],
  [/\.(?=[A-Za-z_$])/y, "punctuation"],
  [/=>|[{}()[\];,.:?<>=+\-*/!&|%]/y, "punctuation"],
]

const rules: Record<Exclude<CodeBlockLanguage, "text">, Rule[]> = {
  ts: js,
  tsx: js,
  js,
  jsx: js,
  json: [
    [/"(?:\\.|[^"\\\n])*"(?=\s*:)/y, "property"],
    [/"(?:\\.|[^"\\\n])*"?/y, "string"],
    [/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/iy, "number"],
    [/\b(?:true|false|null)\b/y, "keyword"],
    [/[{}[\]:,]/y, "punctuation"],
  ],
  css: [
    [/\/\*[\s\S]*?(?:\*\/|$)/y, "comment"],
    [/@[\w-]+/y, "keyword"],
    [/--[\w-]+/y, "variable"],
    [/[\w-]+(?=\s*:(?!:))/y, "property"],
    [/"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/y, "string"],
    [/#[0-9a-f]{3,8}\b/iy, "number"],
    [/-?\b\d*\.?\d+(?:px|rem|em|ms|s|%|deg|vh|vw|fr)?\b/y, "number"],
    [/[\w-]+(?=\()/y, "function"],
    [/[{}();:,>+~]/y, "punctuation"],
  ],
  html: [
    [/<!--[\s\S]*?(?:-->|$)/y, "comment"],
    [/<\/?[\w-]+/y, "tag"],
    [/[\w-:]+(?==)/y, "attribute"],
    [/"[^"\n]*"?|'[^'\n]*'?/y, "string"],
    [/\/?>/y, "tag"],
  ],
  bash: [
    [/#[^\n]*/y, "comment"],
    [/"(?:\\.|[^"\\\n])*"?|'[^'\n]*'?/y, "string"],
    [/\$\{?[\w]+\}?/y, "variable"],
    [/(?<=^|\n|&&\s*|\|\s*|;\s*)[\w./-]+/y, "function"],
    [/(?<=\s)--?[\w-]+/y, "attribute"],
    [/[|&;><]+/y, "punctuation"],
  ],
}

/* Splits code into lines of tokens. Multi-line comments and strings keep their kind on every line
   they cross. */
function tokenize(code: string, language: CodeBlockLanguage): CodeToken[][] {
  const source = code.replace(/\n$/, "")
  const list = language === "text" ? undefined : rules[language]
  const tokens: CodeToken[] = []
  if (!list) tokens.push({ text: source })
  else {
    let at = 0
    let plain = ""
    while (at < source.length) {
      let matched = false
      for (const [pattern, kind] of list) {
        pattern.lastIndex = at
        const found = pattern.exec(source)
        if (!found || found[0].length === 0) continue
        const text = found[0]
        if (plain) tokens.push({ text: plain }), (plain = "")
        tokens.push({ text, kind: typeof kind === "function" ? kind(text, source.slice(at + text.length)) : kind })
        at += text.length
        matched = true
        break
      }
      if (!matched) plain += source[at++]
    }
    if (plain) tokens.push({ text: plain })
  }
  const lines: CodeToken[][] = [[]]
  for (const token of tokens) {
    const parts = token.text.split("\n")
    parts.forEach((text, index) => {
      if (index > 0) lines.push([])
      if (text) lines[lines.length - 1].push({ text, kind: token.kind })
    })
  }
  return lines
}

/* Options arrive on every render: tokenize again only when the code or language changed, so the
   state keeps the same lines and nothing re-renders for nothing. */
let lastTokens: { code: string; language: CodeBlockLanguage; lines: CodeToken[][] } | undefined
function linesOf(code: string, language: CodeBlockLanguage) {
  if (lastTokens?.code !== code || lastTokens.language !== language) lastTokens = { code, language, lines: tokenize(code, language) }
  return lastTokens.lines
}

type CodeBlockOptions = {
  /** The code to show and to copy. A trailing newline is ignored. */
  code?: string
  /** Which tokenizer colours it: "ts", "tsx", "js", "jsx", "json", "css", "html", "bash" or "text". */
  language?: CodeBlockLanguage
  /** Numbers each line. */
  lineNumbers?: boolean
  /** The number of the first line. */
  startLine?: number
  /** Line numbers (counting from `startLine`) to mark as highlighted. */
  highlight?: number[]
  /** Line numbers to mark as added, for a diff. */
  added?: number[]
  /** Line numbers to mark as removed, for a diff. */
  removed?: number[]
  /** Wraps long lines instead of scrolling them. */
  wrap?: boolean
  /** Called after the copy button copied the code. */
  onCopy?: (code: string) => void
}

type CodeBlockState = {
  code: string
  language: CodeBlockLanguage
  lines: CodeToken[][]
  lineNumbers: boolean
  startLine: number
  highlight: number[]
  added: number[]
  removed: number[]
  wrap: boolean
  copied: boolean
}

type LineVariant = "default" | "highlighted" | "added" | "removed"

const fromOptions = (options: CodeBlockOptions) => {
  const code = options.code ?? ""
  const language = options.language ?? "text"
  return {
    code,
    language,
    lines: linesOf(code, language),
    lineNumbers: options.lineNumbers ?? false,
    startLine: options.startLine ?? 1,
    highlight: options.highlight ?? [],
    added: options.added ?? [],
    removed: options.removed ?? [],
    wrap: options.wrap ?? false,
  }
}

const variantOf = (state: CodeBlockState, number: number): LineVariant =>
  state.added.includes(number)
    ? "added"
    : state.removed.includes(number)
      ? "removed"
      : state.highlight.includes(number)
        ? "highlighted"
        : "default"

const codeBlock = definePrimitive({
  name: "code-block",
  options: {
    code: "string",
    language: "string",
    lineNumbers: "boolean",
    startLine: "number",
    highlight: "value",
    added: "value",
    removed: "value",
    wrap: "boolean",
    onCopy: "callback",
  },
  controlled: [],
  state: (options: CodeBlockOptions): CodeBlockState => ({ ...fromOptions(options), copied: false }),
  sync: (options) => fromOptions(options),
  api: (context) => {
    let timer: ReturnType<typeof setTimeout> | undefined
    context.onDestroy(() => clearTimeout(timer))

    /* New code clears an earlier "Copied". */
    let code = context.options().code
    context.onOptions((options) => {
      if (options.code === code) return
      code = options.code
      clearTimeout(timer)
      context.store.set({ copied: false })
    })

    const write = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        /* No clipboard permission (an insecure page, an embedded frame): the old way still works. */
        const area = document.createElement("textarea")
        area.value = text
        area.setAttribute("readonly", "")
        area.style.position = "fixed"
        area.style.opacity = "0"
        document.body.append(area)
        area.select()
        document.execCommand("copy")
        area.remove()
      }
    }

    return {
      /** Copies the code, shows "Copied" for two seconds and tells screen readers. */
      async copy() {
        const text = context.store.get().code
        await write(text)
        clearTimeout(timer)
        context.store.set({ copied: true })
        announce("Copied")
        context.options().onCopy?.(text)
        const el = context.element("copy")
        const speed = (el && parseFloat(getComputedStyle(el).getPropertyValue("--kf-speed"))) || 1
        timer = setTimeout(() => context.store.set({ copied: false }), 2000 * speed)
      },
      /** The numbers of the lines, as keys for the line parts. */
      numbers(state: CodeBlockState) {
        return state.lines.map((_, index) => String(state.startLine + index))
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, { copied: boolean; wrap: boolean; lineNumbers: boolean }>({
      state: (state) => ({ copied: state.copied, wrap: state.wrap, lineNumbers: state.lineNumbers }),
      attrs: (state) => ({
        "data-language": state.language,
        "data-wrap": state.wrap ? "" : undefined,
        "data-numbered": state.lineNumbers ? "" : undefined,
        "data-copied": state.copied ? "" : undefined,
      }),
    }),
    header: slot({}),
    title: slot({}),
    actions: slot({}),
    footer: slot({}),
    copy: slot<{}, { copied: boolean }>({
      role: "button",
      focus: "native",
      state: (state) => ({ copied: state.copied }),
      attrs: (state) => ({
        type: "button",
        "aria-label": state.copied ? "Copied" : "Copy code",
        "data-copied": state.copied ? "" : undefined,
      }),
      press: ({ api }) => void api.copy(),
    }),
    content: slot<{}, { numbers: string[]; wrap: boolean }>({
      state: (state, part) => ({ numbers: part.api.numbers(state), wrap: state.wrap }),
      attrs: (state) => ({
        tabindex: "0",
        dir: "ltr",
        "data-wrap": state.wrap ? "" : undefined,
        "data-numbered": state.lineNumbers ? "" : undefined,
      }),
    }),
    line: slot<{ value: string }, { tokens: CodeToken[]; number: number; variant: LineVariant; lineNumbers: boolean }>({
      props: { value: "string" },
      state: (state, part) => {
        const number = Number(part.key)
        return {
          tokens: state.lines[number - state.startLine] ?? [],
          number,
          variant: variantOf(state, number),
          lineNumbers: state.lineNumbers,
        }
      },
      attrs: (state, part) => {
        const number = Number(part.key)
        const variant = variantOf(state, number)
        return {
          "data-variant": variant,
          "data-highlighted": variant === "highlighted" ? "" : undefined,
          "data-line": part.key,
          /* Its place among the lines, for a stagger. */
          style: css({ "--code-line-index": number - state.startLine }),
        }
      },
    }),
  }),
  agent: { actions: ["copy"] },
})

export { codeBlock, tokenize, type CodeBlockLanguage, type CodeBlockOptions, type CodeToken, type CodeTokenKind }
