<script setup lang="ts">
// Horizontal and vertical
// Between sections or between items in a row. `decorative` hides it from screen readers when it only adds space.

import { Separator } from "@/components/keyframery/separator"
</script>

<template>
  <div class="w-full max-w-[300px] text-[13px]">
    <div class="font-medium">Keyframery</div>
    <div class="text-muted-foreground">Animated components for UI SDK</div>
    <Separator class="my-3" />
    <div class="flex h-4 items-center gap-3 text-muted-foreground">
      <span>Docs</span>
      <Separator orientation="vertical" />
      <span>Components</span>
      <Separator orientation="vertical" />
      <span>Changelog</span>
    </div>
  </div>
</template>
