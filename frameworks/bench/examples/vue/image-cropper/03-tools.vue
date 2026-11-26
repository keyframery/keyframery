<script setup lang="ts">
// Rotate and flip
// `ImageCropperRotate` turns the photo a quarter at a time, and `ImageCropperFlip` mirrors it.

import { FlipHorizontal2, RotateCw } from "@lucide/vue"

import { ImageCropper, ImageCropperFlip, ImageCropperImage, ImageCropperRotate, ImageCropperSelection, ImageCropperViewport } from "@/components/keyframery/image-cropper"
</script>

<template>
  <ImageCropper
    src="/demo/cup.jpg"
    :aspect-ratio="4 / 3"
    aria-label="Crop photo"
    class="w-full max-w-[360px]"
  >
    <ImageCropperViewport>
      <ImageCropperImage alt="A coffee cup" />
      <ImageCropperSelection />
    </ImageCropperViewport>
    <div class="flex gap-2">
      <ImageCropperRotate aria-label="Rotate">
        <RotateCw />
      </ImageCropperRotate>
      <ImageCropperFlip aria-label="Flip">
        <FlipHorizontal2 />
      </ImageCropperFlip>
    </div>
  </ImageCropper>
</template>
