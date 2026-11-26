<script setup lang="ts">
/* Mirrors src/demos/aspect-ratio.tsx at its default controls (16:10, 5 thumbnails). */
import { computed, ref } from "vue"

import { AspectRatio, AspectRatioImage } from "@/components/keyframery/aspect-ratio"

const photos = [
  { src: "/demo/coast-1.jpg", alt: "The cove below the cottage at low tide" },
  { src: "/demo/coast-2.jpg", alt: "Cliffs along the coast path toward Logan Rock" },
  { src: "/demo/coast-4.jpg", alt: "Porthcurno beach from the headland" },
  { src: "/demo/coast-5.jpg", alt: "Evening light over the bay" },
  { src: "/demo/lake.jpg", alt: "The lake a short drive inland" },
]
const current = ref(0)
const photo = computed(() => photos[current.value])
</script>

<template>
  <div class="@container w-full max-w-[420px]">
    <AspectRatio :ratio="16 / 10">
      <AspectRatioImage :src="photo.src" :alt="photo.alt" />
      <span class="absolute top-3 right-3 rounded-full bg-black/45 px-2 py-1 text-[11px] leading-none font-medium text-white tabular-nums backdrop-blur-md">{{ current + 1 }} / {{ photos.length }}</span>
    </AspectRatio>

    <div class="mt-2 grid gap-2" :style="{ gridTemplateColumns: `repeat(${photos.length}, minmax(0, 1fr))` }">
      <button
        v-for="(p, i) in photos"
        :key="p.src"
        type="button"
        :data-photo="i"
        :aria-label="`Show photo ${i + 1}`"
        :aria-current="i === current || undefined"
        class="cursor-pointer rounded-[10px] opacity-60 outline-none transition-[opacity,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.94] aria-current:opacity-100 motion-reduce:transition-none"
        @click="current = i"
      >
        <AspectRatio :ratio="1" class="rounded-[10px]">
          <AspectRatioImage :src="p.src" />
        </AspectRatio>
      </button>
    </div>

    <div class="mt-4 flex flex-col gap-2 @[340px]:flex-row @[340px]:items-baseline @[340px]:justify-between">
      <div class="min-w-0">
        <div class="text-[15px] font-semibold tracking-tight">Cliff cottage above Porthcurno</div>
        <div class="mt-1 text-[12px] text-muted-foreground">Cornwall · 2 bedrooms · sleeps 4</div>
      </div>
      <div class="shrink-0 text-[13px] text-muted-foreground tabular-nums"><span class="font-semibold text-foreground">£186</span> night</div>
    </div>
  </div>
</template>
