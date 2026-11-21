/* Keeps the source files of the Manual install tab out of every page view.

   A component page lists the files to copy inside <Tab value="Manual">, each in a closed <Accordion>. Highlighted
   on the server, every token of those files becomes one element in the data React sends with the page, though the
   tab is closed: the Chart page carried 1.4 MB of it for 100 KB of source. This plugin runs before the highlighter
   and swaps each of those code blocks for <LazyCode>, which holds the file as plain text and highlights it in the
   browser when it is first seen (site/components/docs/lazy-code.tsx).

   It changes the rendered page only. The Markdown copy of the page is taken from the MDX before this runs, so it
   still has every file. No imports, so unit tests load it directly. */

type Attribute = { type: string; name?: string; value?: unknown }
type HastNode = {
  type: string
  tagName?: string
  name?: string | null
  value?: string
  children?: HastNode[]
  properties?: Record<string, unknown>
  attributes?: Attribute[]
  data?: Record<string, unknown>
}

const isJsx = (node: HastNode, name: string) => (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") && node.name === name

const isManualTab = (node: HastNode) =>
  isJsx(node, "Tab") && (node.attributes ?? []).some((a) => a.type === "mdxJsxAttribute" && a.name === "value" && a.value === "Manual")

const textOf = (node: HastNode): string => (node.type === "text" ? (node.value ?? "") : (node.children ?? []).map(textOf).join(""))

/** A JSX attribute whose value is a string expression, so quotes and new lines in the code need no escaping here. */
const stringAttribute = (name: string, value: string): Attribute => ({
  type: "mdxJsxAttribute",
  name,
  value: {
    type: "mdxJsxAttributeValueExpression",
    value: JSON.stringify(value),
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        body: [{ type: "ExpressionStatement", expression: { type: "Literal", value, raw: JSON.stringify(value) } }],
      },
    },
  },
})

/** The <LazyCode> that stands in for one `<pre><code class="language-…">` block, or null when the node is not one. */
export function lazyCodeFor(pre: HastNode): HastNode | null {
  if (pre.type !== "element" || pre.tagName !== "pre") return null
  const code = (pre.children ?? []).find((child) => child.type === "element" && child.tagName === "code")
  if (!code) return null
  const classes = code.properties?.className
  const language = (Array.isArray(classes) ? classes : []).map(String).find((name) => name.startsWith("language-"))
  return {
    type: "mdxJsxFlowElement",
    name: "LazyCode",
    attributes: [stringAttribute("lang", language ? language.slice("language-".length) : "text"), stringAttribute("code", textOf(code).replace(/\n$/, ""))],
    children: [],
  }
}

function walk(node: HastNode, inManualTab: boolean, inAccordion: boolean) {
  if (!node.children) return
  const manual = inManualTab || isManualTab(node)
  const accordion = inAccordion || isJsx(node, "Accordion")
  node.children = node.children.map((child) => {
    const lazy = manual && accordion ? lazyCodeFor(child) : null
    if (lazy) return lazy
    walk(child, manual, accordion)
    return child
  })
}

export function rehypeLazyCode() {
  return (tree: HastNode) => walk(tree, false, false)
}
