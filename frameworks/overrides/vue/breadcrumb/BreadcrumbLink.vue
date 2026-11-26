<script setup lang="ts">
/* A page above this one (an a; use the render slot for your router's link). The underline grows from its start on hover or keyboard focus. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat rtl:bg-right-bottom [transition:color_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-size_calc(320ms*var(--kf-speed,1))_var(--ease-spring)] hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px] data-hovered:bg-[length:100%_1px] motion-reduce:[transition:none]! inline-flex items-center gap-[var(--breadcrumb-item-gap,0.375rem)] rounded-[var(--breadcrumb-radius,4px)] outline-none hover:text-[color:var(--breadcrumb-current,var(--foreground))] focus-visible:text-[color:var(--breadcrumb-current,var(--foreground))] [&_svg]:size-[var(--breadcrumb-icon-size,0.875rem)] [&_svg]:shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
</script>

<template>
  <parts.Link v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Link>
</template>
