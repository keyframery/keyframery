<script setup lang="ts">
// Read only, with halves
// `readOnly` shows a score, and a fraction fills part of a star. `getValueLabel` words it for screen readers.

import { Rating } from "@/components/keyframery/rating"
</script>

<template>
  <div class="flex items-center gap-2 text-[13px]">
    <Rating :value="4.5" read-only :get-value-label="(value, max) => `Rated ${value} out of ${max}`" />
    <span class="font-medium">4.5</span>
    <span class="text-muted-foreground">(1,284 reviews)</span>
  </div>
</template>
