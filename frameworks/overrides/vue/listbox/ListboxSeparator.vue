<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { ListboxSeparator as Part } from "@ui-sdk/vue/listbox"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "-mx-1.5 my-1 h-px shrink-0 bg-border group-data-[orientation=horizontal]/listbox:mx-1 group-data-[orientation=horizontal]/listbox:my-0 group-data-[orientation=horizontal]/listbox:h-auto group-data-[orientation=horizontal]/listbox:w-px"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
