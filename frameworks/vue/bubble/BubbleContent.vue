<script setup lang="ts">
/* The bubble you see. A bubble that is a button or a link (render slot) presses in and darkens a touch on hover. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "[button&,a&]:transition-[scale] [button&,a&]:duration-[calc(200ms*var(--kf-speed,1))] [button&,a&]:ease-pop [button&,a&]:active:scale-[calc(1-0.03*var(--kf-flourish,1))] motion-reduce:transition-none! w-fit max-w-full min-w-0 overflow-hidden rounded-[var(--bubble-radius,18px)] px-[var(--bubble-inset-x,0.875rem)] py-[var(--bubble-inset-y,0.5rem)] text-[length:var(--bubble-font,14px)] leading-[1.45] wrap-break-word group-data-[align=start]/bubble:rounded-es-[4px] group-data-[align=end]/bubble:self-end group-data-[align=end]/bubble:rounded-ee-[4px] [button&]:cursor-pointer [button&]:text-left [button&,a&]:outline-none [button&,a&]:focus-visible:ring-2 [button&,a&]:focus-visible:ring-ring [button&,a&]:focus-visible:ring-offset-2 [button&,a&]:focus-visible:ring-offset-background [button&,a&]:transition-[scale,background-color] [button&,a&]:duration-[calc(150ms*var(--kf-speed,1))]"
</script>

<template>
  <parts.Content v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Content>
</template>
