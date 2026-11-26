<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { TokenInputEditor as Part } from "@ui-sdk/vue/token-input"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "relative min-h-[var(--token-input-height,2.25rem)] w-full min-w-0 cursor-text rounded-[var(--token-input-radius,10px)] bg-[var(--token-input-face,var(--background))] px-2 py-[5px] text-[13px] leading-[calc(var(--token-input-height,2.25rem)-10px)] break-words whitespace-pre-wrap text-[color:var(--token-input-ink,var(--foreground))] outline-none [--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)] shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)] transition-[box-shadow] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none! hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)] focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:[--field-line:var(--ring)] dark:focus-visible:[--field-line:var(--ring)] aria-invalid:ring-destructive/25 aria-invalid:[--field-line:var(--destructive)] dark:aria-invalid:[--field-line:var(--destructive)] data-empty:before:pointer-events-none data-empty:before:absolute data-empty:before:text-muted-foreground data-empty:before:content-[attr(aria-placeholder)] data-readonly:bg-[var(--token-input-face,color-mix(in_oklab,var(--muted)_50%,transparent))] data-disabled:cursor-not-allowed data-disabled:bg-[var(--token-input-face,var(--muted))] data-disabled:text-muted-foreground data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)]"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
