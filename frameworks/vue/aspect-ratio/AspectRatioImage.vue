<script setup lang="ts">
/* The photo in the frame: UI SDK's avatar primitive, which knows when an image has loaded or failed. It fades up
   out of an 18px blur and a 1.08 zoom once it has loaded, so a photo never paints in strips; a new src plays it
   again. Until then the default slot (a placeholder) shows. The blur, zoom and rise scale with --kf-flourish.
   `@loading-status-change` runs when the image starts loading, loads or fails. */
import { Avatar, AvatarFallback, AvatarImage } from "@ui-sdk/vue/avatar"
import { computed, useAttrs, useSlots } from "vue"

import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ src?: string; alt?: string }>(), { src: undefined, alt: "" })
const emit = defineEmits<{ loadingStatusChange: [status: any, details: any] }>()
const attrs = useAttrs()
const slots = useSlots()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "absolute inset-0 size-full object-cover",
  "[transition:opacity_calc(460ms*var(--kf-speed,1))_var(--ease-house),filter_calc(760ms*var(--kf-speed,1))_var(--ease-house),scale_calc(900ms*var(--kf-speed,1))_var(--ease-spring),translate_calc(900ms*var(--kf-speed,1))_var(--ease-spring)]",
  "not-data-[loading-status=loaded]:translate-y-[calc(0.5rem*var(--kf-flourish,1))] not-data-[loading-status=loaded]:scale-[calc(1+0.08*var(--kf-flourish,1))] not-data-[loading-status=loaded]:opacity-0 not-data-[loading-status=loaded]:blur-[calc(18px*var(--kf-flourish,1))]",
  "starting:translate-y-[calc(0.5rem*var(--kf-flourish,1))] starting:scale-[calc(1+0.08*var(--kf-flourish,1))] starting:opacity-0 starting:blur-[calc(18px*var(--kf-flourish,1))]",
  "motion-reduce:transition-none!",
  "[object-fit:var(--aspect-ratio-fit,cover)] [object-position:var(--aspect-ratio-position-x,50%)_var(--aspect-ratio-position-y,50%)]",
  "saturate-[var(--aspect-ratio-saturation,1)] contrast-[var(--aspect-ratio-contrast,1)] brightness-[var(--aspect-ratio-brightness,1)]",
)
</script>

<template>
  <!-- Keyed by the source, so each new photo gets its own entrance. The frame is the image for screen readers
       and agents: it carries the description, and is hidden when there is none. -->
  <Avatar
    :key="props.src"
    :role="props.alt ? 'img' : undefined"
    :aria-label="props.alt || undefined"
    :aria-hidden="props.alt ? undefined : true"
    class="absolute inset-0 block overflow-hidden"
    @loading-status-change="(status: any, details: any) => emit('loadingStatusChange', status, details)"
  >
    <AvatarImage :src="props.src" :alt="props.alt" v-bind="forwarded" :class="cn(base, attrs.class as any)" />
    <AvatarFallback v-if="slots.default" class="absolute inset-0 block"><slot /></AvatarFallback>
  </Avatar>
</template>
