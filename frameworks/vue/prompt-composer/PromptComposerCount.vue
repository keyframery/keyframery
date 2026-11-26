<script setup lang="ts">
/* The count beside Send. Its colour eases as it nears the limit (data-near, data-over). */
import { computed, useAttrs, useSlots } from "vue"

import { cn } from "@/lib/utils"
import { PromptComposerCountPart, countMotion } from "./parts"

defineOptions({ inheritAttrs: false })
withDefaults(defineProps<{ near?: boolean; over?: boolean }>(), { near: undefined, over: undefined })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const slots = useSlots()
const slotNames = computed(() => Object.keys(slots))
</script>

<template>
  <PromptComposerCountPart v-bind="forwarded" :near="near" :over="over" :class="cn(countMotion, attrs.class as any)">
    <template v-for="name in slotNames" :key="name" #[name]="s">
      <slot :name="name" v-bind="s ?? {}" />
    </template>
  </PromptComposerCountPart>
</template>
