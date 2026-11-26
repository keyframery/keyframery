<script setup lang="ts">
import { Tree, TreeGroup, TreeItem, TreeItemIndicator, TreeItemLabel } from "@ui-sdk/vue/tree"
</script>
<template>
  <Tree aria-label="x" :default-expanded="['a']">
    <TreeItem value="a"><TreeItemLabel><TreeItemIndicator />A</TreeItemLabel>
      <TreeGroup><TreeItem value="b"><TreeItemLabel>B</TreeItemLabel></TreeItem></TreeGroup>
    </TreeItem>
    <TreeItem value="c" :branch="true"><TreeItemIndicator /><TreeItemLabel>C</TreeItemLabel>
      <TreeGroup><TreeItem value="d"><TreeItemLabel>D</TreeItemLabel></TreeItem></TreeGroup>
    </TreeItem>
  </Tree>
</template>
