<script setup lang="ts">
// Changing the ratio
// A new `ratio` is reached on a spring, so the frame reshapes instead of snapping.

import { ref } from "vue"

import { AspectRatio, AspectRatioImage } from "@/components/keyframery/aspect-ratio"
import { Button } from "@/components/keyframery/button"

const ratios = [
  { label: "Wide", value: 16 / 9 },
  { label: "Photo", value: 4 / 3 },
  { label: "Square", value: 1 },
]

const ratio = ref(16 / 9)
</script>

<template>
  <div class="flex w-full max-w-[360px] flex-col gap-3">
    <AspectRatio :ratio="ratio">
      <AspectRatioImage src="/demo/walk-18.jpg" alt="A path through the woods" />
    </AspectRatio>
    <div class="flex gap-2">
      <Button
        v-for="r in ratios"
        :key="r.label"
        size="sm"
        :variant="r.value === ratio ? 'primary' : 'default'"
        @click="ratio = r.value"
      >
        {{ r.label }}
      </Button>
    </div>
  </div>
</template>
