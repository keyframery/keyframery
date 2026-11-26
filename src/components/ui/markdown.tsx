"use client"

export * from "@/components/primitives/markdown"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --markdown-ink: Body text; default: text-foreground.
   --markdown-muted: Quotes, list markers and table headers; default: text-muted-foreground.
   --markdown-link: Links; default: text-foreground.
   --markdown-caret: Caret; default: bg-foreground.
   --markdown-code-face: Inline code surface; default: bg-muted.
   --markdown-font: Body size; default: text-[14px].
   --markdown-gap: Block spacing; default: gap-3.
*/

/* Styled markdown: the animated primitive plus the Keyframery look. Plain reading type on the theme's
   own tokens: quiet headings one weight step up, underlined links, inline code on a muted chip,
   tables in a hairline sheet with tabular figures, fenced code in Keyframery's code block, and a
   slim caret while the answer streams. */

import * as React from "react"

import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block"
import {
  Markdown as MarkdownRoot,
  type MarkdownCodeBlockProps,
  type MarkdownComponents,
  type MarkdownProps,
} from "@/components/primitives/markdown"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}


/* Fenced code: the styled code block, its language in the header and a copy key that waits for the
   closing fence. */
function MarkdownCodeBlock({ code, language, info, complete }: MarkdownCodeBlockProps) {
  return (
    <CodeBlock code={code} language={language} data-writing={complete ? undefined : ""} className="text-[13px]">
      <CodeBlockHeader>
        <CodeBlockTitle className="font-mono font-normal">{info || "code"}</CodeBlockTitle>
        <CodeBlockCopyButton className="ms-auto transition-[opacity,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house in-data-writing:pointer-events-none in-data-writing:opacity-0 motion-reduce:transition-none" />
      </CodeBlockHeader>
      <CodeBlockContent />
    </CodeBlock>
  )
}

const styled: MarkdownComponents = { codeBlock: MarkdownCodeBlock }

