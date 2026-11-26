<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"

import type { ItemMediaVariant } from "@/components/keyframery/core/item-core"
import { cn } from "@/lib/utils"
import { ItemMediaPart, itemMediaClass } from "./parts"

defineOptions({ inheritAttrs: false })
defineProps<{ variant?: ItemMediaVariant }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const slots = useSlots()
const slotNames = computed(() => Object.keys(slots))
</script>

<template>
  <ItemMediaPart v-bind="forwarded" :variant="variant" :class="cn(itemMediaClass, attrs.class as any)">
    <template v-for="name in slotNames" :key="name" #[name]="s">
      <slot :name="name" v-bind="s ?? {}" />
    </template>
  </ItemMediaPart>
</template>
