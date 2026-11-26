<script setup lang="ts">
/* A group of pages. With `collapsible` its label becomes a trigger that folds the group away with
   the collapsible's height and cascade. */
import { computed, provide, useAttrs } from "vue"
import { Collapsible } from "@ui-sdk/vue/collapsible"

import { cn } from "@/lib/utils"
import { groupClass, groupKey, parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    /** The label becomes a trigger that folds the group away. */
    collapsible?: boolean
    defaultOpen?: boolean
    open?: boolean
  }>(),
  { collapsible: false, defaultOpen: true, open: undefined },
)
const emit = defineEmits<{ openChange: [open: boolean]; "update:open": [open: boolean] }>()
provide(groupKey, () => props.collapsible)
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const onOpenChange = (open: boolean) => {
  emit("openChange", open)
  emit("update:open", open)
}
</script>

<template>
  <Collapsible v-if="collapsible" :default-open="defaultOpen" :open="open" @open-change="onOpenChange">
    <parts.Group v-bind="forwarded" :class="cn(groupClass, attrs.class as any)">
      <template #default="scope"><slot v-bind="scope" /></template>
    </parts.Group>
  </Collapsible>
  <parts.Group v-else v-bind="forwarded" :class="cn(groupClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </parts.Group>
</template>
