<script setup lang="ts">
// Placeholder shapes
// Size each `Skeleton` like the content that's coming, so nothing jumps when it arrives.

import { Skeleton } from "@/components/keyframery/skeleton"
</script>

<template>
  <div class="flex w-full max-w-[300px] items-center gap-3">
    <Skeleton class="size-11 rounded-full" />
    <div class="flex-1 space-y-2">
      <Skeleton class="h-3.5 w-32" />
      <Skeleton class="h-3 w-48" />
    </div>
  </div>
</template>
