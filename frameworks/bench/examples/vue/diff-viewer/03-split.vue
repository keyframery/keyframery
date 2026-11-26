<script setup lang="ts">
// Side by side
// Start in the split view with `defaultView="split"`. Below `splitMinWidth` (640px by default) it shows as unified, so it still reads on a phone.

import { DiffViewer } from "@/components/keyframery/diff-viewer"

const before = `{
  "name": "orders-api",
  "version": "1.4.0",
  "dependencies": {
    "zod": "^3.22.0"
  }
}
`
const after = `{
  "name": "orders-api",
  "version": "1.5.0",
  "dependencies": {
    "zod": "^3.23.8",
    "pino": "^9.4.0"
  }
}
`
</script>

<template>
  <DiffViewer
    filename="package.json"
    :before="before"
    :after="after"
    default-view="split"
    :line-numbers="false"
  />
</template>
