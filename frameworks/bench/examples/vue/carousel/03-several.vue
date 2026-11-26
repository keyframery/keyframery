<script setup lang="ts">
// Several per page
// `slidesPerPage` shows more than one at a time, for product rows and galleries.

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselViewport } from "@/components/keyframery/carousel"

const items = ["Linen shirt", "Canvas tote", "Wool scarf", "Leather belt", "Cotton cap", "Silk tie"]
</script>

<template>
  <Carousel :slides-per-page="3" aria-label="Products" class="w-full max-w-[460px]">
    <CarouselViewport>
      <CarouselContent>
        <CarouselItem v-for="name in items" :key="name" :aria-label="name" class="basis-1/3 pr-2">
          <div class="grid aspect-square place-items-center rounded-[12px] bg-muted p-3 text-center text-[13px] font-medium">{{ name }}</div>
        </CarouselItem>
      </CarouselContent>
    </CarouselViewport>
    <div class="flex justify-end gap-2">
      <CarouselPrevious />
      <CarouselNext />
    </div>
  </Carousel>
</template>
