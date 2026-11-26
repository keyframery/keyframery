<script lang="ts">
import type { ElementProps } from "@/lib/keyframery"

type OwnProps = { type?: "default" | "success" | "error" | "warning" | "info" | "loading" }
/** Props of ToastIcon: the toast's type, plus the attributes of its <span>. */
export type ToastIconProps = Omit<ElementProps<"span">, keyof OwnProps> & OwnProps
</script>

<script setup lang="ts">
/* @@BANNER
   A small mark by type. As the toast arrives its tile pops in and its mark draws itself. The type
   "default" renders nothing, like React's (the svg attributes React spreads are written out). */
import { computed, useAttrs } from "vue"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<OwnProps & /* @vue-ignore */ ToastIconProps>(), { type: "default" })
const attrs = useAttrs() as any
const forwarded = computed<any>(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const root = @@CLASS(ToastIcon,0,v=success)
const tile = @@CLASS(ToastIcon,1,v=success)
const draw = @@CLASS(ToastIcon,2,v=success)
const spin = @@CLASS(ToastIcon,2,v=loading)
</script>

<template>
  <span v-if="props.type !== 'default'" data-slot="toast-icon" :data-type="props.type" v-bind="forwarded" :class="cn(root, attrs.class as any)">
    <span :class="tile">
      <svg v-if="props.type === 'success'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m4.5 8.25 2.25 2.25 4.75-5" pathLength="1" :class="draw" />
      </svg>
      <svg v-if="props.type === 'error' || props.type === 'warning'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M8 4.75v3.75" pathLength="1" :class="draw" />
        <path d="M8 11.25v.01" />
      </svg>
      <svg v-if="props.type === 'info'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M8 7.5v3.75" pathLength="1" :class="draw" />
        <path d="M8 4.75v.01" />
      </svg>
      <svg v-if="props.type === 'loading'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="spin">
        <path d="M8 2.5a5.5 5.5 0 1 1-5.5 5.5" />
      </svg>
    </span>
  </span>
</template>
