<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { TokenInputToken as Part } from "@ui-sdk/vue/token-input"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "origin-center transition-[scale,opacity,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-pop starting:scale-[calc(0.95-0.55*var(--kf-flourish,1))] starting:opacity-0 starting:blur-[calc(3px*var(--kf-flourish,1))] motion-reduce:transition-none! mx-[2px] inline-flex h-[calc(var(--token-input-height,2.25rem)-14px)] max-w-full items-center gap-1 rounded-[var(--token-input-token-radius,7px)] bg-[var(--token-input-token,var(--background))] pr-0.5 pl-2 align-middle text-[12px] leading-none font-medium whitespace-nowrap text-[color:var(--token-input-ink,var(--foreground))] select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] dark:bg-[var(--token-input-token,var(--accent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground data-selected:bg-[var(--token-input-accent,var(--primary))] data-selected:text-[color:var(--token-input-ink,var(--primary-foreground))] data-selected:[&>svg]:text-primary-foreground/70 data-selected:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] data-pending:opacity-60 data-unresolved:bg-[color-mix(in_oklab,var(--token-input-error,var(--destructive))_10%,transparent)] data-unresolved:text-[color:var(--token-input-error,var(--destructive))] data-unresolved:shadow-[0_0_0_1px_color-mix(in_oklab,var(--token-input-error,var(--destructive))_35%,transparent)] dark:data-unresolved:bg-[color-mix(in_oklab,var(--token-input-error,var(--destructive))_15%,transparent)] data-disabled:opacity-60"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
