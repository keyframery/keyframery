<script setup lang="ts">
import { ImageCropper, ImageCropperImage, ImageCropperSelection, ImageCropperViewport } from "@/components/keyframery/image-cropper"
</script>

<template>
  <ImageCropper src="/photo.jpg" aria-label="Crop photo">
    <ImageCropperViewport>
      <ImageCropperImage alt="" />
      <ImageCropperSelection />
    </ImageCropperViewport>
  </ImageCropper>
</template>
