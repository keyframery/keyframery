<script setup lang="ts">
import { CodeBlock, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "@/components/keyframery/code-block"
</script>

<template>
  <CodeBlock code="npm install @ui-sdk/react @ui-sdk/core" language="bash">
    <CodeBlockHeader>
      <CodeBlockTitle>Terminal</CodeBlockTitle>
      <CodeBlockCopyButton class="ms-auto" />
    </CodeBlockHeader>
    <CodeBlockContent />
  </CodeBlock>
</template>
