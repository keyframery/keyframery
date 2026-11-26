/* A diff viewer, as a UI SDK primitive. UI SDK ships none, so it is defined with its core: the same
   definition renders in React, Vue, Svelte, Solid and web components.

   For reviewing the changes an AI agent proposes to a file, or any code review. It owns the diff:
   computing it from `before` and `after` (Myers, in `./diff-viewer-diff`, no package) or reading a
   unified `patch`, the hunks and the folded runs between them, which view is shown (unified or split,
   falling back to unified when the viewer is narrower than `splitMinWidth`), which folds are open,
   what the reviewer decided for each hunk, and the copy button.

   Agents read the file name, the counts, the view, the folds and a summary of every hunk, and can
   switch the view and open folds. Accepting or rejecting a hunk is left to the person reviewing. */

import { announce, createChange, css, definePrimitive } from "@ui-sdk/core"

import { type CodeBlockLanguage, type CodeToken, tokenize } from "@/components/core/code-block"
import { buildDiff, type DiffHunk, type DiffLine, type DiffModel } from "@/components/core/diff-viewer-diff"

type DiffView = "unified" | "split"
type DiffDecision = "accepted" | "rejected"

/* ---------- Text ---------- */

const extensions: Record<string, CodeBlockLanguage> = {
  ts: "ts", mts: "ts", cts: "ts", tsx: "tsx", js: "js", mjs: "js", cjs: "js", jsx: "jsx",
  json: "json", css: "css", html: "html", htm: "html", sh: "bash", bash: "bash", zsh: "bash",
}

/** The tokenizer for a file name, by its extension. */
function languageOf(filename: string | undefined): CodeBlockLanguage {
  const ext = filename?.split(".").pop()?.toLowerCase()
  return (ext && extensions[ext]) || "text"
}

/** A run of a line's text: its token kind for colour, and whether it is a word that changed. */
type DiffSegment = { text: string; kind?: CodeToken["kind"]; changed?: boolean }

/* Tokenizing is the costly part of drawing a line, so lines are cached by their text. */
const tokenCache = new Map<string, CodeToken[]>()
function tokensOf(text: string, language: CodeBlockLanguage): CodeToken[] {
  if (language === "text") return [{ text }]
  const key = `${language}\u0000${text}`
  let tokens = tokenCache.get(key)
  if (!tokens) {
    /* A line inside a block comment can't know it is one on its own; its leading star says so. */
    const comment = /^(ts|tsx|js|jsx|css)$/.test(language) && /^\s*(\*|\/\*|\/\/)/.test(text)
    tokens = comment ? [{ text, kind: "comment" }] : (tokenize(text, language)[0] ?? [])
    if (tokenCache.size > 8000) tokenCache.clear()
    tokenCache.set(key, tokens)
  }
  return tokens
}

/** Splits a line into coloured segments, cut again where a changed word starts or ends. */
function segmentsOf(line: DiffLine, language: CodeBlockLanguage, words = true): DiffSegment[] {
  const tokens = tokensOf(line.text, language)
  const ranges = words ? line.words : undefined
  if (!ranges?.length) return tokens
  const out: DiffSegment[] = []
  let at = 0
  for (const token of tokens) {
    const end = at + token.text.length
    let from = at
    for (const [s, e] of ranges) {
      if (e <= from || s >= end) continue
      if (s > from) out.push({ text: line.text.slice(from, s), kind: token.kind })
      const stop = Math.min(e, end)
      out.push({ text: line.text.slice(Math.max(s, from), stop), kind: token.kind, changed: true })
      from = stop
    }
    if (from < end) out.push({ text: line.text.slice(from, end), kind: token.kind })
    at = end
  }
  /* Neighbouring changed segments become one, so the highlight is one shape. */
  return out
}

/* ---------- Options and state ---------- */

