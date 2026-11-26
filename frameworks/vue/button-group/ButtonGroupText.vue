<script setup lang="ts">
/* Words or an icon that belong to the group, on a well: a unit, a currency, a label. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "relative flex shrink-0 items-center gap-[var(--button-group-gap,0.375rem)] rounded-[var(--button-group-radius,9px)] bg-[var(--button-group-face,var(--muted))] px-[var(--button-group-inset-x,0.75rem)] text-[length:var(--button-group-font,13px)] leading-none font-medium whitespace-nowrap text-[color:var(--button-group-ink,var(--muted-foreground))] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)] [&_svg]:pointer-events-none [&_svg]:shrink-0"
</script>

<template>
  <parts.Text v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Text>
</template>
