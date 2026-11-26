<script setup lang="ts">
import { Tree, TreeGroup, TreeItem, TreeItemIndicator, TreeItemLabel } from "@/components/keyframery/tree"
</script>

<template>
  <Tree aria-label="Files">
    <TreeItem value="src">
      <TreeItemLabel><TreeItemIndicator />src</TreeItemLabel>
      <TreeGroup>
        <TreeItem value="src/app.tsx">
          <TreeItemLabel>app.tsx</TreeItemLabel>
        </TreeItem>
      </TreeGroup>
    </TreeItem>
  </Tree>
</template>
