<script setup lang="ts">
// Range
// Pass two values for two thumbs. `minStepsBetweenThumbs` keeps them apart.

import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack, SliderValue } from "@/components/keyframery/slider"
</script>

<template>
  <Slider
    :default-value="[80, 240]"
    :min="0"
    :max="400"
    :step="10"
    :min-steps-between-thumbs="2"
    :format="{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }"
    class="w-full max-w-[280px]"
  >
    <div class="flex justify-between text-[13px]">
      <span class="font-medium">Price per night</span>
      <SliderValue class="text-muted-foreground" />
    </div>
    <SliderControl>
      <SliderTrack>
        <SliderIndicator />
        <SliderThumb :index="0" aria-label="Minimum price" />
        <SliderThumb :index="1" aria-label="Maximum price" />
      </SliderTrack>
    </SliderControl>
  </Slider>
</template>
