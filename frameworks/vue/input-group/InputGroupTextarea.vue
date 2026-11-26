<script setup lang="ts">
/* Keyframery's Textarea, for a group. It still grows with its text. */
import { useAttrs } from "vue"

import { Textarea } from "@/components/keyframery/textarea"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const base = "resize-none text-[length:var(--input-group-font,var(--textarea-font,13px))] text-[color:var(--input-group-ink,var(--textarea-ink,var(--foreground)))]"
</script>

<template>
  <Textarea v-bind="attrs" :class="cn(base, attrs.class as any)" />
</template>
