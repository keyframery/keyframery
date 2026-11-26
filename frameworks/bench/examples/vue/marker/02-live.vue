<script setup lang="ts">
// A status that finishes
// `live` makes the marker a status that screen readers read out. While `pending`, a light sweeps
// across the words; when it turns off, the finished text rises in.

import { onBeforeUnmount, ref } from "vue"
import { Check, LoaderCircle } from "@lucide/vue"

import { Button } from "@/components/keyframery/button"
import { Marker, MarkerContent, MarkerIcon } from "@/components/keyframery/marker"

const pending = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(timer))

function onClick() {
  pending.value = true
  clearTimeout(timer)
  timer = setTimeout(() => pending.value = false, 2400)
}
</script>

<template>
  <div class="flex w-full max-w-[360px] flex-col items-start gap-4">
    <Marker live :pending="pending">
      <MarkerIcon :key="String(pending)">
        <LoaderCircle v-if="pending" class="animate-spin motion-reduce:animate-none" />
        <Check v-else />
      </MarkerIcon>
      <MarkerContent>{{ pending ? 'Exporting 214 invoices' : 'Export ready, 214 invoices' }}</MarkerContent>
    </Marker>
    <Button size="sm" @click="onClick">Export again</Button>
  </div>
</template>