type DiffViewerOptions = {
  /** The file before the change. With `after`, the diff is computed here. */
  before?: string
  /** The file after the change. Also what the copy button copies. */
  after?: string
  /** A unified diff (`git diff`), used when `before` and `after` are left out. */
  patch?: string
  /** The file name in the header. Read from the patch when left out. */
  filename?: string
  /** Which tokenizer colours the code. Defaults to one guessed from the file name. */
  language?: CodeBlockLanguage
  /** "unified" or "split", controlled. */
  view?: DiffView
  /** The view at first, when uncontrolled. Defaults to "unified". */
  defaultView?: DiffView
  /** Runs when the view wants to change. */
  onViewChange?: (view: DiffView) => void
  /** Below this width (px) the split view shows as unified. Defaults to 640. */
  splitMinWidth?: number
  /** Unchanged lines kept around each change. Defaults to 3. */
  context?: number
  /** Marks the words that changed inside a changed line. Defaults to true. */
  wordDiff?: boolean
  /** Shows Accept and Reject on every hunk. Defaults to on when `onAccept` or `onReject` is given. */
  review?: boolean
  /** Called with the hunk's index (and the hunk) when the reviewer accepts it. */
  onAccept?: (index: number, hunk: DiffHunk) => void
  /** Called with the hunk's index (and the hunk) when the reviewer rejects it. */
  onReject?: (index: number, hunk: DiffHunk) => void
  /** Called with the hunk's index when the reviewer takes a decision back. */
  onUndo?: (index: number, hunk: DiffHunk) => void
  /** Called after the copy button copied the new text. */
  onCopy?: (text: string) => void
}

/** What an agent reads about each hunk. */
type DiffHunkSummary = { index: number; range: string; section: string; additions: number; deletions: number; decision: DiffDecision | "pending"; gap?: string }
/** What an agent reads about each fold. */
type DiffFoldSummary = { key: string; lines: number; expanded: boolean; expandable: boolean }

type DiffViewerState = {
  model: DiffModel
  filename: string
  language: CodeBlockLanguage
  /** The view asked for. */
  view: DiffView
  /** The view on screen: unified while narrow. */
  shown: DiffView
  narrow: boolean
  splitMinWidth: number
  wordDiff: boolean
  review: boolean
  /** Keys of the folds that are open. */
  expanded: string[]
  /** Decisions by hunk index. */
  decisions: Record<string, DiffDecision>
  /** The view changed since mount, so content arrives by the switch instead of cascading again. */
  switched: boolean
  copied: boolean
  /** What the copy button copies. */
  text: string
  additions: number
  deletions: number
  hunks: DiffHunkSummary[]
  folds: DiffFoldSummary[]
  /** One sentence for agents: the counts and every hunk with its decision. */
  summary: string
}

/* The diff is rebuilt only when its inputs change, so the hunks keep their identity and rows don't
   re-render for nothing. A few recent inputs are kept, for pages with more than one viewer. */
const models: { key: string; model: DiffModel }[] = []
function modelOf(options: DiffViewerOptions): DiffModel {
  const key = JSON.stringify([options.before, options.after, options.patch, options.context ?? 3, options.wordDiff ?? true])
  const hit = models.find((entry) => entry.key === key)
  if (hit) return hit.model
  const model = buildDiff({ before: options.before, after: options.after, patch: options.patch, context: options.context, words: options.wordDiff })
  models.unshift({ key, model })
  if (models.length > 6) models.pop()
  return model
}

const summaries = new WeakMap<DiffModel, Map<string, DiffHunkSummary[]>>()
function hunkSummaries(model: DiffModel, decisions: Record<string, DiffDecision>): DiffHunkSummary[] {
  const key = JSON.stringify(decisions)
  let byModel = summaries.get(model)
  if (!byModel) summaries.set(model, (byModel = new Map()))
  let list = byModel.get(key)
  if (!list) {
    list = model.blocks.flatMap((block) =>
      block.type === "hunk"
        ? [{
            index: block.hunk.index,
            range: block.hunk.range,
            section: block.hunk.section,
            additions: block.hunk.additions,
            deletions: block.hunk.deletions,
            decision: decisions[block.hunk.index] ?? "pending",
            gap: block.gap?.key,
          }]
        : [],
    )
    if (byModel.size > 32) byModel.clear()
    byModel.set(key, list)
  }
  return list
}

