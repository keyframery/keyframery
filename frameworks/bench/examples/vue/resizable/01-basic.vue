<script setup lang="ts">
// Two panels
// Drag the handle, or focus it and use the arrow keys. `minSize` and `maxSize` are percentages.

import { Resizable, ResizableHandle, ResizablePanel } from "@/components/keyframery/resizable"
</script>

<template>
  <Resizable class="h-[200px] w-full max-w-[480px] rounded-[14px] border">
    <ResizablePanel :default-size="35" :min-size="20" :max-size="60">
      <div class="grid h-full place-items-center text-[13px] text-muted-foreground">Sidebar</div>
    </ResizablePanel>
    <ResizableHandle />
    <ResizablePanel :default-size="65">
      <div class="grid h-full place-items-center text-[13px] text-muted-foreground">Content</div>
    </ResizablePanel>
  </Resizable>
</template>
