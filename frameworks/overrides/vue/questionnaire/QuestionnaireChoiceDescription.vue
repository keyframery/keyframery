<script setup lang="ts">
/* Secondary text under a choice's label. */
import { useAttrs } from "vue"

import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
</script>

<template>
  <span v-bind="{ ...attrs, class: undefined }" :class="cn('text-[12px] text-[color:var(--questionnaire-muted,var(--muted-foreground))]', attrs.class as any)"><slot /></span>
</template>
