<script setup lang="ts">
import { DiffViewer } from "@/components/keyframery/diff-viewer"
</script>

<template>
  <DiffViewer
    filename="src/config.ts"
    before="export const config = {
  retries: 2,
  timeout: 5000,
}
"
    after="export const config = {
  retries: 3,
  timeout: 8000,
}
"
  />
</template>
