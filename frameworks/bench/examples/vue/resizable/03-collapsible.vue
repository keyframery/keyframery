<script setup lang="ts">
// Collapsible, and remembered
// A `collapsible` panel snaps shut when dragged below its `minSize`. `autoSaveId` keeps the layout between visits.

import { Resizable, ResizableHandle, ResizablePanel } from "@/components/keyframery/resizable"
</script>

<template>
  <Resizable auto-save-id="docs-example-layout" class="h-[200px] w-full max-w-[480px] rounded-[14px] border">
    <ResizablePanel :default-size="30" :min-size="20" collapsible>
      <div class="grid h-full place-items-center text-[13px] text-muted-foreground">Drag me shut</div>
    </ResizablePanel>
    <ResizableHandle />
    <ResizablePanel :default-size="70">
      <div class="grid h-full place-items-center text-[13px] text-muted-foreground">Content</div>
    </ResizablePanel>
  </Resizable>
</template>
