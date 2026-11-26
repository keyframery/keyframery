/* The diff behind the diff viewer: no package, no DOM. Plain TypeScript, so it runs anywhere.

   - `diffLines` is Myers' O(ND) difference algorithm in its linear-space form (the "middle snake",
     divide and conquer), on lines hashed to integers. Common prefix and suffix are stripped first, so
     the usual agent edit (a few hunks in a long file) costs close to nothing.
   - `diffWords` runs the same algorithm on the words of two paired lines and returns the character
     ranges that changed on each side.
   - `parsePatch` reads a unified diff (`git diff`, `diff -u`).
   - `buildDiff` groups the edit script into hunks with a few lines of context and leaves the long
     unchanged runs between them as gaps that can be folded. */

/** One line of a diff. `old` and `new` are 1-based line numbers on each side. */
type DiffLine = {
  kind: "context" | "added" | "removed"
  text: string
  old?: number
  new?: number
  /** Character ranges, `[start, end)`, that changed inside this line (set on paired lines only). */
  words?: [number, number][]
}

/** A group of changes with its context. */
type DiffHunk = {
  index: number
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  /** The `@@ -a,b +c,d @@` range. */
  range: string
  /** The enclosing function or block, when known. */
  section: string
  lines: DiffLine[]
  additions: number
  deletions: number
}

/** A run of unchanged lines between hunks. Without `lines` (a patch), it can't be expanded. */
type DiffGap = {
  key: string
  count: number
  lines?: DiffLine[]
}

type DiffBlock = { type: "gap"; gap: DiffGap } | { type: "hunk"; hunk: DiffHunk; gap?: DiffGap }

type DiffModel = {
  /** Gaps and hunks in file order. A hunk carries the gap right above it. */
  blocks: DiffBlock[]
  hunks: DiffHunk[]
  gaps: DiffGap[]
  additions: number
  deletions: number
  /** File name read from a patch's `+++` line. */
  filename?: string
}

type Op = { kind: DiffLine["kind"]; a: number; b: number }

/* ---------- Myers, linear space ---------- */

