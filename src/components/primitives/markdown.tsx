"use client"

/* Animated streaming markdown, on UI SDK's core. UI SDK ships none, so the parser and the primitive
   are defined in `@/components/core/markdown` and rendered here; fenced code is Keyframery's code
   block (through its animated primitive). This file adds motion only. Colours, type and spacing stay
   yours (style the `data-slot` of each element).

   - Steady: every block is drawn from its own source and kept as it is while later text arrives, so
     finished blocks never re-render or move; only the last block grows.
   - Rise: a new block fades up out of a soft blur as it arrives.
   - Caret: while `streaming`, a caret sits at the end of the text and pulses softly.
   The rise scales with --kf-flourish (at 0 a block is simply there); the caret says "still writing"
   and always shows. */

import { createParts } from "@ui-sdk/react/primitive"
import * as React from "react"

import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/primitives/code-block"
import type { CodeBlockLanguage } from "@/components/core/code-block"
import { markdown, parseMarkdown, type MarkdownBlock, type MarkdownInline } from "@/components/core/markdown"
import { cn } from "@/lib/utils"

const parts = createParts(markdown, { root: "div", caret: "span" })

type ClassName<S> = string | ((state: S) => string | undefined) | undefined
function withClass<S>(base: string, className: ClassName<S>) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/** What a fenced code block renderer receives. */
type MarkdownCodeBlockProps = {
  /** The code, without its fences. */
  code: string
  /** The tokenizer's language for the fence's info string ("text" when unknown). */
  language: CodeBlockLanguage
  /** The fence's info string as written, like "tsx" or "python". */
  info: string
  /** False while the closing fence has not arrived yet. */
  complete: boolean
}

type MarkdownElement =
  | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "a" | "strong" | "em" | "del" | "code" | "br"
  | "ul" | "ol" | "li" | "blockquote" | "hr" | "table" | "thead" | "tbody" | "tr" | "th" | "td"

/** Your own element for any of them, and `codeBlock` for fenced code. Each gets the element's props, including its `data-slot`. */
type MarkdownComponents = Partial<Record<MarkdownElement, React.ElementType>> & {
  codeBlock?: React.ComponentType<MarkdownCodeBlockProps>
}

const keyframes = [
  "@keyframes kf-markdown-rise{from{opacity:0;translate:0 calc(6px*var(--kf-flourish,1));filter:blur(calc(3px*var(--kf-flourish,1)))}}",
  "@keyframes kf-markdown-caret{50%{opacity:0.2}}",
].join("")

/* The default code block: the animated code block's parts, with the fence's language and a copy
   button. Its lines arrive as they stream in. */
function DefaultCodeBlock({ code, language, info, complete }: MarkdownCodeBlockProps) {
  return (
    <CodeBlock code={code} language={language} data-writing={complete ? undefined : ""}>
      <CodeBlockHeader>
        <CodeBlockTitle>{info || "code"}</CodeBlockTitle>
        <CodeBlockCopyButton />
      </CodeBlockHeader>
      <CodeBlockContent />
    </CodeBlock>
  )
}

type Ctx = { components: MarkdownComponents }

const el = (ctx: Ctx, tag: MarkdownElement) => ctx.components[tag] ?? tag

function Inlines({ nodes, ctx }: { nodes: MarkdownInline[]; ctx: Ctx }) {
  return nodes.map((node, i) => {
    switch (node.type) {
      case "text":
        return <React.Fragment key={i}>{node.text}</React.Fragment>
      case "break": {
        const Br = el(ctx, "br")
        return <Br key={i} />
      }
      case "code": {
        const Code = el(ctx, "code")
        return (
          <Code key={i} data-slot="markdown-code">
            {node.text}
          </Code>
        )
      }
      case "strong":
      case "em":
      case "del": {
        const Tag = el(ctx, node.type)
        return (
          <Tag key={i} data-slot={`markdown-${node.type}`}>
            <Inlines nodes={node.children} ctx={ctx} />
          </Tag>
        )
      }
      case "link": {
        const A = el(ctx, "a")
        const external = node.href ? /^(?:https?:)?\/\//i.test(node.href) : false
        return (
          <A
            key={i}
            data-slot="markdown-link"
            data-pending={node.href ? undefined : ""}
            href={node.href}
            title={node.title}
            rel="noreferrer"
            target={external ? "_blank" : undefined}
          >
            <Inlines nodes={node.children} ctx={ctx} />
          </A>
        )
      }
    }
  })
}

