<script setup lang="ts">
/* The submit button: a primary key that turns the success green when the submission lands. Press; its
   label changes by Direction (up) to the pending label with a spinner, then to the success label as a
   check draws itself; refused, it comes back down to the start. The press, the labels' travel and blur
   and the drawn check scale with --kf-flourish. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ pendingLabel?: string; successLabel?: string }>(), { pendingLabel: "Sending", successLabel: "Sent" })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "group/submit",
  "transition-[scale,background-color,color,box-shadow] duration-[calc(220ms*var(--kf-speed,1))] ease-pop",
  "not-aria-disabled:active:scale-[calc(1-0.04*var(--kf-flourish,1))] not-aria-disabled:active:duration-[calc(90ms*var(--kf-speed,1))] not-aria-disabled:active:ease-house",
  "motion-reduce:transition-none!",
  "inline-flex h-[var(--form-height,2.25rem)] cursor-pointer items-center justify-center gap-1.5 rounded-[var(--form-radius,10px)] px-[var(--form-inset-x,1rem)] text-[length:var(--form-font,13px)] leading-none font-medium whitespace-nowrap outline-none select-none",
  "bg-[var(--form-face,var(--primary))] text-[color:var(--form-ink,var(--primary-foreground))] shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]",
  "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]",
  "not-aria-disabled:hover:bg-[color-mix(in_oklab,var(--primary),var(--background)_10%)]",
  "aria-disabled:cursor-progress",
  "data-[status=success]:bg-[oklch(0.62_0.16_150)] data-[status=success]:text-white data-[status=success]:hover:bg-[oklch(0.62_0.16_150)]",
  "dark:data-[status=success]:shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_1px_2px_rgb(0_0_0/0.5)]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
)
/* Each label sits in the same grid cell; the one for the current status is in place, the ones before it
   have risen out of the top and the ones after wait below. */
const label = cn(
  "col-start-1 row-start-1 inline-flex items-center justify-center gap-[inherit]",
  "transition-[opacity,translate,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-spring",
  "motion-reduce:transition-none!",
)
const hidden = "pointer-events-none opacity-0 blur-[calc(3px*var(--kf-flourish,1))]"
const atOf = (status: string) => (status === "submitting" ? 1 : status === "success" ? 2 : 0)
const place = (status: string, index: number) => {
  const at = atOf(status)
  return index === at ? "" : cn(hidden, index < at ? "-translate-y-[calc(0.75rem*var(--kf-flourish,1))]" : "translate-y-[calc(0.75rem*var(--kf-flourish,1))]")
}
const check = (status: string) =>
  cn(
    "[stroke-dasharray:1] transition-[stroke-dashoffset] duration-[calc(320ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-house",
    atOf(status) === 2 ? "[stroke-dashoffset:0] delay-[calc(140ms*var(--kf-speed,1)*var(--kf-flourish,1))]" : "[stroke-dashoffset:1] duration-0",
    "motion-reduce:transition-none!",
  )
</script>

<template>
  <parts.Submit v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="{ state }">
      <span class="grid gap-[inherit]">
        <span data-label="idle" :aria-hidden="atOf(state.status) !== 0 ? 'true' : undefined" :class="cn(label, place(state.status, 0))">
          <slot :state="state" />
        </span>
        <span data-label="submitting" :aria-hidden="atOf(state.status) !== 1 ? 'true' : undefined" :class="cn(label, place(state.status, 1))">
          <svg viewBox="0 0 16 16" fill="none" class="size-3.5 animate-[spin_calc(800ms*var(--kf-speed,1))_linear_infinite] motion-reduce:animate-none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.75" />
            <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
          </svg>
          <slot name="pending">{{ props.pendingLabel }}</slot>
        </span>
        <span data-label="success" :aria-hidden="atOf(state.status) !== 2 ? 'true' : undefined" :class="cn(label, place(state.status, 2))">
          <svg viewBox="0 0 16 16" fill="none" class="size-3.5" aria-hidden="true">
            <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" pathLength="1" :class="check(state.status)" />
          </svg>
          <slot name="success">{{ props.successLabel }}</slot>
        </span>
      </span>
    </template>
  </parts.Submit>
</template>
