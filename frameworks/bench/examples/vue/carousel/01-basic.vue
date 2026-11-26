<script setup lang="ts">
// Basic
// Swipe, drag or use the buttons. Indicators show where you are and jump to a slide.

import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselIndicatorGroup,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselViewport,
} from "@/components/keyframery/carousel"

const photos = ["/demo/coast-1.jpg", "/demo/coast-2.jpg", "/demo/coast-3.jpg", "/demo/coast-4.jpg"]
</script>

<template>
  <Carousel aria-label="Photos" class="w-full max-w-[380px]">
    <CarouselViewport>
      <CarouselContent>
        <CarouselItem v-for="(src, i) in photos" :key="src" :aria-label="`Photo ${i + 1}`">
          <img
            :src="src"
            alt=""
            :draggable="false"
            class="aspect-[4/3] w-full rounded-[12px] bg-muted object-cover"
          />
        </CarouselItem>
      </CarouselContent>
    </CarouselViewport>
    <div class="flex items-center justify-between gap-4">
      <CarouselIndicatorGroup aria-label="Choose a photo">
        <CarouselIndicator
          v-for="(src, i) in photos"
          :key="src"
          :page="i + 1"
          :aria-label="`Photo ${i + 1}`"
        />
      </CarouselIndicatorGroup>
      <div class="flex gap-2">
        <CarouselPrevious />
        <CarouselNext />
      </div>
    </div>
  </Carousel>
</template>
