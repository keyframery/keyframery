<script setup lang="ts">
// Controlled
// Pass `open` and `onOpenChange` to own the state. Streaming starting and ending still asks for a change through `onOpenChange`, so the automatic open and close keep working.

import { ref } from "vue"

import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/keyframery/reasoning"

const open = ref(false)
</script>

<template>
  <div class="flex max-w-[380px] flex-col gap-3">
    <Reasoning v-model:open="open" :duration="9">
      <ReasoningTrigger />
      <ReasoningContent>Friday is the only day with seats on both legs, and it is €40 cheaper than Thursday.</ReasoningContent>
    </Reasoning>
    <p class="text-[12px] text-muted-foreground">The thinking is {{ open ? 'showing' : 'hidden' }}.</p>
  </div>
</template>
