<script setup lang="ts">
// Review an agent's edit
// Pass `onAccept` and `onReject` and every hunk gets the two buttons. Each call carries the hunk's index, so you can apply or drop that part of the edit.

import { ref } from "vue"

import { DiffViewer } from "@/components/keyframery/diff-viewer"

const before = `export function formatPrice(cents: number) {
  return "$" + (cents / 100).toFixed(2)
}

export function formatDate(date: Date) {
  return date.toLocaleDateString()
}
`
const after = `export function formatPrice(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100)
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { dateStyle: "medium" })
}
`

const log = ref<string[]>([])
</script>

<template>
  <div class="w-full max-w-[640px] space-y-2">
    <DiffViewer
      filename="src/lib/format.ts"
      :before="before"
      :after="after"
      :context="1"
      @accept="(index) => log = [...log, `Accepted change ${index + 1}`]"
      @reject="(index) => log = [...log, `Rejected change ${index + 1}`]"
    />
    <p class="text-[12px] text-muted-foreground">{{ log.at(-1) ?? 'Nothing reviewed yet' }}</p>
  </div>
</template>
