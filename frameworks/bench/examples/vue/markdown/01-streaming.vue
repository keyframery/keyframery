<script setup lang="ts">
// Streaming
// Pass the text as it arrives and set `streaming` until it ends. Finished blocks stay exactly where they are, an unclosed `**` or fence reads as it will once closed, and a caret marks the end.

import { onBeforeUnmount, ref } from "vue"

import { Markdown } from "@/components/keyframery/markdown"

const reply = `Here is the plan for **Sunday morning**:

1. Pastéis de Belém opens at 08:00, so go first.
2. Walk ten minutes to the Jerónimos Monastery.

> Tickets sell out by 10:00 in summer.`

const words = reply.match(/\s*\S+/g) ?? []

const at = ref(0)
/* A word every 70ms, then a pause, then again. */
const timer = setInterval(() => (at.value = at.value >= words.length + 25 ? 0 : at.value + 1), 70)
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <Markdown class="w-full max-w-[380px]" :streaming="at < words.length">{{ words.slice(0, at).join("") }}</Markdown>
</template>
