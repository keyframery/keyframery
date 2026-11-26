<script setup lang="ts">
// With checkboxes
// `checkable` adds a checkbox to each item. Checking a folder checks everything in it.

import { Tree, TreeGroup, TreeItem, TreeItemCheckbox, TreeItemIndicator, TreeItemLabel } from "@/components/keyframery/tree"

const permissions = [
  { value: "projects", label: "Projects", children: ["View", "Edit", "Delete"] },
  { value: "billing", label: "Billing", children: ["View invoices", "Change plan"] },
]
</script>

<template>
  <Tree
    aria-label="Permissions"
    checkable
    :default-checked="['projects/View']"
    :default-expanded="['projects']"
    class="w-full max-w-[260px]"
  >
    <TreeItem v-for="group in permissions" :key="group.value" :value="group.value">
      <TreeItemLabel><TreeItemIndicator /><TreeItemCheckbox />{{ group.label }}</TreeItemLabel>
      <TreeGroup>
        <TreeItem v-for="child in group.children" :key="child" :value="`${group.value}/${child}`">
          <TreeItemLabel><TreeItemCheckbox />{{ child }}</TreeItemLabel>
        </TreeItem>
      </TreeGroup>
    </TreeItem>
  </Tree>
</template>
