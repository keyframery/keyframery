<script setup lang="ts">
// Icon only
// The `icon` sizes make a square button. Give it an `aria-label`, since there is no text to read.

import { Pencil, Plus, Trash2 } from "@lucide/vue"

import { Button } from "@/components/keyframery/button"
</script>

<template>
  <div class="flex items-center justify-center gap-2">
    <Button size="icon-sm" aria-label="Edit">
      <Pencil />
    </Button>
    <Button size="icon" variant="ghost" aria-label="Delete">
      <Trash2 />
    </Button>
    <Button size="icon-lg" variant="primary" aria-label="Add">
      <Plus />
    </Button>
  </div>
</template>