const look = cn(
  "flex min-w-0 flex-col gap-[var(--markdown-gap,0.75rem)] text-[length:var(--markdown-font,14px)] leading-[1.65] [overflow-wrap:anywhere]",
  "text-[color:var(--markdown-ink,var(--foreground))]",
  /* Headings: one weight step up, a little more air above them than between paragraphs. */
  "[&_[data-slot=markdown-heading]]:font-semibold [&_[data-slot=markdown-heading]]:leading-[1.3] [&_[data-slot=markdown-heading]]:tracking-tight",
  "[&>[data-slot=markdown-heading]:not(:first-child)]:mt-[calc(var(--markdown-gap,0.75rem)*0.6)]",
  "[&_[data-level='1']]:text-[1.43em] [&_[data-level='2']]:text-[1.22em] [&_[data-level='3']]:text-[1.07em]",
  /* Inline. */
  "[&_[data-slot=markdown-strong]]:font-semibold [&_[data-slot=markdown-em]]:italic",
  "[&_[data-slot=markdown-del]]:line-through [&_[data-slot=markdown-del]]:decoration-[color-mix(in_oklab,currentColor_55%,transparent)]",
  "[&_[data-slot=markdown-del]]:text-[color:var(--markdown-muted,var(--muted-foreground))]",
  "[&_[data-slot=markdown-code]]:rounded-[5px] [&_[data-slot=markdown-code]]:bg-[var(--markdown-code-face,var(--muted))] [&_[data-slot=markdown-code]]:px-[0.35em] [&_[data-slot=markdown-code]]:py-[0.12em] [&_[data-slot=markdown-code]]:font-mono [&_[data-slot=markdown-code]]:text-[0.86em] [&_[data-slot=markdown-code]]:[box-decoration-break:clone]",
  "[&_[data-slot=markdown-link]]:rounded-[3px] [&_[data-slot=markdown-link]]:text-[color:var(--markdown-link,var(--foreground))] [&_[data-slot=markdown-link]]:underline [&_[data-slot=markdown-link]]:decoration-[color-mix(in_oklab,currentColor_32%,transparent)] [&_[data-slot=markdown-link]]:decoration-1 [&_[data-slot=markdown-link]]:underline-offset-[3px] [&_[data-slot=markdown-link]]:outline-none",
  "[&_[data-slot=markdown-link]]:transition-[text-decoration-color] [&_[data-slot=markdown-link]]:duration-[calc(150ms*var(--kf-speed,1))] [&_[data-slot=markdown-link]]:ease-house motion-reduce:[&_[data-slot=markdown-link]]:transition-none",
  "[&_[data-slot=markdown-link][href]:hover]:decoration-current [&_[data-slot=markdown-link]]:focus-visible:ring-2 [&_[data-slot=markdown-link]]:focus-visible:ring-ring [&_[data-slot=markdown-link]]:focus-visible:ring-offset-2 [&_[data-slot=markdown-link]]:focus-visible:ring-offset-background",
  /* Lists: muted markers, a hanging indent, a little air between items. */
  "[&_[data-slot=markdown-list]]:list-disc [&_[data-slot=markdown-list]]:ps-[1.35em] [&_[data-slot=markdown-list][data-ordered]]:list-decimal",
  "[&_[data-slot=markdown-list]_[data-slot=markdown-list]:not([data-ordered])]:list-[circle]",
  "[&_[data-slot=markdown-item]]:ps-[0.15em] [&_[data-slot=markdown-item]]:marker:tabular-nums",
  "[&_[data-slot=markdown-item]]:marker:text-[color:var(--markdown-muted,var(--muted-foreground))]",
  "[&_[data-slot=markdown-item]+[data-slot=markdown-item]]:mt-[0.3em] [&_[data-slot=markdown-item]>*+*]:mt-[0.3em] [&_[data-slot=markdown-item]>[data-slot=markdown-list]]:mt-[0.3em]",
  /* Tasks: a small read-only box in place of the bullet. */
  "[&_[data-slot=markdown-list][data-tasks]]:list-none [&_[data-slot=markdown-list][data-tasks]]:ps-0",
  "[&_[data-slot=markdown-item][data-task]]:ps-[1.6em] [&_[data-slot=markdown-item][data-task]]:-indent-[1.6em] [&_[data-slot=markdown-item][data-task]_*]:indent-0",
  "[&_[data-slot=markdown-checkbox]]:me-[0.6em] [&_[data-slot=markdown-checkbox]]:inline-grid [&_[data-slot=markdown-checkbox]]:size-[1em] [&_[data-slot=markdown-checkbox]]:translate-y-[0.14em] [&_[data-slot=markdown-checkbox]]:place-items-center [&_[data-slot=markdown-checkbox]]:rounded-[4px] [&_[data-slot=markdown-checkbox]]:align-baseline",
  "[&_[data-slot=markdown-checkbox]]:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--foreground)_24%,transparent)]",
  "[&_[data-slot=markdown-checkbox][data-checked]]:bg-primary [&_[data-slot=markdown-checkbox][data-checked]]:text-primary-foreground [&_[data-slot=markdown-checkbox][data-checked]]:shadow-none [&_[data-slot=markdown-checkbox]_svg]:size-[0.75em]",
  /* Quote: a hairline rule at the start, muted text. */
  "[&_[data-slot=markdown-quote]]:flex [&_[data-slot=markdown-quote]]:flex-col [&_[data-slot=markdown-quote]]:gap-[calc(var(--markdown-gap,0.75rem)*0.6)] [&_[data-slot=markdown-quote]]:border-s-2 [&_[data-slot=markdown-quote]]:border-border [&_[data-slot=markdown-quote]]:ps-[0.9em]",
  "[&_[data-slot=markdown-quote]]:text-[color:var(--markdown-muted,var(--muted-foreground))]",
  "[&_[data-slot=markdown-rule]]:my-[calc(var(--markdown-gap,0.75rem)*0.4)] [&_[data-slot=markdown-rule]]:h-px [&_[data-slot=markdown-rule]]:border-0 [&_[data-slot=markdown-rule]]:bg-border",
  /* Table: a hairline sheet that scrolls sideways on a narrow screen. */
  "[&_[data-slot=markdown-table]]:max-w-full [&_[data-slot=markdown-table]]:overflow-x-auto [&_[data-slot=markdown-table]]:rounded-[10px] [&_[data-slot=markdown-table]]:[scrollbar-width:thin]",
  "[&_[data-slot=markdown-table]]:shadow-[inset_0_0_0_1px_var(--border)]",
  "[&_[data-slot=markdown-table]_table]:w-full [&_[data-slot=markdown-table]_table]:border-collapse [&_[data-slot=markdown-table]_table]:text-[0.93em] [&_[data-slot=markdown-table]_table]:leading-[1.45] [&_[data-slot=markdown-table]_table]:tabular-nums",
  "[&_[data-slot=markdown-table]_th]:bg-[color-mix(in_oklab,var(--muted)_60%,transparent)] [&_[data-slot=markdown-table]_th]:px-3 [&_[data-slot=markdown-table]_th]:py-2 [&_[data-slot=markdown-table]_th]:text-start [&_[data-slot=markdown-table]_th]:font-medium [&_[data-slot=markdown-table]_th]:whitespace-nowrap",
  "[&_[data-slot=markdown-table]_th]:text-[color:var(--markdown-muted,var(--muted-foreground))]",
  "[&_[data-slot=markdown-table]_td]:border-t [&_[data-slot=markdown-table]_td]:border-border [&_[data-slot=markdown-table]_td]:px-3 [&_[data-slot=markdown-table]_td]:py-2",
  "[&_[data-slot=markdown-table]_:is(th,td):first-child]:ps-3.5 [&_[data-slot=markdown-table]_:is(th,td):last-child]:pe-3.5",
  /* Caret: a slim bar at the end of the text. */
  "[&_[data-slot=markdown-caret]]:ms-[1px] [&_[data-slot=markdown-caret]]:inline-block [&_[data-slot=markdown-caret]]:h-[1.1em] [&_[data-slot=markdown-caret]]:w-[2px] [&_[data-slot=markdown-caret]]:translate-y-[0.2em] [&_[data-slot=markdown-caret]]:rounded-full [&_[data-slot=markdown-caret]]:bg-[var(--markdown-caret,var(--foreground))]",
)

/* The answer's text, as markdown. Pass the string as children or `content`; set `streaming` while it
   is still arriving. */
function Markdown({ speed, className, components, ...props }: MarkdownProps & SpeedProps) {
  const merged = React.useMemo(() => (components ? { ...styled, ...components } : styled), [components])
  return (
    <Speed speed={speed}>
      <MarkdownRoot className={withClass(look, className)} components={merged} {...props} />
    </Speed>
  )
}

export { Markdown, MarkdownCodeBlock }
export type { MarkdownCodeBlockProps, MarkdownComponents, MarkdownProps } from "@/components/primitives/markdown"
