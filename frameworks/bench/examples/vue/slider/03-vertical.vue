<script setup lang="ts">
// Vertical
// `orientation="vertical"` stands it up, for an equaliser or a zoom control.

import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack } from "@/components/keyframery/slider"
</script>

<template>
  <div class="flex h-[160px] gap-6">
    <Slider
      v-for="(value, i) in [40, 70, 55, 30]"
      :key="i"
      :default-value="value"
      orientation="vertical"
      :aria-label="`Band ${i + 1}`"
    >
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb />
        </SliderTrack>
      </SliderControl>
    </Slider>
  </div>
</template>
