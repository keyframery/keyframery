<script setup lang="ts">
/* Animated file attachment on UI SDK's core (src/components/primitives/attachment.tsx) with the Keyframery look (src/components/ui/attachment.tsx).
   A file on a small sheet with its picture or icon in a well; not sent yet, the hairline is dashed; uploading, a thin line
   fills along the foot; on error the hairline and icon turn destructive.
   - Pop: a new attachment grows in from 80% with a blur that clears.
   - Leave: remove() shrinks and fades it, then closes the gap it leaves (give the group's gap as --attachment-gap).
   The growth below 95% and the blur scale with --kf-flourish. @remove runs once it has left (cancel to keep it). */
import { computed, onMounted, ref, useAttrs } from "vue"

import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: SpeedValue; status?: "idle" | "uploading" | "processing" | "error" | "done"; progress?: number; size?: "default" | "sm" | "xs"; orientation?: "horizontal" | "vertical"; value?: string }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "group/attachment origin-center [transition:scale_calc(520ms*var(--kf-speed,1))_var(--ease-pop),translate_calc(520ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(220ms*var(--kf-speed,1))_var(--ease-house),filter_calc(300ms*var(--kf-speed,1))_var(--ease-house)] data-starting-style:scale-[calc(0.95-0.15*var(--kf-flourish,1))] data-starting-style:translate-y-1.5 data-starting-style:opacity-0 data-starting-style:blur-[calc(6px*var(--kf-flourish,1))] data-starting-style:transition-none data-ending-style:scale-[calc(0.95-0.09*var(--kf-flourish,1))] data-ending-style:opacity-0 data-ending-style:blur-[calc(4px*var(--kf-flourish,1))] data-ending-style:[margin-inline-end:calc((var(--attachment-width,0px)+var(--attachment-gap,0px))*-1*var(--attachment-collapse-x,1))] data-ending-style:[margin-block-end:calc((var(--attachment-height,0px)+var(--attachment-gap,0px))*-1*var(--attachment-collapse-y,0))] data-ending-style:[transition:scale_calc(200ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(180ms*var(--kf-speed,1))_var(--ease-house),filter_calc(180ms*var(--kf-speed,1))_var(--ease-house),margin-inline-end_calc(320ms*var(--kf-speed,1))_var(--ease-house)_calc(90ms*var(--kf-speed,1)),margin-block-end_calc(320ms*var(--kf-speed,1))_var(--ease-house)_calc(90ms*var(--kf-speed,1))] motion-reduce:[transition:none]! relative isolate flex w-fit max-w-full min-w-0 shrink-0 overflow-hidden rounded-[var(--attachment-radius,12px)] bg-[var(--attachment-face,var(--background))] text-[color:var(--attachment-ink,var(--foreground))] shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.05)] dark:bg-[var(--attachment-face,color-mix(in_oklab,var(--accent)_40%,transparent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)] has-[>[data-slot=attachment-trigger]:hover]:bg-[color-mix(in_oklab,var(--background),var(--foreground)_3%)] has-[>[data-slot=attachment-trigger]:focus-visible]:ring-2 has-[>[data-slot=attachment-trigger]:focus-visible]:ring-ring has-[>[data-slot=attachment-trigger]:focus-visible]:ring-offset-2 has-[>[data-slot=attachment-trigger]:focus-visible]:ring-offset-background data-[status=idle]:bg-transparent data-[status=idle]:shadow-none data-[status=idle]:outline data-[status=idle]:outline-1 data-[status=idle]:-outline-offset-1 data-[status=idle]:outline-dashed data-[status=idle]:outline-foreground/20 data-[status=error]:shadow-[0_0_0_1px_color-mix(in_oklab,var(--destructive)_45%,transparent),0_1px_2px_rgb(0_0_0/0.05)] data-[orientation=horizontal]:min-w-44 data-[orientation=horizontal]:items-center data-[orientation=horizontal]:data-[size=default]:gap-[var(--attachment-gap,0.625rem)] data-[orientation=horizontal]:data-[size=default]:p-[var(--attachment-padding,0.375rem)] data-[orientation=horizontal]:data-[size=default]:pe-2 data-[orientation=horizontal]:data-[size=sm]:gap-2 data-[orientation=horizontal]:data-[size=sm]:p-1 data-[orientation=horizontal]:data-[size=sm]:pe-1.5 data-[size=xs]:min-w-0 data-[size=xs]:gap-1.5 data-[size=xs]:rounded-[9px] data-[size=xs]:p-1 data-[size=xs]:pe-1.5 data-[orientation=vertical]:w-40 data-[orientation=vertical]:data-[size=sm]:w-34 data-[orientation=vertical]:data-[size=xs]:w-28 data-[orientation=vertical]:flex-col data-[orientation=vertical]:gap-2 data-[orientation=vertical]:p-[var(--attachment-padding,0.375rem)] data-[orientation=vertical]:pb-2"
/* The core plays the entrance when the part binds, unless it sits in history (closest("[data-history]") on a
   message scroller's item). Vue binds a part before its ancestors are in the page, so it joins once mounted
   (React's refs attach after the whole tree is in). */
const mounted = ref(false)
onMounted(() => (mounted.value = true))
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root v-if="mounted" :status="props.status" :progress="props.progress" :size="props.size" :orientation="props.orientation" :value="props.value" v-bind="forwarded" :class="cn(base, attrs.class as any)">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>
