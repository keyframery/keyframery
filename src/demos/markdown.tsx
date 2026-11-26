import * as React from "react"

import { Markdown } from "@/components/ui/markdown"

export const meta = { name: "Markdown", group: "AI" }

/* Regenerate the answer: it streams in again word by word, each block rising in as it starts while
   the blocks above it stay exactly where they are. */
export const play = [{ wait: 600 }, { click: '[data-play="regenerate"]', wait: 9000 }]

export const controls = {
  caret: { type: "switch", label: "Caret while streaming", default: true },
  showTable: { type: "switch", label: "Table", default: true },
  showCode: { type: "switch", label: "Code block", default: true },
  rate: { type: "slider", label: "Stream rate", min: 10, max: 120, step: 5, default: 40, unit: " words/s" },
  themeInk: { type: "color", label: "Body text", default: "", group: "Colours" },
  themeMuted: { type: "color", label: "Quotes and markers", default: "", group: "Colours" },
  themeLink: { type: "color", label: "Links", default: "", group: "Colours" },
  themeCaret: { type: "color", label: "Caret", default: "", group: "Colours" },
  themeCodeFace: { type: "color", label: "Inline code surface", default: "", group: "Colours" },
  themeFont: { type: "slider", label: "Body size", min: 12, max: 18, step: 0.5, default: 14, unit: "px", group: "Layout" },
  themeGap: { type: "slider", label: "Block spacing", min: 4, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
} as const

const question = "We spent €1,284 on the Lisbon weekend. How do we split it fairly between the four of us?"

const intro = `## Who owes what

The weekend came to **€1,284**, so each share is **€321**. Maya paid for the flat, so she is owed the most.`

const table = `| Person | Paid | Share | Settles |
| :-- | --: | --: | --: |
| Maya | €612 | €321 | gets €291 |
| Theo | €388 | €321 | gets €67 |
| Priya | €184 | €321 | pays €137 |
| You | €100 | €321 | pays €221 |`

const transfers = `### The fewest transfers

1. You send Maya **€221**.
2. Priya sends Maya €70 and Theo €67.
   - Both can go through [Wise](https://wise.com) with no fee.

> Three transfers settle everything, and Maya never has to send money back.`

const code = `To keep it current as receipts come in, put this in a \`Settles\` column:

\`\`\`sheets
=SUMIF(Expenses!B:B, A2, Expenses!C:C) - SUM(Expenses!C:C) / 4
\`\`\``

const tasks = `- [x] Flat and flights logged
- [ ] Add *Saturday's dinner* at Ramiro`

/* Words with the spaces after them, so a chunk never splits a word. */
const chunk = (text: string) => text.match(/\s*\S+/g) ?? []

export default function MarkdownDemo({
  caret = true,
  showTable = true,
  showCode = true,
  rate = 40,
  themeInk = "",
  themeMuted = "",
  themeLink = "",
  themeCaret = "",
  themeCodeFace = "",
  themeFont = 14,
  themeGap = 12,
}: {
  caret?: boolean
  showTable?: boolean
  showCode?: boolean
  rate?: number
  themeInk?: string
  themeMuted?: string
  themeLink?: string
  themeCaret?: string
  themeCodeFace?: string
  themeFont?: number
  themeGap?: number
}) {
  const answer = [intro, showTable && table, transfers, showCode && code, tasks].filter(Boolean).join("\n\n")
  const [shown, setShown] = React.useState<string | null>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const scroller = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const streaming = shown !== null
  const text = shown ?? answer

  /* A model's stream: one to three words at a time, at an uneven pace. */
  const regenerate = (e: React.MouseEvent<HTMLButtonElement>) => {
    const speed = parseFloat(getComputedStyle(e.currentTarget).getPropertyValue("--kf-speed")) || 1
    const words = chunk(answer)
    clearTimeout(timer.current)
    let at = 0
    setShown("")
    scroller.current?.scrollTo({ top: 0 })
    const tick = () => {
      at = Math.min(words.length, at + 1 + (at % 3 === 0 ? 1 : 0) + (at % 7 === 0 ? 1 : 0))
      if (at >= words.length) {
        setShown(null)
        return
      }
      setShown(words.slice(0, at).join(""))
      timer.current = setTimeout(tick, ((1000 / rate) * 1.6 + (at % 5) * 6) * Math.max(0.5, speed))
    }
    timer.current = setTimeout(tick, 320 * speed)
  }

  /* Follow the end while it streams. */
  React.useLayoutEffect(() => {
    const el = scroller.current
    if (el && streaming) el.scrollTop = el.scrollHeight
  }, [text, streaming])

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeInk ? { "--markdown-ink": themeInk } : null),
    ...(themeMuted ? { "--markdown-muted": themeMuted } : null),
    ...(themeLink ? { "--markdown-link": themeLink } : null),
    ...(themeCaret ? { "--markdown-caret": themeCaret } : null),
    ...(themeCodeFace ? { "--markdown-code-face": themeCodeFace } : null),
    ...(themeFont !== 14 ? { "--markdown-font": `${themeFont}px` } : null),
    ...(themeGap !== 12 ? { "--markdown-gap": `${themeGap}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container flex w-full max-w-[520px] flex-col">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-muted px-3.5 py-2.5 text-[13px] leading-snug">{question}</div>
      </div>

      <div
        ref={scroller}
        className="mt-4 h-[400px] overflow-y-auto overscroll-contain pe-1 [scrollbar-width:none] [mask-image:linear-gradient(to_bottom,transparent,black_20px,black_calc(100%-28px),transparent)] @max-[26rem]:h-[460px]"
      >
        <Markdown streaming={streaming} caret={caret} className="py-4" aria-label="Answer">
          {text}
        </Markdown>
      </div>

      <div className="mt-2 flex items-center gap-1 text-[12px] text-muted-foreground">
        <span className="me-auto">{streaming ? "Writing…" : "Answered in 4.1s"}</span>
        <button
          type="button"
          data-play="regenerate"
          onClick={regenerate}
          disabled={streaming}
          className="inline-flex h-7 items-center gap-1.5 rounded-[8px] px-2.5 leading-none font-medium outline-none transition-[scale,color,background-color,opacity] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:bg-foreground/[0.045] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[calc(1-0.04*var(--kf-flourish,1))] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-3.5">
            <path d="M13.25 8a5.25 5.25 0 1 1-1.54-3.71M13.25 2.75v2.5h-2.5" />
          </svg>
          Regenerate
        </button>
      </div>
    </div>
  )
}
