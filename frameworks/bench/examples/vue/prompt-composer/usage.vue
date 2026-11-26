<script setup lang="ts">
import { PromptComposer } from "@/components/keyframery/prompt-composer"
</script>

<template>
  <PromptComposer placeholder="Ask anything…" @submit="console.log(text, attachments)" />
</template>
