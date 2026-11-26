<script setup lang="ts">
// Swap to the content
// `SkeletonSwap` shows the `fallback` while `loading`, then crossfades to the real content.

import { ref, watch } from "vue"

import { Button } from "@/components/keyframery/button"
import { Skeleton, SkeletonSwap } from "@/components/keyframery/skeleton"

const loading = ref(true)
watch(
  loading,
  (now, _, onCleanup) => {
    if (!now) return
    const t = setTimeout(() => (loading.value = false), 1500)
    onCleanup(() => clearTimeout(t))
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex w-full max-w-[300px] flex-col gap-4">
    <SkeletonSwap :loading="loading">
      <template #fallback>
        <div class="space-y-2">
          <Skeleton class="h-4 w-36" />
          <Skeleton class="h-3 w-52" />
        </div>
      </template>
      <div class="space-y-1">
        <div class="text-[14px] font-semibold">Maya Chen</div>
        <div class="text-[13px] text-muted-foreground">Product designer in Lisbon</div>
      </div>
    </SkeletonSwap>
    <Button size="sm" class="self-start" :disabled="loading" @click="loading = true">Reload</Button>
  </div>
</template>
