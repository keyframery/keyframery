<script setup lang="ts">
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselViewport } from "@/components/keyframery/carousel"
</script>

<template>
  <Carousel aria-label="Photos">
    <CarouselViewport>
      <CarouselContent>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </CarouselContent>
    </CarouselViewport>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
</template>
