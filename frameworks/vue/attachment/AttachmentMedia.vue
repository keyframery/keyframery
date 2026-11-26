<script setup lang="ts">
/* The picture or the file-type icon, in a well (variant icon, the default, or image). An image dims and softens
   while its file uploads, and clears when it is done. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ variant?: "icon" | "image" }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "data-[variant=image]:[&_img]:transition-[opacity,filter] data-[variant=image]:[&_img]:duration-[calc(420ms*var(--kf-speed,1))] data-[variant=image]:[&_img]:ease-house",
  "group-data-[status=uploading]/attachment:data-[variant=image]:[&_img]:opacity-60 group-data-[status=uploading]/attachment:data-[variant=image]:[&_img]:blur-[2px]",
  "group-data-[status=processing]/attachment:data-[variant=image]:[&_img]:opacity-75",
  "motion-reduce:[&_img]:transition-none!",
  "relative flex aspect-square size-[var(--attachment-media-size,2.5rem)] shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-muted text-[color:var(--attachment-muted,var(--muted-foreground))]",
  "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05)]",
  "group-data-[orientation=horizontal]/attachment:group-data-[size=sm]/attachment:size-8 group-data-[size=sm]/attachment:rounded-[7px]",
  "group-data-[orientation=horizontal]/attachment:group-data-[size=xs]/attachment:size-6 group-data-[size=xs]/attachment:rounded-[6px]",
  "group-data-[orientation=vertical]/attachment:size-auto group-data-[orientation=vertical]/attachment:w-full",
  "group-data-[status=error]/attachment:bg-destructive/10 group-data-[status=error]/attachment:text-destructive",
  "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 group-data-[orientation=vertical]/attachment:[&_svg:not([class*='size-'])]:size-6 group-data-[size=xs]/attachment:[&_svg:not([class*='size-'])]:size-3.5",
  "data-[variant=image]:[&_img]:size-full data-[variant=image]:[&_img]:object-cover",
)
</script>

<template>
  <parts.Media :variant="props.variant" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Media>
</template>