/** The edit script between two integer sequences: equal, delete, insert, in order. */
function myers(a: Int32Array, b: Int32Array): Op[] {
  const out: Op[] = []
  const max = a.length + b.length + 1
  const vf = new Int32Array(2 * max + 2)
  const vb = new Int32Array(2 * max + 2)

  const equal = (aLo: number, aHi: number, bLo: number) => {
    for (let i = aLo; i < aHi; i++) out.push({ kind: "context", a: i, b: bLo + (i - aLo) })
  }

  const run = (aLo: number, aHi: number, bLo: number, bHi: number) => {
    /* Common prefix and suffix. */
    let pre = 0
    while (aLo + pre < aHi && bLo + pre < bHi && a[aLo + pre] === b[bLo + pre]) pre++
    equal(aLo, aLo + pre, bLo)
    aLo += pre
    bLo += pre
    let suf = 0
    while (aHi - suf > aLo && bHi - suf > bLo && a[aHi - suf - 1] === b[bHi - suf - 1]) suf++
    const tailA = aHi - suf
    const tailB = bHi - suf

    if (aLo === tailA) for (let j = bLo; j < tailB; j++) out.push({ kind: "added", a: aLo, b: j })
    else if (bLo === tailB) for (let i = aLo; i < tailA; i++) out.push({ kind: "removed", a: i, b: bLo })
    else {
      const snake = middle(aLo, tailA, bLo, tailB)
      if (!snake || (snake[0] === aLo && snake[1] === bLo && snake[2] === tailA && snake[3] === tailB)) {
        /* Never expected; keeps the recursion finite whatever happens. */
        for (let i = aLo; i < tailA; i++) out.push({ kind: "removed", a: i, b: bLo })
        for (let j = bLo; j < tailB; j++) out.push({ kind: "added", a: tailA, b: j })
      } else {
        const [x, y, u, v] = snake
        run(aLo, x, bLo, y)
        equal(x, u, y)
        run(u, tailA, v, tailB)
      }
    }
    equal(tailA, aHi, tailB)
  }

  /* Finds the middle snake of a[aLo,aHi) against b[bLo,bHi): returns [x, y, u, v] in absolute indices,
     the snake running from (x, y) to (u, v). */
  const middle = (aLo: number, aHi: number, bLo: number, bHi: number): [number, number, number, number] | undefined => {
    const n = aHi - aLo
    const m = bHi - bLo
    const delta = n - m
    const odd = (delta & 1) !== 0
    const dmax = Math.ceil((n + m) / 2)
    const off = max
    vf[off + 1] = 0
    vb[off + 1] = 0
    for (let d = 0; d <= dmax; d++) {
      for (let k = -d; k <= d; k += 2) {
        let x = k === -d || (k !== d && vf[off + k - 1] < vf[off + k + 1]) ? vf[off + k + 1] : vf[off + k - 1] + 1
        let y = x - k
        const x0 = x
        const y0 = y
        while (x < n && y < m && a[aLo + x] === b[bLo + y]) x++, y++
        vf[off + k] = x
        const c = delta - k
        if (odd && c >= -(d - 1) && c <= d - 1 && vf[off + k] + vb[off + c] >= n) {
          return [aLo + x0, bLo + y0, aLo + x, bLo + y]
        }
      }
      for (let c = -d; c <= d; c += 2) {
        let x = c === -d || (c !== d && vb[off + c - 1] < vb[off + c + 1]) ? vb[off + c + 1] : vb[off + c - 1] + 1
        let y = x - c
        const x0 = x
        const y0 = y
        while (x < n && y < m && a[aHi - 1 - x] === b[bHi - 1 - y]) x++, y++
        vb[off + c] = x
        const k = delta - c
        if (!odd && k >= -d && k <= d && vf[off + k] + vb[off + c] >= n) {
          return [aHi - x, bHi - y, aHi - x0, bHi - y0]
        }
      }
    }
    return undefined
  }

  run(0, a.length, 0, b.length)
  return out
}

/** Hashes two lists of strings to shared integer ids. */
function hash(a: string[], b: string[]): [Int32Array, Int32Array] {
  const ids = new Map<string, number>()
  const id = (s: string) => {
    let v = ids.get(s)
    if (v === undefined) ids.set(s, (v = ids.size))
    return v
  }
  return [Int32Array.from(a, id), Int32Array.from(b, id)]
}

const splitLines = (text: string) => {
  if (!text) return []
  const lines = text.replace(/\r\n?/g, "\n").split("\n")
  if (lines[lines.length - 1] === "") lines.pop()
  return lines
}

/** A line-level diff of two texts, as diff lines in order (removals before additions in each change). */
function diffLines(before: string, after: string): DiffLine[] {
  const a = splitLines(before)
  const b = splitLines(after)
  const [ha, hb] = hash(a, b)
  const ops = myers(ha, hb)
  const out: DiffLine[] = []
  let removed: DiffLine[] = []
  let added: DiffLine[] = []
  const flush = () => {
    if (removed.length || added.length) out.push(...removed, ...added)
    removed = []
    added = []
  }
  for (const op of ops) {
    if (op.kind === "context") {
      flush()
      out.push({ kind: "context", text: a[op.a], old: op.a + 1, new: op.b + 1 })
    } else if (op.kind === "removed") removed.push({ kind: "removed", text: a[op.a], old: op.a + 1 })
    else added.push({ kind: "added", text: b[op.b], new: op.b + 1 })
  }
  flush()
  return out
}

/* ---------- Words ---------- */

const wordPattern = /[A-Za-z0-9_$]+|\s+|[^A-Za-z0-9_$\s]/g

