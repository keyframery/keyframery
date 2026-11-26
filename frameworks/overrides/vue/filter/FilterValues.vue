<script setup lang="ts">
/* The chosen values: a hairline, then up to `max` badges, else "3 selected" with the number rolling.
   In a narrow bar (under 28rem) only the number shows. The box's width follows its row on a spring and
   each badge pops in, one after another. */
import { computed, useAttrs } from "vue"

import { Badge } from "@/components/keyframery/badge"
import { cn } from "@/lib/utils"

import { FilterValuesRoot } from "./primitive"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ max?: number; innerClass?: string }>(), { max: 2, innerClass: undefined })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "relative inline-flex shrink-0 overflow-hidden w-(--filter-values-width,auto)",
  "transition-[width,opacity] duration-[calc(460ms*var(--kf-speed,1))] ease-spring data-empty:opacity-0 data-empty:duration-[calc(260ms*var(--kf-speed,1))] data-empty:ease-house",
  "motion-reduce:transition-none!",
)
const badge = "h-5 rounded-[5px] bg-[var(--filter-badge,var(--secondary))] px-1.5 font-medium"
</script>

<template>
  <FilterValuesRoot :inner-class="props.innerClass" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="{ state }">
      <template v-if="state.count !== 0">
        <span key="rule" class="mx-2 h-4 w-px bg-border" />
        <Badge
          key="count"
          variant="secondary"
          :count="state.count"
          :class="cn(badge, state.count > props.max ? 'inline-flex' : 'hidden @max-md/filter-bar:inline-flex')"
        >
          <template v-if="state.count > props.max">selected</template>
        </Badge>
        <template v-if="state.count <= props.max">
          <Badge
            v-for="(label, index) in state.chosen"
            :key="state.value[index]"
            variant="secondary"
            :class="cn('ml-1', badge, 'first-of-type:ml-0 @max-md/filter-bar:hidden')"
          >
            {{ label }}
          </Badge>
        </template>
      </template>
    </template>
  </FilterValuesRoot>
</template>
