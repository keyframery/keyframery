/* UI SDK parts for markdown, made once from the shared core definition (the same file React uses),
   and the pieces every block shares. */
import type { Component, VNode } from "vue"
import { createParts } from "@ui-sdk/vue/primitive"

import type { CodeBlockLanguage } from "@/components/keyframery/core/code-block-core"
import { markdown, type MarkdownBlock } from "@/components/keyframery/core/markdown-core"
import { cn } from "@/lib/utils"

export const parts = createParts(markdown, { root: "div", caret: "span" })

const keyframes = [
  "@keyframes kf-markdown-rise{from{opacity:0;translate:0 calc(6px*var(--kf-flourish,1));filter:blur(calc(3px*var(--kf-flourish,1)))}}",
  "@keyframes kf-markdown-caret{50%{opacity:0.2}}",
].join("")
if (typeof document !== "undefined" && !document.getElementById("kf-markdown")) {
  const style = document.createElement("style")
  style.id = "kf-markdown"
  style.textContent = keyframes
  document.head.append(style)
}

/** What a fenced code block renderer receives. */
export type MarkdownCodeBlockProps = {
  /** The code, without its fences. */
  code: string
  /** The tokenizer's language for the fence's info string ("text" when unknown). */
  language: CodeBlockLanguage
  /** The fence's info string as written, like "tsx" or "python". */
  info: string
  /** False while the closing fence has not arrived yet. */
  complete: boolean
}

export type MarkdownElement =
  | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "a" | "strong" | "em" | "del" | "code" | "br"
  | "ul" | "ol" | "li" | "blockquote" | "hr" | "table" | "thead" | "tbody" | "tr" | "th" | "td"

/** Your own element for any of them, and `codeBlock` for fenced code. Each gets the element's props, including
    its `data-slot`: a tag name, a component, or a function of the props returning an `h()` vnode, like
    `a: (props) => h("a", { ...props, class: "text-primary" })` (the element's content goes inside it). */
export type MarkdownComponents = Partial<Record<MarkdownElement, string | Component | ((props: Record<string, any>) => VNode)>> & {
  codeBlock?: Component | ((props: MarkdownCodeBlockProps) => VNode)
}

/* Equal source, equal block: keeps the previous parse's object for every block whose source, kind and
   live flag have not changed, so its component's props are identical and Vue does not render it again
   while the text after it grows. Only the last block grows. */
export function keepFinished(next: MarkdownBlock[], previous: MarkdownBlock[]): MarkdownBlock[] {
  return next.map((block, i) => {
    const old = previous[i]
    return old && old.source === block.source && old.live === block.live && old.type === block.type ? old : block
  })
}

/* Each direct child (a block) rises in as it arrives. */
export const rootMotion = cn(
  "*:animate-[kf-markdown-rise_calc(380ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_backwards]",
  "[&_[data-slot=code-block-line]]:[animation-delay:0ms]",
  "motion-reduce:*:animate-none!",
)

export const caretMotion = "animate-[kf-markdown-caret_calc(1000ms*var(--kf-speed,1))_var(--ease-house)_infinite] motion-reduce:animate-none"

