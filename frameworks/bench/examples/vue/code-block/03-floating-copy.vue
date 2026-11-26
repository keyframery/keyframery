<script setup lang="ts">
// Floating copy button
// Put `CodeBlockActions` straight inside `CodeBlock` and the copy key floats over the corner, showing on hover or focus.

import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton } from "@/components/keyframery/code-block"
</script>

<template>
  <CodeBlock code="git switch -c fix/receipt-totals" language="bash" size="sm" class="max-w-[420px]">
    <CodeBlockActions>
      <CodeBlockCopyButton />
    </CodeBlockActions>
    <CodeBlockContent class="pe-12" />
  </CodeBlock>
</template>
