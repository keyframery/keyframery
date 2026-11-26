<script setup lang="ts">
/* Keyframery's Input, for a group. */
import { useAttrs } from "vue"

import { Input } from "@/components/keyframery/input"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const base = "min-w-0 text-[length:var(--input-group-font,var(--input-font,13px))] text-[color:var(--input-group-ink,var(--input-ink,var(--foreground)))]"
</script>

<template>
  <Input v-bind="attrs" :class="cn(base, attrs.class as any)" />
</template>
