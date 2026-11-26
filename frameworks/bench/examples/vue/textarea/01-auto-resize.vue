<script setup lang="ts">
// Grows as you type
// `autoResize` makes it as tall as its text. Cap it with a `max-h` class.

import { Textarea } from "@/components/keyframery/textarea"
</script>

<template>
  <Textarea
    auto-resize
    aria-label="Note"
    placeholder="Type a few lines…"
    class="w-full max-w-[320px] max-h-[200px]"
  />
</template>
