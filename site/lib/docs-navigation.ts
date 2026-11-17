import type { Item, Node, Root } from "fumadocs-core/page-tree"

import { groups } from "./catalog"
import { source } from "./source"

type ComponentGroup = { group: string; items: readonly { slug: string }[] }

/**
 * Reuse Fumadocs' page nodes so URLs, metadata and search links keep their original identity.
 * Native folders open for the active path and retain their own toggle state across client navigation.
 */
export function groupComponentPages(tree: Root, categories: readonly ComponentGroup[]): Root {
  const componentUrls = new Set(categories.flatMap(({ items }) => items.map(({ slug }) => `/docs/components/${slug}`)))

  function groupChildren(children: Node[], scope: string): Node[] {
    const pages = new Map<string, Item>()
    for (const node of children) {
      if (node.type === "page" && componentUrls.has(node.url)) pages.set(node.url, node)
    }
    let inserted = false
    return children.flatMap((node, index): Node[] => {
      if (node.type === "folder") return [{ ...node, children: groupChildren(node.children, `${scope}-${index}`) }]
      if (node.type !== "page" || !pages.has(node.url)) return [node]
      if (inserted) return []
      inserted = true
      return categories.flatMap(({ group, items }): Node[] => {
        const members = items.flatMap(({ slug }) => {
          const page = pages.get(`/docs/components/${slug}`)
          return page ? [page] : []
        })
        if (!members.length) return []
        return [{
          type: "folder",
          $id: `keyframery-${scope}-${group}`,
          name: group,
          defaultOpen: false,
          children: members,
        }]
      })
    })
  }

  return { ...tree, children: groupChildren(tree.children, tree.$id ?? "docs") }
}

/** Shared by the sidebar, its native footer and the page header's previous/next actions. */
export function getDocsNavigation(): Root {
  return groupComponentPages(source.getPageTree(), groups)
}