/** Ranges that changed between two lines, or undefined when they share too little to be worth marking. */
function diffWords(before: string, after: string): { old: [number, number][]; new: [number, number][] } | undefined {
  if (before === after) return { old: [], new: [] }
  const ta = before.match(wordPattern) ?? []
  const tb = after.match(wordPattern) ?? []
  if (ta.length * tb.length > 250_000) return undefined
  const [ha, hb] = hash(ta, tb)
  const ops = myers(ha, hb)
  const starts = (tokens: string[]) => {
    const at = new Int32Array(tokens.length + 1)
    for (let i = 0; i < tokens.length; i++) at[i + 1] = at[i] + tokens[i].length
    return at
  }
  const sa = starts(ta)
  const sb = starts(tb)
  const old: [number, number][] = []
  const nu: [number, number][] = []
  let same = 0
  const push = (list: [number, number][], from: number, to: number) => {
    const last = list[list.length - 1]
    if (last && last[1] === from) last[1] = to
    else list.push([from, to])
  }
  for (const op of ops) {
    if (op.kind === "context") same += ta[op.a].trim() ? ta[op.a].length : 0
    else if (op.kind === "removed") push(old, sa[op.a], sa[op.a + 1])
    else push(nu, sb[op.b], sb[op.b + 1])
  }
  /* Lines that share less than 40% of their visible text are rewrites: the whole line says it. */
  const visible = Math.min(before.trim().length, after.trim().length) || 1
  if (same / visible < 0.4) return undefined
  /* Whitespace-only ranges at either end of a run read as noise; trim them. */
  const trim = (text: string, list: [number, number][]) =>
    list
      .map(([s, e]): [number, number] => {
        while (s < e && /\s/.test(text[s])) s++
        while (e > s && /\s/.test(text[e - 1])) e--
        return [s, e]
      })
      .filter(([s, e]) => e > s)
  return { old: trim(before, old), new: trim(after, nu) }
}

/** Pairs the removed and added lines of each change, in order, and marks the words that changed. */
function markWords(lines: DiffLine[]) {
  let i = 0
  while (i < lines.length) {
    if (lines[i].kind === "context") {
      i++
      continue
    }
    const removed: DiffLine[] = []
    const added: DiffLine[] = []
    while (i < lines.length && lines[i].kind === "removed") removed.push(lines[i++])
    while (i < lines.length && lines[i].kind === "added") added.push(lines[i++])
    const pairs = Math.min(removed.length, added.length)
    for (let p = 0; p < pairs; p++) {
      const words = diffWords(removed[p].text, added[p].text)
      if (!words) continue
      removed[p].words = words.old
      added[p].words = words.new
    }
  }
}

/* ---------- Patch ---------- */

type ParsedHunk = { oldStart: number; oldLines: number; newStart: number; newLines: number; section: string; lines: DiffLine[] }

/* Whether a hunk has all the lines its header promised. */
const done = (h: ParsedHunk, o: number, n: number) =>
  o >= h.oldStart + h.oldLines + (h.oldLines ? 0 : 1) && n >= h.newStart + h.newLines + (h.newLines ? 0 : 1)

