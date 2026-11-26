<script setup lang="ts">
// Disabled
// Pass `focusableWhenDisabled` to keep it in the tab order, so a tooltip can say why.

import { Button } from "@/components/keyframery/button"
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <Button disabled>Sold out</Button>
    <Button variant="primary" disabled focusable-when-disabled>Pay now</Button>
  </div>
</template>
