<script setup lang="ts">
// Sizes
// `sm` for dense rows and toolbars, `md` by default, `lg` for a page's main action.

import { Button } from "@/components/keyframery/button"
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </div>
</template>
