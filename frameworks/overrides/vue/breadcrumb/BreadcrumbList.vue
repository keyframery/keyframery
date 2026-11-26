<script setup lang="ts">
/* Holds the cascade's delays until the first crumbs are in (700ms × speed × flourish); after that a new crumb arrives at once. */
import { computed, onBeforeUnmount, onMounted, ref, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const list = ref<{ $el?: Element } | null>(null)
const settled = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
onMounted(() => {
  const el = list.value?.$el
  const style = el instanceof Element ? getComputedStyle(el) : null
  const speed = (style && parseFloat(style.getPropertyValue("--kf-speed"))) || 1
  const f = style ? parseFloat(style.getPropertyValue("--kf-flourish")) : NaN
  const flourish = Number.isFinite(f) ? f : 1
  timer = setTimeout(() => (settled.value = true), 700 * speed * flourish)
})
onBeforeUnmount(() => clearTimeout(timer))
const base =
  "group/breadcrumb flex min-w-0 flex-wrap items-center gap-[var(--breadcrumb-gap,0.25rem)] text-[length:var(--breadcrumb-font,13px)] leading-5 break-words text-[color:var(--breadcrumb-ink,var(--muted-foreground))]"
</script>

<template>
  <parts.List ref="list" :data-settled="settled || undefined" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.List>
</template>
