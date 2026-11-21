import assert from "node:assert/strict"
import test from "node:test"

import { lazyCodeFor, rehypeLazyCode } from "../../site/lib/rehype-lazy-code.ts"

const text = (value) => ({ type: "text", value })
const pre = (language, code) => ({
  type: "element",
  tagName: "pre",
  properties: {},
  children: [{ type: "element", tagName: "code", properties: { className: [`language-${language}`] }, children: [text(code)] }],
})
const jsx = (name, attributes, children) => ({
  type: "mdxJsxFlowElement",
  name,
  attributes: Object.entries(attributes).map(([key, value]) => ({ type: "mdxJsxAttribute", name: key, value })),
  children,
})
const attribute = (node, name) => node.attributes.find((a) => a.name === name).value.data.estree.body[0].expression.value

test("a source file in a Manual tab accordion becomes LazyCode with its plain text", () => {
  const source = 'export const a = "x"\nconst b = `y`\n'
  const tree = { type: "root", children: [jsx("Tab", { value: "Manual" }, [jsx("Accordions", {}, [jsx("Accordion", { title: "lib/a.ts" }, [pre("ts", source)])])])] }
  rehypeLazyCode()(tree)
  const lazy = tree.children[0].children[0].children[0].children[0]
  assert.equal(lazy.type, "mdxJsxFlowElement")
  assert.equal(lazy.name, "LazyCode")
  assert.equal(attribute(lazy, "lang"), "ts")
  // The last new line of a fence is not part of the file.
  assert.equal(attribute(lazy, "code"), 'export const a = "x"\nconst b = `y`')
})

test("code outside a Manual tab accordion is left for the server highlighter", () => {
  const usage = pre("tsx", "<Chart />")
  const inOtherTab = pre("tsx", "<Chart />")
  const inManualSteps = pre("bash", "npm install x")
  const inLooseAccordion = pre("tsx", "<Chart />")
  const tree = {
    type: "root",
    children: [
      usage,
      jsx("Tab", { value: "CLI" }, [jsx("Accordion", { title: "a" }, [inOtherTab])]),
      jsx("Tab", { value: "Manual" }, [jsx("Step", {}, [inManualSteps])]),
      jsx("Accordion", { title: "b" }, [inLooseAccordion]),
    ],
  }
  rehypeLazyCode()(tree)
  assert.equal(tree.children[0], usage)
  assert.equal(tree.children[1].children[0].children[0], inOtherTab)
  assert.equal(tree.children[2].children[0].children[0], inManualSteps)
  assert.equal(tree.children[3].children[0], inLooseAccordion)
})

test("only a pre that holds code is replaced; a block with no language is plain text", () => {
  assert.equal(lazyCodeFor({ type: "element", tagName: "p", children: [text("hello")] }), null)
  assert.equal(lazyCodeFor({ type: "element", tagName: "pre", children: [text("hello")] }), null)
  const bare = lazyCodeFor({ type: "element", tagName: "pre", children: [{ type: "element", tagName: "code", properties: {}, children: [text("hello\n")] }] })
  assert.equal(attribute(bare, "lang"), "text")
  assert.equal(attribute(bare, "code"), "hello")
})
