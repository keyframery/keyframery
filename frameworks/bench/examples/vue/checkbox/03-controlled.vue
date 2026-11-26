<script setup lang="ts">
// Controlled
// Pass `checked` and `onCheckedChange` to keep it in your own state.

import { ref } from "vue"

import { Checkbox } from "@/components/keyframery/checkbox"

const agreed = ref(false)
</script>

<template>
  <div class="flex flex-col items-start gap-2 text-[13px]">
    <label class="flex items-center gap-2.5">
      <Checkbox :checked="agreed" @checked-change="(checked) => agreed = checked === true" />I've read the terms
    </label>
    <span class="text-muted-foreground">{{ agreed ? 'Thanks, you can continue.' : 'Tick the box to continue.' }}</span>
  </div>
</template>