const foldCache = new WeakMap<DiffModel, Map<string, DiffFoldSummary[]>>()
function foldSummaries(model: DiffModel, expanded: string[]): DiffFoldSummary[] {
  const key = expanded.join(",")
  let byModel = foldCache.get(model)
  if (!byModel) foldCache.set(model, (byModel = new Map()))
  let list = byModel.get(key)
  if (!list) {
    list = model.gaps.map((gap) => ({ key: gap.key, lines: gap.count, expanded: expanded.includes(gap.key), expandable: !!gap.lines }))
    if (byModel.size > 32) byModel.clear()
    byModel.set(key, list)
  }
  return list
}

const summaryOf = (filename: string, model: DiffModel, hunks: DiffHunkSummary[]) =>
  `${filename || "File"}: +${model.additions} −${model.deletions} in ${hunks.length} ${hunks.length === 1 ? "change" : "changes"}. ` +
  hunks.map((h) => `${h.index + 1}. ${h.range}${h.section ? ` ${h.section}` : ""} (+${h.additions} −${h.deletions}, ${h.decision})`).join("; ")

const fromOptions = (options: DiffViewerOptions) => {
  const model = modelOf(options)
  const filename = options.filename ?? model.filename ?? ""
  return {
    model,
    filename,
    language: options.language ?? languageOf(filename),
    splitMinWidth: options.splitMinWidth ?? 640,
    wordDiff: options.wordDiff ?? true,
    review: options.review ?? !!(options.onAccept || options.onReject),
    text: options.after ?? options.patch ?? "",
    additions: model.additions,
    deletions: model.deletions,
  }
}

