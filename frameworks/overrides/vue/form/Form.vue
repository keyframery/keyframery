<script setup lang="ts">
/* An animated form on UI SDK's core and UI SDK's Field (src/components/primitives/form.tsx + ui/form.tsx).
   It runs your `submit` once every field passes, keeps the submission's status and puts server errors on
   the fields they belong to. While it submits, its fields settle back a little (feedback) with a slight
   blur (flourish), and come forward again after. */
import { computed, useAttrs } from "vue"

import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ speed?: SpeedValue }>(), { speed: undefined })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "[&_[data-slot=field]]:transition-[opacity,filter] [&_[data-slot=field]]:duration-[calc(320ms*var(--kf-speed,1))] [&_[data-slot=field]]:ease-house",
  "data-[status=submitting]:[&_[data-slot=field]]:opacity-55 data-[status=submitting]:[&_[data-slot=field]]:blur-[calc(0.6px*var(--kf-flourish,1))]",
  "motion-reduce:[&_[data-slot=field]]:transition-none!",
  "flex min-w-0 flex-col gap-[var(--form-gap,1rem)]",
)
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root v-bind="forwarded" :class="cn(base, attrs.class as any)">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>
