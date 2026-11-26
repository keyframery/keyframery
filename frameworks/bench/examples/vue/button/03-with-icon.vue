<script setup lang="ts">
// With an icon
// Wrap a leading icon in `ButtonIcon` so it moves with the label. `ButtonArrow` draws a trailing arrow that nudges forward on hover.

import { Download } from "@lucide/vue"

import { Button, ButtonArrow, ButtonIcon } from "@/components/keyframery/button"
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <Button>
      <ButtonIcon>
        <Download />
      </ButtonIcon>
      Export
    </Button>
    <Button variant="primary">Continue<ButtonArrow /></Button>
  </div>
</template>
