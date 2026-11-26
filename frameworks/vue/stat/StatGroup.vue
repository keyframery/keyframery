<script setup lang="ts">
/* Several stats as one object. Name it with `aria-label`. Its content goes in its grid. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { gridClass, groupClass, StatGroupGrid, StatGroupRoot } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ gridClassName?: string }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <StatGroupRoot v-bind="forwarded" :class="cn(groupClass, attrs.class as any)">
    <StatGroupGrid :class="cn(gridClass, props.gridClassName)"><slot /></StatGroupGrid>
  </StatGroupRoot>
</template>
