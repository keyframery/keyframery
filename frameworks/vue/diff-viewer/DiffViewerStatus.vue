<script setup lang="ts">
/* The decision, once taken: "Accepted" (its tick draws itself) or "Rejected". Rises in where the buttons were. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { arrive, parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ value: string }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <parts.Status :value="props.value" v-bind="forwarded" :class="cn(arrive, attrs.class as any)">
    <template #default="{ state }">
      <slot :state="state">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path
            v-if="state.decision === 'accepted'"
            d="M3.5 8.5 6.5 11.5 12.5 4.75"
            pathLength="1"
            class="[stroke-dasharray:1] animate-[kf-diff-tick_calc(320ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_calc(120ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards] motion-reduce:animate-none"
          />
          <path v-else d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
        </svg>
        {{ state.decision === "accepted" ? "Accepted" : "Rejected" }}
      </slot>
    </template>
  </parts.Status>
</template>
