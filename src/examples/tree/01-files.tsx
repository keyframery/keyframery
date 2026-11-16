// File tree
// Folders open to their real height. Arrow keys move, right opens, left closes, and typing jumps to a name.
import { File, Folder } from "lucide-react"

import { Tree, TreeGroup, TreeItem, TreeItemIndicator, TreeItemLabel } from "@/components/ui/tree"

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

function Nodes({ nodes }: { nodes: Node[] }) {
  return nodes.map((node) => (
    <TreeItem key={node.value} value={node.value}>
      <TreeItemLabel>
        {node.children && <TreeItemIndicator />}
        {node.children ? <Folder /> : <File />}
        {node.label}
      </TreeItemLabel>
      {node.children && (
        <TreeGroup>
          <Nodes nodes={node.children} />
        </TreeGroup>
      )}
    </TreeItem>
  ))
}

export default function TreeFiles() {
  return (
    <Tree aria-label="Files" defaultExpanded={["app"]} defaultValue="app/page.tsx" className="w-full max-w-[260px]">
      <Nodes nodes={files} />
    </Tree>
  )
}
