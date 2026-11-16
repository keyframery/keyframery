// With checkboxes
// `checkable` adds a checkbox to each item. Checking a folder checks everything in it.
import { Tree, TreeGroup, TreeItem, TreeItemCheckbox, TreeItemIndicator, TreeItemLabel } from "@/components/ui/tree"

const permissions = [
  { value: "projects", label: "Projects", children: ["View", "Edit", "Delete"] },
  { value: "billing", label: "Billing", children: ["View invoices", "Change plan"] },
]

export default function TreeCheckable() {
  return (
    <Tree aria-label="Permissions" checkable defaultChecked={["projects/View"]} defaultExpanded={["projects"]} className="w-full max-w-[260px]">
      {permissions.map((group) => (
        <TreeItem key={group.value} value={group.value}>
          <TreeItemLabel>
            <TreeItemIndicator />
            <TreeItemCheckbox />
            {group.label}
          </TreeItemLabel>
          <TreeGroup>
            {group.children.map((child) => (
              <TreeItem key={child} value={`${group.value}/${child}`}>
                <TreeItemLabel>
                  <TreeItemCheckbox />
                  {child}
                </TreeItemLabel>
              </TreeItem>
            ))}
          </TreeGroup>
        </TreeItem>
      ))}
    </Tree>
  )
}