export const look = cn(
  "flex min-w-0 flex-col gap-[var(--markdown-gap,0.75rem)] text-[length:var(--markdown-font,14px)] leading-[1.65] [overflow-wrap:anywhere]",
  "text-[color:var(--markdown-ink,var(--foreground))]",
  "[&_[data-slot=markdown-heading]]:font-semibold [&_[data-slot=markdown-heading]]:leading-[1.3] [&_[data-slot=markdown-heading]]:tracking-tight",
  "[&>[data-slot=markdown-heading]:not(:first-child)]:mt-[calc(var(--markdown-gap,0.75rem)*0.6)]",
  "[&_[data-level='1']]:text-[1.43em] [&_[data-level='2']]:text-[1.22em] [&_[data-level='3']]:text-[1.07em]",
  "[&_[data-slot=markdown-strong]]:font-semibold [&_[data-slot=markdown-em]]:italic",
  "[&_[data-slot=markdown-del]]:line-through [&_[data-slot=markdown-del]]:decoration-[color-mix(in_oklab,currentColor_55%,transparent)]",
  "[&_[data-slot=markdown-del]]:text-[color:var(--markdown-muted,var(--muted-foreground))]",
  "[&_[data-slot=markdown-code]]:rounded-[5px] [&_[data-slot=markdown-code]]:bg-[var(--markdown-code-face,var(--muted))] [&_[data-slot=markdown-code]]:px-[0.35em] [&_[data-slot=markdown-code]]:py-[0.12em] [&_[data-slot=markdown-code]]:font-mono [&_[data-slot=markdown-code]]:text-[0.86em] [&_[data-slot=markdown-code]]:[box-decoration-break:clone]",
  "[&_[data-slot=markdown-link]]:rounded-[3px] [&_[data-slot=markdown-link]]:text-[color:var(--markdown-link,var(--foreground))] [&_[data-slot=markdown-link]]:underline [&_[data-slot=markdown-link]]:decoration-[color-mix(in_oklab,currentColor_32%,transparent)] [&_[data-slot=markdown-link]]:decoration-1 [&_[data-slot=markdown-link]]:underline-offset-[3px] [&_[data-slot=markdown-link]]:outline-none",
  "[&_[data-slot=markdown-link]]:transition-[text-decoration-color] [&_[data-slot=markdown-link]]:duration-[calc(150ms*var(--kf-speed,1))] [&_[data-slot=markdown-link]]:ease-house motion-reduce:[&_[data-slot=markdown-link]]:transition-none",
  "[&_[data-slot=markdown-link][href]:hover]:decoration-current [&_[data-slot=markdown-link]]:focus-visible:ring-2 [&_[data-slot=markdown-link]]:focus-visible:ring-ring [&_[data-slot=markdown-link]]:focus-visible:ring-offset-2 [&_[data-slot=markdown-link]]:focus-visible:ring-offset-background",
  "[&_[data-slot=markdown-list]]:list-disc [&_[data-slot=markdown-list]]:ps-[1.35em] [&_[data-slot=markdown-list][data-ordered]]:list-decimal",
  "[&_[data-slot=markdown-list]_[data-slot=markdown-list]:not([data-ordered])]:list-[circle]",
  "[&_[data-slot=markdown-item]]:ps-[0.15em] [&_[data-slot=markdown-item]]:marker:tabular-nums",
  "[&_[data-slot=markdown-item]]:marker:text-[color:var(--markdown-muted,var(--muted-foreground))]",
  "[&_[data-slot=markdown-item]+[data-slot=markdown-item]]:mt-[0.3em] [&_[data-slot=markdown-item]>*+*]:mt-[0.3em] [&_[data-slot=markdown-item]>[data-slot=markdown-list]]:mt-[0.3em]",
  "[&_[data-slot=markdown-list][data-tasks]]:list-none [&_[data-slot=markdown-list][data-tasks]]:ps-0",
  "[&_[data-slot=markdown-item][data-task]]:ps-[1.6em] [&_[data-slot=markdown-item][data-task]]:-indent-[1.6em] [&_[data-slot=markdown-item][data-task]_*]:indent-0",
  "[&_[data-slot=markdown-checkbox]]:me-[0.6em] [&_[data-slot=markdown-checkbox]]:inline-grid [&_[data-slot=markdown-checkbox]]:size-[1em] [&_[data-slot=markdown-checkbox]]:translate-y-[0.14em] [&_[data-slot=markdown-checkbox]]:place-items-center [&_[data-slot=markdown-checkbox]]:rounded-[4px] [&_[data-slot=markdown-checkbox]]:align-baseline",
  "[&_[data-slot=markdown-checkbox]]:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--foreground)_24%,transparent)]",
  "[&_[data-slot=markdown-checkbox][data-checked]]:bg-primary [&_[data-slot=markdown-checkbox][data-checked]]:text-primary-foreground [&_[data-slot=markdown-checkbox][data-checked]]:shadow-none [&_[data-slot=markdown-checkbox]_svg]:size-[0.75em]",
  "[&_[data-slot=markdown-quote]]:flex [&_[data-slot=markdown-quote]]:flex-col [&_[data-slot=markdown-quote]]:gap-[calc(var(--markdown-gap,0.75rem)*0.6)] [&_[data-slot=markdown-quote]]:border-s-2 [&_[data-slot=markdown-quote]]:border-border [&_[data-slot=markdown-quote]]:ps-[0.9em]",
  "[&_[data-slot=markdown-quote]]:text-[color:var(--markdown-muted,var(--muted-foreground))]",
  "[&_[data-slot=markdown-rule]]:my-[calc(var(--markdown-gap,0.75rem)*0.4)] [&_[data-slot=markdown-rule]]:h-px [&_[data-slot=markdown-rule]]:border-0 [&_[data-slot=markdown-rule]]:bg-border",
  "[&_[data-slot=markdown-table]]:max-w-full [&_[data-slot=markdown-table]]:overflow-x-auto [&_[data-slot=markdown-table]]:rounded-[10px] [&_[data-slot=markdown-table]]:[scrollbar-width:thin]",
  "[&_[data-slot=markdown-table]]:shadow-[inset_0_0_0_1px_var(--border)]",
  "[&_[data-slot=markdown-table]_table]:w-full [&_[data-slot=markdown-table]_table]:border-collapse [&_[data-slot=markdown-table]_table]:text-[0.93em] [&_[data-slot=markdown-table]_table]:leading-[1.45] [&_[data-slot=markdown-table]_table]:tabular-nums",
  "[&_[data-slot=markdown-table]_th]:bg-[color-mix(in_oklab,var(--muted)_60%,transparent)] [&_[data-slot=markdown-table]_th]:px-3 [&_[data-slot=markdown-table]_th]:py-2 [&_[data-slot=markdown-table]_th]:text-start [&_[data-slot=markdown-table]_th]:font-medium [&_[data-slot=markdown-table]_th]:whitespace-nowrap",
  "[&_[data-slot=markdown-table]_th]:text-[color:var(--markdown-muted,var(--muted-foreground))]",
  "[&_[data-slot=markdown-table]_td]:border-t [&_[data-slot=markdown-table]_td]:border-border [&_[data-slot=markdown-table]_td]:px-3 [&_[data-slot=markdown-table]_td]:py-2",
  "[&_[data-slot=markdown-table]_:is(th,td):first-child]:ps-3.5 [&_[data-slot=markdown-table]_:is(th,td):last-child]:pe-3.5",
  "[&_[data-slot=markdown-caret]]:ms-[1px] [&_[data-slot=markdown-caret]]:inline-block [&_[data-slot=markdown-caret]]:h-[1.1em] [&_[data-slot=markdown-caret]]:w-[2px] [&_[data-slot=markdown-caret]]:translate-y-[0.2em] [&_[data-slot=markdown-caret]]:rounded-full [&_[data-slot=markdown-caret]]:bg-[var(--markdown-caret,var(--foreground))]",
)