/** Reads a unified diff. Only the first file in it is used. */
function parsePatch(patch: string): { filename?: string; hunks: ParsedHunk[] } {
  const hunks: ParsedHunk[] = []
  let filename: string | undefined
  let current: ParsedHunk | undefined
  let o = 0
  let n = 0
  let files = 0
  for (const raw of patch.replace(/\r\n?/g, "\n").split("\n")) {
    if (raw.startsWith("diff --git ")) {
      if (++files > 1) break
      continue
    }
    if (!current || done(current, o, n)) {
      if (raw.startsWith("+++ ")) {
        const name = raw.slice(4).split("\t")[0].trim()
        if (name !== "/dev/null") filename = name.replace(/^b\//, "")
        continue
      }
      if (raw.startsWith("--- ")) {
        const name = raw.slice(4).split("\t")[0].trim()
        if (!filename && name !== "/dev/null") filename = name.replace(/^a\//, "")
        continue
      }
    }
    const head = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@ ?(.*)$/.exec(raw)
    if (head) {
      current = {
        oldStart: Number(head[1]),
        oldLines: head[2] === undefined ? 1 : Number(head[2]),
        newStart: Number(head[3]),
        newLines: head[4] === undefined ? 1 : Number(head[4]),
        section: head[5].trim(),
        lines: [],
      }
      /* An empty side starts at 0; its first real line is the next one. */
      o = current.oldLines === 0 ? current.oldStart + 1 : current.oldStart
      n = current.newLines === 0 ? current.newStart + 1 : current.newStart
      hunks.push(current)
      continue
    }
    if (!current || raw.startsWith("\\")) continue
    const sign = raw[0]
    const text = raw.slice(1)
    if (sign === "+") current.lines.push({ kind: "added", text, new: n++ })
    else if (sign === "-") current.lines.push({ kind: "removed", text, old: o++ })
    else if (sign === " " || raw === "") {
      if (raw === "" && done(current, o, n)) continue
      current.lines.push({ kind: "context", text, old: o++, new: n++ })
    }
  }
  /* Removals before additions inside each change, as in a computed diff. */
  for (const hunk of hunks) {
    const sorted: DiffLine[] = []
    let removed: DiffLine[] = []
    let added: DiffLine[] = []
    for (const line of hunk.lines) {
      if (line.kind === "context") sorted.push(...removed, ...added, line), (removed = []), (added = [])
      else (line.kind === "removed" ? removed : added).push(line)
    }
    sorted.push(...removed, ...added)
    hunk.lines = sorted
  }
  return { filename, hunks }
}

/* ---------- Model ---------- */

const rangeOf = (h: { oldStart: number; oldLines: number; newStart: number; newLines: number }) =>
  `@@ -${h.oldStart},${h.oldLines} +${h.newStart},${h.newLines} @@`

/* Like git's default function name: the nearest line above that starts at column 0 with a word. */
function sectionBefore(lines: DiffLine[], index: number) {
  for (let i = index - 1, seen = 0; i >= 0 && seen < 400; i--, seen++) {
    const text = lines[i].text
    if (/^[A-Za-z_$@]/.test(text) && !/^(import|from|\/\/|\/\*|\})/.test(text)) return text.replace(/\s*\{\s*$/, "").trim().slice(0, 80)
  }
  return ""
}

type BuildOptions = {
  before?: string
  after?: string
  patch?: string
  /** Unchanged lines kept around each change. Defaults to 3. */
  context?: number
  /** Marks the words that changed inside paired lines. Defaults to true. */
  words?: boolean
}

function hunkOf(index: number, lines: DiffLine[], section: string): DiffHunk {
  let oldStart = 0
  let newStart = 0
  let oldLines = 0
  let newLines = 0
  let additions = 0
  let deletions = 0
  for (const line of lines) {
    if (line.old !== undefined) (oldStart ||= line.old), oldLines++
    if (line.new !== undefined) (newStart ||= line.new), newLines++
    if (line.kind === "added") additions++
    if (line.kind === "removed") deletions++
  }
  /* An empty side points at the line before it, as git writes it. */
  if (!oldLines) oldStart = Math.max(0, (lines.find((l) => l.new !== undefined)?.new ?? 1) - 1)
  if (!newLines) newStart = Math.max(0, (lines.find((l) => l.old !== undefined)?.old ?? 1) - 1)
  const h = { index, oldStart, oldLines, newStart, newLines }
  return { ...h, range: rangeOf(h), section, lines, additions, deletions }
}

/** Builds the hunks and gaps of a diff, from `before` and `after` or from a `patch`. */
function buildDiff(options: BuildOptions): DiffModel {
  const context = Math.max(0, Math.floor(options.context ?? 3))
  const words = options.words ?? true
  const hunks: DiffHunk[] = []
  const gaps: DiffGap[] = []
  const blocks: DiffBlock[] = []
  let filename: string | undefined

  if (options.patch !== undefined && options.before === undefined && options.after === undefined) {
    const parsed = parsePatch(options.patch)
    filename = parsed.filename
    let nextOld = 1
    parsed.hunks.forEach((p, index) => {
      if (words) markWords(p.lines)
      const hunk = hunkOf(index, p.lines, p.section)
      hunk.oldStart = p.oldStart
      hunk.newStart = p.newStart
      hunk.range = rangeOf(hunk)
      const hidden = p.oldStart - nextOld
      const gap = hidden > 0 ? { key: `g${index}`, count: hidden } : undefined
      if (gap) gaps.push(gap)
      hunks.push(hunk)
      blocks.push({ type: "hunk", hunk, gap })
      nextOld = p.oldStart + p.oldLines + (p.oldLines ? 0 : 1)
    })
  } else {
    const lines = diffLines(options.before ?? "", options.after ?? "")
    if (words) markWords(lines)
    /* Every changed line, then runs of them that sit within 2 × context (plus a little) of each other. */
    const changed: number[] = []
    lines.forEach((line, i) => line.kind !== "context" && changed.push(i))
    /* A fold shorter than this isn't worth a click: show those lines instead. */
    const minFold = 4
    const groups: [number, number][] = []
    for (const i of changed) {
      const last = groups[groups.length - 1]
      if (last && i - last[1] - 1 <= context * 2 + minFold - 1) last[1] = i
      else groups.push([i, i])
    }
    let cursor = 0
    const gapOf = (from: number, to: number, key: string): DiffGap | undefined => {
      if (to <= from) return undefined
      const gap = { key, count: to - from, lines: lines.slice(from, to) }
      gaps.push(gap)
      return gap
    }
    groups.forEach(([first, last], index) => {
      let start = Math.max(cursor, first - context)
      /* A leading run too short to fold joins the hunk. */
      if (start - cursor < minFold) start = cursor
      const end = Math.min(lines.length, last + context + 1)
      const gap = gapOf(cursor, start, `g${index}`)
      const hunk = hunkOf(index, lines.slice(start, end), sectionBefore(lines, start))
      hunks.push(hunk)
      blocks.push({ type: "hunk", hunk, gap })
      cursor = end
    })
    /* The rest of the file; a short tail joins the last hunk. */
    const rest = lines.length - cursor
    if (rest > 0) {
      const lastBlock = blocks[blocks.length - 1]
      if (lastBlock?.type === "hunk" && rest < minFold) {
        const merged = hunkOf(lastBlock.hunk.index, [...lastBlock.hunk.lines, ...lines.slice(cursor)], lastBlock.hunk.section)
        hunks[hunks.length - 1] = merged
        lastBlock.hunk = merged
      } else {
        const gap = gapOf(cursor, lines.length, `g${groups.length}`)
        if (gap) blocks.push({ type: "gap", gap })
      }
    }
  }
  let additions = 0
  let deletions = 0
  for (const h of hunks) (additions += h.additions), (deletions += h.deletions)
  return { blocks, hunks, gaps, additions, deletions, filename }
}

/** One row of the split view: the old line on the left, the new on the right. */
type SplitRow = { left?: DiffLine; right?: DiffLine }

/** Pairs lines for the split view: context on both sides, each removal beside the addition it became. */
function splitRows(lines: DiffLine[]): SplitRow[] {
  const rows: SplitRow[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.kind === "context") {
      rows.push({ left: line, right: line })
      i++
      continue
    }
    const removed: DiffLine[] = []
    const added: DiffLine[] = []
    while (i < lines.length && lines[i].kind === "removed") removed.push(lines[i++])
    while (i < lines.length && lines[i].kind === "added") added.push(lines[i++])
    for (let p = 0; p < Math.max(removed.length, added.length); p++) rows.push({ left: removed[p], right: added[p] })
  }
  return rows
}

export {
  buildDiff,
  type BuildOptions,
  type DiffBlock,
  type DiffGap,
  type DiffHunk,
  type DiffLine,
  diffLines,
  type DiffModel,
  diffWords,
  parsePatch,
  splitLines,
  type SplitRow,
  splitRows,
}
