<script setup lang="ts">
// File tree
// Folders open to their real height. Arrow keys move, right opens, left closes, and typing jumps to a name.

import { h, type FunctionalComponent } from "vue"
import { File, Folder } from "@lucide/vue"

import { Tree, TreeGroup, TreeItem, TreeItemIndicator, TreeItemLabel } from "@/components/keyframery/tree"

type Node = { value: string; label: string; children?: Node[] }

const files: Node[] = [
  {
    value: "app",
    label: "app",
    children: [
      { value: "app/layout.tsx", label: "layout.tsx" },
      { value: "app/page.tsx", label: "page.tsx" },
      { value: "app/settings", label: "settings", children: [{ value: "app/settings/page.tsx", label: "page.tsx" }] },
    ],
  },
  { value: "components", label: "components", children: [{ value: "components/button.tsx", label: "button.tsx" }] },
  { value: "package.json", label: "package.json" },
]

/* One row per node, folders holding their own rows: a component that renders itself. */
const Nodes: FunctionalComponent<{ nodes: Node[] }> = ({ nodes }) =>
  nodes.map((node) =>
    h(TreeItem, { key: node.value, value: node.value }, () => [
      h(TreeItemLabel, null, () => [node.children && h(TreeItemIndicator), h(node.children ? Folder : File), node.label]),
      node.children && h(TreeGroup, null, () => h(Nodes, { nodes: node.children! })),
    ]),
  )
</script>

<template>
  <Tree aria-label="Files" :default-expanded="['app']" default-value="app/page.tsx" class="w-full max-w-[260px]">
    <Nodes :nodes="files" />
  </Tree>
</template>
