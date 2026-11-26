<script setup lang="ts">
// Sizes and drawings
// `size` is `sm`, `md` or `lg`; `variant="spokes"` draws eight fading spokes instead of the stretching ring. It takes the text colour.

import { Spinner } from "@/components/keyframery/spinner"
</script>

<template>
  <div class="flex items-center gap-5 text-muted-foreground">
    <Spinner size="sm" />
    <Spinner />
    <Spinner size="lg" />
    <Spinner size="lg" variant="spokes" />
  </div>
</template>
