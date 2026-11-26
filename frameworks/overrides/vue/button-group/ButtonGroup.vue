<script setup lang="ts">
/* Animated button group on UI SDK's core (src/components/primitives/button-group.tsx) with the Keyframery look (src/components/ui/button-group.tsx).
   Put Keyframery's Button straight inside it. Joined segments keep one hairline between them and only the outer corners.
   - Glide: one highlight springs from segment to segment under the pointer or keyboard focus, taking each segment's corners.
   - It fades in where it lands the first time, and fades out where it was when the pointer leaves.
   The highlight's grow-in, the separator's draw-in and the press sink scale with --kf-flourish; the glide stays. */
import { computed, useAttrs } from "vue"

import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: SpeedValue; orientation?: "horizontal" | "vertical" }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "relative isolate after:pointer-events-none after:absolute after:z-20 after:content-[''] after:top-(--highlight-top,0) after:left-(--highlight-left,0) after:h-(--highlight-height,0) after:w-(--highlight-width,0) after:rounded-(--highlight-radius,0) after:bg-[color-mix(in_oklch,currentColor_9%,transparent)] after:opacity-0 after:scale-[calc(1-0.06*var(--kf-flourish,1))] after:[transition:opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house),scale_calc(220ms*var(--kf-speed,1))_var(--ease-house)] data-highlighted:after:opacity-100 data-highlighted:after:scale-100 data-gliding:after:[transition:left_calc(380ms*var(--kf-speed,1))_var(--ease-spring),top_calc(380ms*var(--kf-speed,1))_var(--ease-spring),width_calc(380ms*var(--kf-speed,1))_var(--ease-spring),height_calc(380ms*var(--kf-speed,1))_var(--ease-spring),border-radius_calc(380ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house),scale_calc(220ms*var(--kf-speed,1))_var(--ease-house)] motion-reduce:after:[transition:opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house)]! motion-reduce:after:scale-100 flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-[var(--button-group-gap,0.5rem)] [&>*]:focus-visible:z-10 [&>*:hover]:z-[5] data-[orientation=horizontal]:[&>*:not([data-slot=button-group]):not(:first-child)]:-ms-px data-[orientation=horizontal]:[&>*:not([data-slot=button-group]):not(:first-child)]:rounded-s-none data-[orientation=horizontal]:[&>*:not([data-slot=button-group]):not(:last-child)]:rounded-e-none data-[orientation=vertical]:flex-col data-[orientation=vertical]:[&>*:not([data-slot=button-group])]:w-auto! data-[orientation=vertical]:[&>*:not([data-slot=button-group]):not(:first-child)]:-mt-px data-[orientation=vertical]:[&>*:not([data-slot=button-group]):not(:first-child)]:rounded-t-none data-[orientation=vertical]:[&>*:not([data-slot=button-group]):not(:last-child)]:rounded-b-none [&>[data-slot=button]:active]:scale-[calc(1-0.025*var(--kf-flourish,1))]! *:data-[slot=input]:flex-1 *:data-[slot=native-select]:min-w-0"
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root :orientation="props.orientation" v-bind="forwarded" :class="cn(base, attrs.class as any)">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>
