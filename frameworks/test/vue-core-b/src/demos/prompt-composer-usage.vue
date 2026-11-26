<script setup lang="ts">
import { PromptComposer } from "@/components/keyframery/prompt-composer"
</script>

<template>
  <div data-demo="prompt-composer-usage" class="w-[480px]">
    <PromptComposer placeholder="Ask anything…" @submit="({ text, attachments }) => console.log(text, attachments)" />
  </div>
</template>
