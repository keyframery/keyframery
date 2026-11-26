<script setup lang="ts">
// Autoplay
// `defaultPlaying` advances on its own every `interval` ms. `CarouselPlayToggle` pauses it, and `CarouselProgress` shows the time to the next slide.

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPlayToggle,
  CarouselProgress,
  CarouselViewport,
} from "@/components/keyframery/carousel"

const slides = ["/demo/food-1.jpg", "/demo/food-2.jpg", "/demo/food-3.jpg"]
</script>

<template>
  <Carousel default-playing :interval="3000" loop aria-label="Dishes" class="w-full max-w-[380px]">
    <CarouselViewport>
      <CarouselContent>
        <CarouselItem v-for="(src, i) in slides" :key="src" :aria-label="`Dish ${i + 1}`">
          <img
            :src="src"
            alt=""
            :draggable="false"
            class="aspect-video w-full rounded-[12px] bg-muted object-cover"
          />
        </CarouselItem>
      </CarouselContent>
    </CarouselViewport>
    <div class="flex items-center gap-3">
      <CarouselPlayToggle aria-label="Pause or play" />
      <CarouselProgress class="flex-1" />
    </div>
  </Carousel>
</template>
