<script setup lang="ts">
// Line numbers and highlighted lines
// `lineNumbers` numbers each line; `highlight` takes line numbers, and their bands sweep in from the left.

import { CodeBlock, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "@/components/keyframery/code-block"

const code = `{
  "name": "corner-shop",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}`
</script>

<template>
  <CodeBlock :code="code" language="json" line-numbers :highlight="[5, 6]" class="max-w-[420px]">
    <CodeBlockHeader>
      <CodeBlockTitle>package.json</CodeBlockTitle>
      <CodeBlockCopyButton class="ms-auto" />
    </CodeBlockHeader>
    <CodeBlockContent />
  </CodeBlock>
</template>
