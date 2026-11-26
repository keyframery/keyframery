<script setup lang="ts">
/* Animated input group on UI SDK's core (src/components/primitives/input-group.tsx) with the Keyframery look (src/components/ui/input-group.tsx).
   The group is the field: hairline, ring and background belong to it, and the Input or Textarea inside gives up its own.
   - The focus ring starts 10px out and closes in on a spring when the control takes focus.
   - Pop: anything marked data-show="filled" is away while the control is empty and pops in with the first character.
   - Roll: InputGroupCount rolls its digits as the text grows and shrinks.
   The ring's travel, the pop's shrink and turn, and the roll scale with --kf-flourish. */
import { computed, useAttrs } from "vue"

import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: SpeedValue }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "group/input-group relative outline-offset-[calc(10px*var(--kf-flourish,1))] data-focus-visible:outline-offset-0 [transition:outline-offset_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-width_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-color_0s_linear_calc(160ms*var(--kf-speed,1)),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)] data-focus-visible:[transition:outline-offset_calc(900ms*var(--kf-speed,1))_var(--ease-spring),outline-width_calc(900ms*var(--kf-speed,1))_var(--ease-spring),outline-color_calc(700ms*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)] motion-reduce:[transition:none]! [&_[data-show=filled]]:[transition:scale_calc(320ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(180ms*var(--kf-speed,1))_var(--ease-house),rotate_calc(320ms*var(--kf-speed,1))_var(--ease-pop),visibility_calc(180ms*var(--kf-speed,1))] not-data-filled:[&_[data-show=filled]]:invisible not-data-filled:[&_[data-show=filled]]:pointer-events-none not-data-filled:[&_[data-show=filled]]:scale-[calc(1-0.5*var(--kf-flourish,1))] not-data-filled:[&_[data-show=filled]]:opacity-0 not-data-filled:[&_[data-show=filled]]:rotate-[calc(-45deg*var(--kf-flourish,1))] not-data-filled:[&_[data-show=filled]]:[transition-duration:calc(140ms*var(--kf-speed,1))] motion-reduce:[&_[data-show=filled]]:[transition:none]! flex min-h-9 w-full min-w-0 items-center rounded-[var(--input-group-radius,10px)] bg-[var(--input-group-face,var(--background))] text-[length:var(--input-group-font,13px)] text-[color:var(--input-group-ink,var(--foreground))] has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-end]]:flex-col data-multiline:flex-col outline-0 outline-ring data-focus-visible:outline-[3px] data-focus-visible:outline-ring/30 [--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)] shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)] hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)] data-focus-visible:[--field-line:var(--ring)] dark:data-focus-visible:[--field-line:var(--ring)] data-invalid:outline-destructive data-invalid:data-focus-visible:outline-destructive/30 data-invalid:[--field-line:var(--destructive)] dark:data-invalid:[--field-line:var(--destructive)] data-disabled:cursor-not-allowed data-disabled:bg-muted data-disabled:[--field-line:rgb(0_0_0/0.06)] dark:data-disabled:[--field-line:rgb(255_255_255/0.06)] *:data-[slot=input]:h-[var(--input-group-height,2.25rem)] *:data-[slot=input]:flex-1 *:data-[slot=input]:self-stretch *:data-[slot=input]:rounded-none! *:data-[slot=input]:bg-transparent! *:data-[slot=input]:[box-shadow:none]! *:data-[slot=input]:outline-0! *:data-[slot=textarea]:w-full *:data-[slot=textarea]:min-h-[64px] *:data-[slot=textarea]:rounded-none! *:data-[slot=textarea]:bg-transparent! *:data-[slot=textarea]:py-2.5 *:data-[slot=textarea]:[box-shadow:none]! *:data-[slot=textarea]:outline-0! has-[>[data-align=inline-start]]:*:data-[slot=input]:ps-1.5 has-[>[data-align=inline-end]]:*:data-[slot=input]:pe-1.5 has-[>[data-align=block-start]]:*:data-[slot=textarea]:pt-1 has-[>[data-align=block-end]]:*:data-[slot=textarea]:pb-1"
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root v-bind="forwarded" :class="cn(base, attrs.class as any)">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>
