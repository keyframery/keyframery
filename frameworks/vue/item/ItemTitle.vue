<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"

import { cn } from "@/lib/utils"
import { ItemTitlePart, itemTitleClass } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const slots = useSlots()
const slotNames = computed(() => Object.keys(slots))
</script>

<template>
  <ItemTitlePart v-bind="forwarded" :class="cn(itemTitleClass, attrs.class as any)">
    <template v-for="name in slotNames" :key="name" #[name]="s">
      <slot :name="name" v-bind="s ?? {}" />
    </template>
  </ItemTitlePart>
</template>
