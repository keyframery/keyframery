<script lang="ts">
/* One markdown block, drawn from its own source (internal). Markdown keeps the previous object for
   every finished block, so its props never change and Vue never renders it again; only the last,
   live block grows. `caret` puts the streaming caret at the block's end. */
import { type Component, defineComponent, h, isVNode, type PropType, type VNode, type VNodeChild } from "vue"

import type { MarkdownBlock, MarkdownInline } from "@/components/keyframery/core/markdown-core"
import MarkdownCaret from "./MarkdownCaret.vue"
import MarkdownCodeBlock from "./MarkdownCodeBlock.vue"
import type { MarkdownComponents, MarkdownElement } from "./parts"

type Ctx = { components: MarkdownComponents }
type Children = VNodeChild[] | string | undefined

/* An element by tag name, or the user's own: a tag, a component, or a function of the element's props
   that returns a vnode (its type and props are kept, and the element's content goes inside). */
function el(ctx: Ctx, tag: MarkdownElement) {
  const own = ctx.components[tag]
  return (props: Record<string, unknown> | null, children?: Children): VNode => {
    if (typeof own === "function" && !isComponentObject(own)) {
      const vnode = (own as (props: Record<string, unknown>) => VNode)({ ...props })
      if (isVNode(vnode)) return h(vnode.type as string, { ...vnode.props, key: props?.key as number | undefined }, children as VNodeChild[])
    }
    return h((own as string | Component | undefined) ?? tag, props, children as VNodeChild[])
  }
}
/* A component made with defineComponent (an object) or a class, as opposed to a plain render function. */
const isComponentObject = (value: unknown) => typeof value === "object" || (typeof value === "function" && "props" in (value as object) && !!(value as { props?: unknown }).props)

function inlines(nodes: MarkdownInline[], ctx: Ctx): VNodeChild[] {
  return nodes.map((node, i) => {
    switch (node.type) {
      case "text":
        return node.text
      case "break":
        return el(ctx, "br")({ key: i })
      case "code":
        return el(ctx, "code")({ key: i, "data-slot": "markdown-code" }, node.text)
      case "strong":
      case "em":
      case "del":
        return el(ctx, node.type)({ key: i, "data-slot": `markdown-${node.type}` }, inlines(node.children, ctx))
      case "link": {
        const external = node.href ? /^(?:https?:)?\/\//i.test(node.href) : false
        return el(ctx, "a")(
          {
            key: i,
            "data-slot": "markdown-link",
            "data-pending": node.href ? undefined : "",
            href: node.href,
            title: node.title,
            rel: "noreferrer",
            target: external ? "_blank" : undefined,
          },
          inlines(node.children, ctx),
        )
      }
    }
  })
}

/* Read only: a task's tick. Screen readers hear "done" or "to do" before the item. */
/* Array.prototype.findLastIndex is ES2023; a fresh Vite app's lib is ES2020. */
function lastIndexWhere<T>(list: T[], test: (item: T) => boolean) {
  for (let i = list.length - 1; i >= 0; i--) if (test(list[i] as T)) return i
  return -1
}

function taskMark(checked: boolean) {
  return h("span", { "data-slot": "markdown-checkbox", "data-checked": checked ? "" : undefined, role: "img", "aria-label": checked ? "Done" : "To do" }, [
    checked
      ? h("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, [
          h("path", { d: "M4 8.5 6.75 11 12 5.25" }),
        ])
      : null,
  ])
}

const MarkdownBlockView: Component = defineComponent({
  name: "MarkdownBlock",
  props: {
    block: { type: Object as PropType<MarkdownBlock>, required: true },
    ctx: { type: Object as PropType<Ctx>, required: true },
    caret: { type: Boolean, default: false },
  },
  setup(props) {
    const blocks = (list: MarkdownBlock[], ctx: Ctx, caret: boolean) =>
      list.map((block, i) => h(MarkdownBlockView, { key: i, block, ctx, caret: caret && i === list.length - 1 }))
    return () => {
      const { block, ctx } = props
      const caret = props.caret ? h(MarkdownCaret) : null
      switch (block.type) {
        case "paragraph":
          return el(ctx, "p")({ "data-slot": "markdown-paragraph" }, [...inlines(block.children, ctx), caret])
        case "heading":
          return el(ctx, `h${block.level}`)({ "data-slot": "markdown-heading", "data-level": block.level }, [...inlines(block.children, ctx), caret])
        case "rule":
          return el(ctx, "hr")({ "data-slot": "markdown-rule" })
        case "quote":
          return el(ctx, "blockquote")({ "data-slot": "markdown-quote" }, blocks(block.children, ctx, props.caret))
        case "code":
          return h("div", { "data-slot": "markdown-code-block", "data-writing": block.complete ? undefined : "" }, [
            h(ctx.components.codeBlock ?? MarkdownCodeBlock, { code: block.code, language: block.language, info: block.info, complete: block.complete }),
          ])
        case "list": {
          const tasks = block.items.some((item) => item.checked !== undefined)
          return el(ctx, block.ordered ? "ol" : "ul")(
            {
              "data-slot": "markdown-list",
              "data-ordered": block.ordered ? "" : undefined,
              "data-tasks": tasks ? "" : undefined,
              start: block.ordered && block.start !== 1 ? block.start : undefined,
            },
            block.items.map((item, n) => {
              const end = props.caret && n === block.items.length - 1
              const only = item.children.length === 1 && item.children[0]?.type === "paragraph" ? item.children[0] : undefined
              return el(ctx, "li")(
                { key: n, "data-slot": "markdown-item", "data-task": item.checked === undefined ? undefined : "", "data-checked": item.checked ? "" : undefined },
                [
                  item.checked !== undefined ? taskMark(item.checked) : null,
                  ...(only && only.type === "paragraph" ? [...inlines(only.children, ctx), end ? h(MarkdownCaret) : null] : blocks(item.children, ctx, end)),
                ],
              )
            }),
          )
        }
        case "table": {
          const align = (n: number) => (block.align[n] ? { textAlign: block.align[n] } : undefined)
          /* The caret sits in the last cell that has text so far. */
          const lastRow = block.rows[block.rows.length - 1]
          const caretCell = lastRow ? Math.max(0, lastIndexWhere(lastRow, (cell) => cell.length > 0)) : -1
          return h("div", { "data-slot": "markdown-table" }, [
            el(ctx, "table")(null, [
              el(ctx, "thead")(null, [
                el(ctx, "tr")(
                  null,
                  block.head.map((cell, n) => el(ctx, "th")({ key: n, scope: "col", style: align(n), "data-align": block.align[n] }, inlines(cell, ctx))),
                ),
              ]),
              block.rows.length > 0
                ? el(ctx, "tbody")(
                    null,
                    block.rows.map((row, r) =>
                      el(ctx, "tr")(
                        { key: r },
                        row.map((cell, n) =>
                          el(ctx, "td")({ key: n, style: align(n), "data-align": block.align[n] }, [
                            ...inlines(cell, ctx),
                            r === block.rows.length - 1 && n === caretCell ? caret : null,
                          ]),
                        ),
                      ),
                    ),
                  )
                : null,
            ]),
          ])
        }
      }
    }
  },
})

export default MarkdownBlockView
</script>