/* A block that takes the caret at its end. */
function BlockView({ block, ctx, caret }: { block: MarkdownBlock; ctx: Ctx; caret?: React.ReactNode }) {
  switch (block.type) {
    case "paragraph": {
      const P = el(ctx, "p")
      return (
        <P data-slot="markdown-paragraph">
          <Inlines nodes={block.children} ctx={ctx} />
          {caret}
        </P>
      )
    }
    case "heading": {
      const H = el(ctx, `h${block.level}`)
      return (
        <H data-slot="markdown-heading" data-level={block.level}>
          <Inlines nodes={block.children} ctx={ctx} />
          {caret}
        </H>
      )
    }
    case "rule": {
      const Hr = el(ctx, "hr")
      return <Hr data-slot="markdown-rule" />
    }
    case "quote": {
      const Quote = el(ctx, "blockquote")
      return (
        <Quote data-slot="markdown-quote">
          <Blocks blocks={block.children} ctx={ctx} caret={caret} />
        </Quote>
      )
    }
    case "code": {
      const Code = ctx.components.codeBlock ?? DefaultCodeBlock
      return (
        <div data-slot="markdown-code-block" data-writing={block.complete ? undefined : ""}>
          <Code code={block.code} language={block.language} info={block.info} complete={block.complete} />
        </div>
      )
    }
    case "list": {
      const List = el(ctx, block.ordered ? "ol" : "ul")
      const Li = el(ctx, "li")
      const tasks = block.items.some((item) => item.checked !== undefined)
      return (
        <List
          data-slot="markdown-list"
          data-ordered={block.ordered ? "" : undefined}
          data-tasks={tasks ? "" : undefined}
          start={block.ordered && block.start !== 1 ? block.start : undefined}
        >
          {block.items.map((item, n) => {
            const end = n === block.items.length - 1 ? caret : undefined
            const only = item.children.length === 1 && item.children[0].type === "paragraph" ? item.children[0] : undefined
            return (
              <Li
                key={n}
                data-slot="markdown-item"
                data-task={item.checked === undefined ? undefined : ""}
                data-checked={item.checked ? "" : undefined}
              >
                {item.checked !== undefined && <TaskMark checked={item.checked} />}
                {only && only.type === "paragraph" ? (
                  <>
                    <Inlines nodes={only.children} ctx={ctx} />
                    {end}
                  </>
                ) : (
                  <Blocks blocks={item.children} ctx={ctx} caret={end} />
                )}
              </Li>
            )
          })}
        </List>
      )
    }
    case "table": {
      const Table = el(ctx, "table")
      const Thead = el(ctx, "thead")
      const Tbody = el(ctx, "tbody")
      const Tr = el(ctx, "tr")
      const Th = el(ctx, "th")
      const Td = el(ctx, "td")
      const align = (n: number) => (block.align[n] ? { textAlign: block.align[n] } : undefined)
      /* The caret sits in the last cell that has text so far. */
      const lastRow = block.rows[block.rows.length - 1]
      const caretCell = lastRow ? Math.max(0, lastRow.findLastIndex((cell) => cell.length > 0)) : -1
      return (
        <div data-slot="markdown-table">
          <Table>
            <Thead>
              <Tr>
                {block.head.map((cell, n) => (
                  <Th key={n} scope="col" style={align(n)} data-align={block.align[n]}>
                    <Inlines nodes={cell} ctx={ctx} />
                  </Th>
                ))}
              </Tr>
            </Thead>
            {block.rows.length > 0 && (
              <Tbody>
                {block.rows.map((row, r) => (
                  <Tr key={r}>
                    {row.map((cell, n) => (
                      <Td key={n} style={align(n)} data-align={block.align[n]}>
                        <Inlines nodes={cell} ctx={ctx} />
                        {r === block.rows.length - 1 && n === caretCell ? caret : undefined}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            )}
          </Table>
        </div>
      )
    }
  }
}

/* Read only: a task's tick. Screen readers hear "done" or "to do" before the item. */
function TaskMark({ checked }: { checked: boolean }) {
  return (
    <span data-slot="markdown-checkbox" data-checked={checked ? "" : undefined} role="img" aria-label={checked ? "Done" : "To do"}>
      {checked && (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 8.5 6.75 11 12 5.25" />
        </svg>
      )}
    </span>
  )
}

/* Equal source, equal block: a finished block is never drawn again while the text after it grows. */
const Block = React.memo(
  BlockView,
  (a, b) => a.block.source === b.block.source && a.block.live === b.block.live && a.block.type === b.block.type && a.ctx === b.ctx && a.caret === b.caret,
)

function Blocks({ blocks, ctx, caret }: { blocks: MarkdownBlock[]; ctx: Ctx; caret?: React.ReactNode }) {
  return blocks.map((block, i) => <Block key={i} block={block} ctx={ctx} caret={i === blocks.length - 1 ? caret : undefined} />)
}

type MarkdownProps = Omit<React.ComponentProps<typeof parts.Root>, "children" | "content"> & {
  /** The markdown. `content` works too; `children` wins when both are given. */
  children?: string | null
  content?: string | null
  /** True while the text is still arriving: its end reads as unfinished, and the caret shows. */
  streaming?: boolean
  /** Show the caret while streaming. Default true. */
  caret?: boolean
  /** Your own elements, by tag name, and `codeBlock` for fenced code. Keep the object stable (outside render or memoized). */
  components?: MarkdownComponents
}

const none: MarkdownComponents = {}

/* Each direct child (a block) rises in as it arrives. */
function Markdown({ children, content, streaming = false, caret = true, components = none, className, ...props }: MarkdownProps) {
  const source = children ?? content ?? ""
  const blocks = React.useMemo(() => parseMarkdown(source, { streaming }), [source, streaming])
  const ctx = React.useMemo(() => ({ components }), [components])
  const mark = streaming && caret ? <MarkdownCaret /> : undefined
  return (
    <>
      <style href="kf-markdown" precedence="default">
        {keyframes}
      </style>
      <parts.Root
        streaming={streaming}
        className={withClass(
          cn(
            "*:animate-[kf-markdown-rise_calc(380ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_backwards]",
            /* Code lines arrive as they stream; none waits for a cascade. */
            "[&_[data-slot=code-block-line]]:[animation-delay:0ms]",
            "motion-reduce:*:animate-none!",
          ),
          className,
        )}
        {...props}
      >
        <Blocks blocks={blocks} ctx={ctx} caret={mark} />
        {mark && !blocks.length && <p data-slot="markdown-paragraph">{mark}</p>}
      </parts.Root>
    </>
  )
}

/* The caret pulses softly while the text arrives. It is the "still writing" signal, so it keeps
   pulsing at any flourish; reduced motion holds it still. */
function MarkdownCaret({ className, ...props }: React.ComponentProps<typeof parts.Caret>) {
  return (
    <parts.Caret
      className={withClass(
        "animate-[kf-markdown-caret_calc(1000ms*var(--kf-speed,1))_var(--ease-house)_infinite] motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  )
}

export { Markdown, MarkdownCaret }
export type { MarkdownCodeBlockProps, MarkdownComponents, MarkdownElement, MarkdownProps }
export { parseMarkdown, type MarkdownBlock, type MarkdownInline } from "@/components/core/markdown"
