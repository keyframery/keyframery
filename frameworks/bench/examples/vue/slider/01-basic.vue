<script setup lang="ts">
// With a value
// `SliderValue` shows the number, and `format` takes `Intl.NumberFormat` options.

import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack, SliderValue } from "@/components/keyframery/slider"
</script>

<template>
  <Slider
    :default-value="0.6"
    :max="1"
    :step="0.05"
    :format="{ style: 'percent' }"
    class="w-full max-w-[280px]"
  >
    <div class="flex justify-between text-[13px]">
      <span id="volume-label" class="font-medium">Volume</span>
      <SliderValue class="text-muted-foreground" />
    </div>
    <SliderControl>
      <SliderTrack>
        <SliderIndicator />
        <SliderThumb aria-labelledby="volume-label" />
      </SliderTrack>
    </SliderControl>
  </Slider>
</template>
