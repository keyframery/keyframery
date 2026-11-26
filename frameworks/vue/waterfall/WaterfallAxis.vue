<script setup lang="ts">
/* Round times along the top of the timeline. Same as UI SDK's axis, but its default ticks glide when the
   range moves (the animated tick, as in React, where the default ticks come from the primitive). */
import { computed, useAttrs, useSlots } from "vue"
import { WaterfallAxis as Part, WaterfallTick as TickPart } from "@ui-sdk/vue/waterfall"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const tick = "absolute start-(--waterfall-tick) transition-[inset-inline-start] duration-[calc(560ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none!"
</script>

<template>
  <Part v-bind="rest" :class="cn('relative h-full flex-1', attrs.class as any)">
    <template #default="s">
      <slot v-bind="s ?? {}">
        <TickPart v-for="t in s.state.ticks" :key="t.time" :time="t.time" :class="tick" />
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
