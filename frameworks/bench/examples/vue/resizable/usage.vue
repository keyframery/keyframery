<script setup lang="ts">
import { Resizable, ResizableHandle, ResizablePanel } from "@/components/keyframery/resizable"
</script>

<template>
  <Resizable>
    <ResizablePanel :default-size="30">Sidebar</ResizablePanel>
    <ResizableHandle />
    <ResizablePanel :default-size="70">Content</ResizablePanel>
  </Resizable>
</template>
