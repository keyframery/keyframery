<script setup lang="ts">
// Stacked, and nested
// `orientation="vertical"` stacks panels. A Resizable inside a panel splits it again.

import { Resizable, ResizableHandle, ResizablePanel } from "@/components/keyframery/resizable"
</script>

<template>
  <Resizable class="h-[260px] w-full max-w-[480px] rounded-[14px] border">
    <ResizablePanel :default-size="40">
      <div class="grid h-full place-items-center text-[13px] text-muted-foreground">Files</div>
    </ResizablePanel>
    <ResizableHandle />
    <ResizablePanel :default-size="60">
      <Resizable orientation="vertical">
        <ResizablePanel :default-size="65">
          <div class="grid h-full place-items-center text-[13px] text-muted-foreground">Editor</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel :default-size="35" :min-size="15">
          <div class="grid h-full place-items-center text-[13px] text-muted-foreground">Terminal</div>
        </ResizablePanel>
      </Resizable>
    </ResizablePanel>
  </Resizable>
</template>