const diffViewer = definePrimitive({
  name: "diff-viewer",
  options: {
    before: "string",
    after: "string",
    patch: "string",
    filename: "string",
    language: "string",
    view: "string",
    defaultView: "string",
    onViewChange: "callback",
    splitMinWidth: "number",
    context: "number",
    wordDiff: "boolean",
    review: "boolean",
    onAccept: "callback",
    onReject: "callback",
    onUndo: "callback",
    onCopy: "callback",
  },
  controlled: ["filename", "view", "summary", "additions", "deletions", "hunks", "folds", "expanded"],
  state: (options: DiffViewerOptions): DiffViewerState => {
    const base = fromOptions(options)
    const view = options.view ?? options.defaultView ?? "unified"
    return {
      ...base,
      view,
      shown: view,
      narrow: false,
      expanded: [],
      decisions: {},
      switched: false,
      copied: false,
      hunks: hunkSummaries(base.model, {}),
      folds: foldSummaries(base.model, []),
      summary: summaryOf(base.filename, base.model, hunkSummaries(base.model, {})),
    }
  },
  sync: (options) => ({ ...fromOptions(options), ...(options.view === undefined ? {} : { view: options.view }) }),
  api: (context) => {
    const { store } = context
    const change = createChange(context)
    let timer: ReturnType<typeof setTimeout> | undefined
    context.onDestroy(() => clearTimeout(timer))

    /* Keep what follows from the rest current: the view on screen, the summaries, and a fresh start
       (folds closed, decisions cleared) when the diff itself changes. */
    let seen = { model: store.get().model, view: store.get().view, narrow: store.get().narrow, expanded: store.get().expanded, decisions: store.get().decisions, filename: store.get().filename }
    context.onDestroy(
      store.subscribe(() => {
        const s = store.get()
        if (s.model === seen.model && s.view === seen.view && s.narrow === seen.narrow && s.expanded === seen.expanded && s.decisions === seen.decisions && s.filename === seen.filename) return
        const fresh = s.model !== seen.model
        const expanded = fresh ? [] : s.expanded
        const decisions = fresh ? {} : s.decisions
        const shown: DiffView = s.narrow ? "unified" : s.view
        const switched = s.switched || (shown !== s.shown && !fresh)
        seen = { model: s.model, view: s.view, narrow: s.narrow, expanded, decisions, filename: s.filename }
        const hunks = hunkSummaries(s.model, decisions)
        store.set({
          expanded,
          decisions,
          shown,
          switched: fresh ? false : switched,
          hunks,
          folds: foldSummaries(s.model, expanded),
          summary: summaryOf(s.filename, s.model, hunks),
          ...(fresh ? { copied: false } : {}),
        })
      }),
    )

    const hunk = (index: number) => store.get().model.hunks[index]
    const decide = (index: number, decision: DiffDecision | undefined) => {
      const h = hunk(index)
      if (!h) return false
      const decisions = { ...store.get().decisions }
      if (decision) decisions[index] = decision
      else delete decisions[index]
      store.set({ decisions })
      announce(decision ? `Change ${index + 1} ${decision}` : `Change ${index + 1} back to pending`)
      const options = context.options()
      if (decision === "accepted") options.onAccept?.(index, h)
      else if (decision === "rejected") options.onReject?.(index, h)
      else options.onUndo?.(index, h)
      return true
    }

    const write = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
      } catch {
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

    const setView = (view: DiffView, event?: Event) => {
      if (view !== "unified" && view !== "split") throw new Error(`No view "${view}". Views: unified, split.`)
      if (view === store.get().view) return false
      return change("view", view, { reason: "item-press", event })
    }

    return {
      /** Shows "unified" or "split". */
      setView,
      /** Switches between unified and split. */
      toggleView: (event?: Event) => setView(store.get().view === "split" ? "unified" : "split", event),
      /** Opens a fold of unchanged lines, by its key ("g0", "g1", ...). */
      expandFold(key: string) {
        const s = store.get()
        const gap = s.model.gaps.find((g) => g.key === key)
        if (!gap) throw new Error(`No fold "${key}". Folds: ${s.model.gaps.map((g) => g.key).join(", ") || "none"}.`)
        if (!gap.lines || s.expanded.includes(key)) return false
        store.set({ expanded: [...s.expanded, key] })
        return true
      },
      /** Opens every fold that can be opened. */
      expandAll() {
        const s = store.get()
        const keys = s.model.gaps.filter((g) => g.lines && !s.expanded.includes(g.key)).map((g) => g.key)
        if (!keys.length) return false
        store.set({ expanded: [...s.expanded, ...keys] })
        return true
      },
      /** Closes every fold again. */
      collapseAll() {
        if (!store.get().expanded.length) return false
        store.set({ expanded: [] })
        return true
      },
      /** Accepts a hunk, by index. */
      accept: (index: number) => decide(index, "accepted"),
      /** Rejects a hunk, by index. */
      reject: (index: number) => decide(index, "rejected"),
      /** Takes a hunk's decision back. */
      undo: (index: number) => decide(index, undefined),
      /** Copies the new text (or the patch), shows "Copied" for two seconds and tells screen readers. */
      async copy() {
        const text = store.get().text
        await write(text)
        clearTimeout(timer)
        store.set({ copied: true })
        announce("Copied")
        context.options().onCopy?.(text)
        const el = context.element("copy")
        const speed = (el && parseFloat(getComputedStyle(el).getPropertyValue("--kf-speed"))) || 1
        timer = setTimeout(() => store.set({ copied: false }), 2000 * speed)
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, { view: DiffView; narrow: boolean; copied: boolean }>({
      state: (state) => ({ view: state.shown, narrow: state.narrow, copied: state.copied }),
      attrs: (state) => ({
        "data-view": state.shown,
        "data-narrow": state.narrow ? "" : undefined,
        "data-switched": state.switched ? "" : undefined,
        "data-copied": state.copied ? "" : undefined,
        "data-review": state.review ? "" : undefined,
      }),
      /* Falls back to unified while the viewer is narrower than `splitMinWidth`. */
      bind: (el, part) => {
        if (typeof ResizeObserver === "undefined") return
        const check = () => {
          const narrow = el.getBoundingClientRect().width < part.store.get().splitMinWidth
          if (narrow !== part.store.get().narrow) part.store.set({ narrow })
        }
        check()
        const observer = new ResizeObserver(check)
        observer.observe(el)
        return () => observer.disconnect()
      },
    }),
    header: slot({}),
    title: slot<{}, { filename: string }>({
      state: (state) => ({ filename: state.filename }),
    }),
    /* The +added and −removed counts. Read out as words. */
    stats: slot<{}, { additions: number; deletions: number }>({
      state: (state) => ({ additions: state.additions, deletions: state.deletions }),
      attrs: (state) => ({
        role: "img",
        "aria-label": `${state.additions} ${state.additions === 1 ? "addition" : "additions"}, ${state.deletions} ${state.deletions === 1 ? "deletion" : "deletions"}`,
      }),
    }),
    actions: slot({}),
    /* The unified / split switch: two pressed-state buttons in a group. */
    "view-switch": slot<{}, { view: DiffView; narrow: boolean }>({
      role: "group",
      state: (state) => ({ view: state.shown, narrow: state.narrow }),
      attrs: (state) => ({
        "aria-label": "View",
        "data-view": state.shown,
        "data-narrow": state.narrow ? "" : undefined,
      }),
    }),
    "view-option": slot<{ value: string }, { selected: boolean; disabled: boolean }>({
      props: { value: "string" },
      role: "button",
      focus: "native",
      state: (state, part) => ({ selected: state.shown === part.key, disabled: part.key === "split" && state.narrow }),
      attrs: (state, part) => ({
        type: "button",
        "aria-pressed": String(state.shown === part.key),
        "data-selected": state.shown === part.key ? "" : undefined,
        "data-value": part.key,
        "aria-disabled": part.key === "split" && state.narrow ? "true" : undefined,
        "data-disabled": part.key === "split" && state.narrow ? "" : undefined,
      }),
      press: ({ api, key, store }, event) => {
        if (key === "split" && store.get().narrow) return
        void api.setView(key as DiffView, event)
      },
    }),
    copy: slot<{}, { copied: boolean }>({
      role: "button",
      focus: "native",
      state: (state) => ({ copied: state.copied }),
      attrs: (state) => ({
        type: "button",
        "aria-label": state.copied ? "Copied" : "Copy new version",
        "data-copied": state.copied ? "" : undefined,
      }),
      press: ({ api }) => void api.copy(),
    }),
    /* The scrolling body. Renders every block of the diff unless given children. */
    content: slot<{}, { model: DiffModel; view: DiffView; expanded: string[]; review: boolean; language: CodeBlockLanguage; wordDiff: boolean }>({
      state: (state) => ({
        model: state.model,
        view: state.shown,
        expanded: state.expanded,
        review: state.review,
        language: state.language,
        wordDiff: state.wordDiff,
      }),
      attrs: (state) => ({
        role: "region",
        tabindex: "0",
        dir: "ltr",
        "aria-label": state.filename ? `Changes to ${state.filename}` : "Changes",
        "data-view": state.shown,
      }),
    }),
    /* One hunk's lines. `--diff-hunk-index` gives its place, for a cascade. */
    hunk: slot<{ value: string }, { decision: DiffDecision | undefined; index: number }>({
      props: { value: "string" },
      state: (state, part) => ({ decision: state.decisions[part.key], index: Number(part.key) }),
      attrs: (state, part) => ({
        role: "group",
        "aria-label": `Change ${Number(part.key) + 1} of ${state.model.hunks.length}`,
        "data-decision": state.decisions[part.key],
        "data-hunk": part.key,
        style: css({ "--diff-hunk-index": Math.min(Number(part.key), 12) }),
      }),
    }),
    /* The row above a hunk: its fold, its range and the review actions. */
    "hunk-header": slot<{ value: string }, { hunk: DiffHunk | undefined; decision: DiffDecision | undefined; review: boolean }>({
      props: { value: "string" },
      state: (state, part) => ({ hunk: state.model.hunks[Number(part.key)], decision: state.decisions[part.key], review: state.review }),
      attrs: (state, part) => ({
        "data-decision": state.decisions[part.key],
        "data-hunk": part.key,
        style: css({ "--diff-hunk-index": Math.min(Number(part.key), 12) }),
      }),
    }),
    /* A folded run after the last hunk. */
    gap: slot<{ value: string }, { lines: number }>({
      props: { value: "string" },
      state: (state, part) => ({ lines: state.model.gaps.find((g) => g.key === part.key)?.count ?? 0 }),
      attrs: (state) => ({ style: css({ "--diff-hunk-index": Math.min(state.model.hunks.length, 12) }) }),
    }),
    /* The button that opens a fold. Disabled when its lines aren't known (a patch). */
    fold: slot<{ value: string }, { lines: number; expandable: boolean }>({
      props: { value: "string" },
      role: "button",
      focus: "native",
      state: (state, part) => {
        const gap = state.model.gaps.find((g) => g.key === part.key)
        return { lines: gap?.count ?? 0, expandable: !!gap?.lines }
      },
      attrs: (state, part) => {
        const gap = state.model.gaps.find((g) => g.key === part.key)
        return {
          type: "button",
          "aria-expanded": "false",
          "aria-label": `Show ${gap?.count ?? 0} unchanged ${gap?.count === 1 ? "line" : "lines"}`,
          "aria-disabled": gap?.lines ? undefined : "true",
          "data-disabled": gap?.lines ? undefined : "",
          "data-fold": part.key,
        }
      },
      press: ({ api, key }) => void api.expandFold(key),
    }),
    /* A fold's lines once opened. */
    expanded: slot<{ value: string }, {}>({
      props: { value: "string" },
      attrs: (_state, part) => ({ "data-fold": part.key }),
    }),
    accept: slot<{ value: string }, { decision: DiffDecision | undefined }>({
      props: { value: "string" },
      role: "button",
      focus: "native",
      present: (state, part) => state.review && !state.decisions[part.key],
      state: (state, part) => ({ decision: state.decisions[part.key] }),
      attrs: (_state, part) => ({ type: "button", "aria-label": `Accept change ${Number(part.key) + 1}` }),
      press: ({ api, key }) => void api.accept(Number(key)),
    }),
    reject: slot<{ value: string }, { decision: DiffDecision | undefined }>({
      props: { value: "string" },
      role: "button",
      focus: "native",
      present: (state, part) => state.review && !state.decisions[part.key],
      state: (state, part) => ({ decision: state.decisions[part.key] }),
      attrs: (_state, part) => ({ type: "button", "aria-label": `Reject change ${Number(part.key) + 1}` }),
      press: ({ api, key }) => void api.reject(Number(key)),
    }),
    /* The decision, once taken: "Accepted" or "Rejected". */
    status: slot<{ value: string }, { decision: DiffDecision | undefined }>({
      props: { value: "string" },
      present: (state, part) => state.review && !!state.decisions[part.key],
      state: (state, part) => ({ decision: state.decisions[part.key] }),
      attrs: (state, part) => ({ "data-decision": state.decisions[part.key] }),
    }),
    undo: slot<{ value: string }, { decision: DiffDecision | undefined }>({
      props: { value: "string" },
      role: "button",
      focus: "native",
      present: (state, part) => state.review && !!state.decisions[part.key],
      state: (state, part) => ({ decision: state.decisions[part.key] }),
      attrs: (_state, part) => ({ type: "button", "aria-label": `Undo decision on change ${Number(part.key) + 1}` }),
      press: ({ api, key }) => void api.undo(Number(key)),
    }),
  }),
  /* Agents read the file, the counts, the hunks and the folds, and change only what is shown.
     Accepting or rejecting an edit stays with the person reviewing it. */
  agent: { actions: ["setView", "toggleView", "expandFold", "expandAll", "collapseAll"] },
})

export {
  type DiffDecision,
  type DiffFoldSummary,
  type DiffHunkSummary,
  type DiffSegment,
  type DiffView,
  diffViewer,
  type DiffViewerOptions,
  type DiffViewerState,
  languageOf,
  segmentsOf,
}
export { buildDiff, type DiffBlock, type DiffGap, type DiffHunk, type DiffLine, type DiffModel, diffWords, parsePatch, type SplitRow, splitRows } from "@/components/core/diff-viewer-diff"
