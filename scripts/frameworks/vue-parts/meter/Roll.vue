<script setup lang="ts">
/* @@BANNER
   Roll: every digit is a column of 0 to 9 that slides to its value on a spring; other characters
   (the decimal point, units) stay put. Exported for other numbers, like React's. */
import { Roll as RollBase } from "@/lib/keyframery"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ text: string; class?: string }>()
</script>

<template>
  <RollBase :text="props.text" :class="props.class" />
</template>
