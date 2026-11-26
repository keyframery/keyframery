<script setup lang="ts">
// Box with handles
// Drag the selection to move it and its handles to resize it. `onCropChange` gives the crop in the image's own pixels.

import { ref } from "vue"

import {
  type ImageCrop,
  ImageCropper,
  ImageCropperGrid,
  ImageCropperHandle,
  ImageCropperImage,
  ImageCropperSelection,
  ImageCropperViewport,
} from "@/components/keyframery/image-cropper"

const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const

const crop = ref<ImageCrop>()
</script>

<template>
  <div class="flex w-full max-w-[380px] flex-col gap-2">
    <ImageCropper src="/demo/lake.jpg" aria-label="Crop photo" @crop-change="(v) => (crop = v)">
      <ImageCropperViewport>
        <ImageCropperImage alt="A lake between mountains" />
        <ImageCropperSelection>
          <ImageCropperGrid />
        </ImageCropperSelection>
        <!-- Handles go beside the selection, not inside it: UI SDK places them in viewport pixels. -->
        <ImageCropperHandle v-for="position in handles" :key="position" :position="position" />
      </ImageCropperViewport>
    </ImageCropper>
    <span class="text-[12px] text-muted-foreground tabular-nums">{{ crop ? `${Math.round(crop.width ?? 0)} × ${Math.round(crop.height ?? 0)} px` : 'Loading…' }}</span>
  </div>
</template>
