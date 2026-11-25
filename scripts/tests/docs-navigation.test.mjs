import assert from "node:assert/strict"
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import test from "node:test"
import { findNeighbour, findPath, flattenTree } from "fumadocs-core/page-tree"
import ts from "typescript"

const root = path.resolve(import.meta.dirname, "../..")
const require = createRequire(import.meta.url)

function loadTs(file, resolveImport) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  })
  const module = { exports: {} }
  new Function("require", "exports", outputText)(resolveImport, module.exports)
  return module.exports
}

const { groupComponentPages } = loadTs("site/lib/docs-navigation.ts", (name) => {
  if (name === "./catalog") return { groups: [] }
  if (name === "./source") return { source: {} }
  throw new Error(`Unexpected navigation import: ${name}`)
})
const page = (name, url) => ({ type: "page", name, url, $id: url })

for (const nested of [false, true]) {
  test(`${nested ? "nested" : "flat"} docs retain original pages and navigation through collapsed categories`, () => {
    const intro = page("Introduction", "/docs")
    const index = page("All components", "/docs/components")
    const button = page("Button", "/docs/components/button")
    const input = page("Input", "/docs/components/input")
    const tabs = page("Tabs", "/docs/components/tabs")
    const future = page("Future", "/docs/components/future")
    const guide = page("Guide", "/docs/guides/forms")
    const external = { ...page("SDK", "https://ui-sdk.dev"), external: true }
    const categories = [
      { group: "Actions", items: [{ slug: "button" }] },
      { group: "Forms", items: [{ slug: "input" }] },
      { group: "Navigation", items: [{ slug: "tabs" }] },
      { group: "Empty category", items: [{ slug: "missing" }] },
    ]
    const components = [index, tabs, future, button, input]
    const tree = {
      name: "Docs",
      $id: "docs",
      children: [
        intro,
        { type: "separator", name: "Components" },
        ...(nested ? [{ type: "folder", name: "Components", children: components }] : components),
        { type: "folder", name: "Guides", children: [guide] },
        external,
      ],
    }
    const before = JSON.stringify(tree)
    const grouped = groupComponentPages(tree, categories)
    assert.equal(JSON.stringify(tree), before, "must not mutate the source tree")

    const actual = flattenTree(grouped.children)
    const original = flattenTree(tree.children)
    assert.deepEqual(actual.map((item) => item.url).sort(), original.map((item) => item.url).sort())
    assert.equal(new Set(actual.map((item) => item.url)).size, actual.length, "each URL occurs exactly once")
    for (const item of original) assert.equal(actual.find((candidate) => candidate.url === item.url), item, "preserve page identity and metadata")

    const knownUrls = new Set([button.url, input.url, tabs.url])
    assert.deepEqual(actual.filter((item) => knownUrls.has(item.url)), [button, input, tabs])
    assert.deepEqual(actual.filter((item) => !knownUrls.has(item.url)), [intro, index, future, guide, external], "retain unknown component URLs and other docs in order")

    const siblings = nested ? grouped.children[2].children : grouped.children
    const folders = siblings.filter((node) => node.type === "folder" && categories.some((category) => category.group === node.name))
    assert.deepEqual(folders.map((folder) => folder.name), ["Actions", "Forms", "Navigation"], "omit empty categories and use catalog order")
    assert.equal(new Set(folders.map((folder) => folder.$id)).size, folders.length)
    for (const folder of folders) {
      assert.equal(folder.defaultOpen, false, "inactive categories start collapsed")
      assert.ok(!folder.root, "categories must not create navigation root boundaries")
    }
    const repeated = groupComponentPages(tree, categories)
    const repeatedSiblings = nested ? repeated.children[2].children : repeated.children
    assert.deepEqual(repeatedSiblings.filter((node) => node.type === "folder").map((folder) => folder.$id), siblings.filter((node) => node.type === "folder").map((folder) => folder.$id), "category IDs stay stable across renders")
    assert.equal(findPath(grouped.children, (node) => node.type === "page" && node.url === input.url).at(-2).name, "Forms", "the active path contains its native folder")
    assert.equal(findNeighbour(grouped, input.url).previous, button)
    assert.equal(findNeighbour(grouped, input.url).next, tabs)
  })
}

test("the live catalog retains every component once in its category with continuous previous/next navigation", () => {
  // Avoid the server-only marker in this Node test; the catalog's actual filesystem data stays intact.
  const catalog = loadTs("site/lib/catalog.ts", (name) =>
    name === "server-only" ? {} : require(name.startsWith("./") ? path.join(root, "site/lib", name) : name))
  assert.ok(catalog.entries.length > 0)
  const index = page("All components", "/docs/components")
  const pages = catalog.entries.map((entry) => page(entry.name, `/docs/components/${entry.slug}`))
  const tree = groupComponentPages({ name: "Docs", children: [index, ...pages.slice().reverse()] }, catalog.groups)
  const folders = tree.children.filter((node) => node.type === "folder")
  const actual = flattenTree(tree.children).filter((node) => node.url !== index.url)
  assert.equal(actual.length, catalog.entries.length)
  assert.equal(new Set(actual.map((node) => node.url)).size, catalog.entries.length)
  assert.equal(folders.length, catalog.groups.length)
  assert.deepEqual(folders.map((folder) => folder.name), catalog.groups.map((group) => group.group))

  for (const entry of catalog.entries) {
    const activePath = findPath(tree.children, (node) => node.type === "page" && node.url === `/docs/components/${entry.slug}`)
    assert.equal(activePath.at(-2).name, entry.group)
    assert.equal(activePath.at(-1), pages.find((node) => node.url === `/docs/components/${entry.slug}`))
  }
  for (const [position, item] of actual.entries()) {
    const neighbours = findNeighbour(tree, item.url)
    assert.equal(neighbours.previous, position === 0 ? index : actual[position - 1])
    assert.equal(neighbours.next, actual[position + 1])
  }
})
