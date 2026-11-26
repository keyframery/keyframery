<script setup lang="ts">
/* Fenced code: the styled code block, its language in the header and a copy key that waits for the
   closing fence. Its lines arrive as they stream in. */
import { CodeBlock, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "@/components/keyframery/code-block"
import type { CodeBlockLanguage } from "@/components/keyframery/core/code-block-core"

defineProps<{ code: string; language: CodeBlockLanguage; info: string; complete: boolean }>()
</script>

<template>
  <CodeBlock :code="code" :language="language" :data-writing="complete ? undefined : ''" class="text-[13px]">
    <CodeBlockHeader>
      <CodeBlockTitle class="font-mono font-normal">{{ info || "code" }}</CodeBlockTitle>
      <CodeBlockCopyButton class="ms-auto transition-[opacity,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house in-data-writing:pointer-events-none in-data-writing:opacity-0 motion-reduce:transition-none" />
    </CodeBlockHeader>
    <CodeBlockContent />
  </CodeBlock>
</template>
